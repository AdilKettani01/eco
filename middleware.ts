import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractHashFromPath, isValidHashFormat } from './lib/session-hash';
import { prisma } from './lib/prisma';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // Extract hash from path
  const accessHash = extractHashFromPath(pathname);

  // If no hash in path, this is main domain - allow public routes
  if (!accessHash) {
    // Protect direct access to /admin/* and /dashboard on main domain
    if (pathname.startsWith('/admin') || pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Validate hash format
  if (!isValidHashFormat(accessHash)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check session token
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify session and hash match
  const session = await prisma.session.findFirst({
    where: {
      token: sessionToken,
      accessHash: accessHash,
    },
    include: { user: true },
  });

  if (!session || new Date() > session.expiresAt) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Determine rewrite path based on role and requested path
  const remainingPath = pathname.substring(accessHash.length + 1); // Remove /[hash]

  // Admin/Staff can only access /admin routes
  if (session.user.role === 'ADMIN' || session.user.role === 'STAFF') {
    if (!remainingPath.startsWith('/admin')) {
      return NextResponse.redirect(new URL(`/${accessHash}/admin/dashboard`, request.url));
    }
    // Rewrite /[hash]/admin/* to /admin/*
    url.pathname = remainingPath;
  } else {
    // Customers can only access /dashboard
    if (!remainingPath.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL(`/${accessHash}/dashboard`, request.url));
    }
    // Rewrite /[hash]/dashboard to /dashboard
    url.pathname = remainingPath;
  }

  const response = NextResponse.rewrite(url);
  response.headers.set('x-session-hash', accessHash);
  response.headers.set('x-user-role', session.user.role);

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (they handle auth separately)
     * - public pages (login, contacto, reservar, servicios, precios)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|login|contacto|reservar|servicios|precios).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractHashFromPath, isValidHashFormat } from './lib/session-hash';

export function middleware(request: NextRequest) {
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

  // Check session token exists
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Determine rewrite path based on requested path
  const remainingPath = pathname.substring(accessHash.length + 1); // Remove /[hash]

  // Rewrite hash-based paths to actual routes
  // Session validation will happen in the page components/API routes
  if (remainingPath.startsWith('/admin')) {
    // Rewrite /[hash]/admin/* to /admin/*
    url.pathname = remainingPath;
  } else if (remainingPath.startsWith('/dashboard')) {
    // Rewrite /[hash]/dashboard to /dashboard
    url.pathname = remainingPath;
  } else {
    // Invalid path after hash, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.rewrite(url);
  response.headers.set('x-session-hash', accessHash);

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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie (must match domain used when setting)
    if (process.env.NODE_ENV === 'production') {
      const domain = process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'ecolimpio.es';
      response.cookies.set('session_token', '', {
        maxAge: 0,
        domain: domain, // No leading dot - hash paths are on main domain
        path: '/',
      });
    } else {
      response.cookies.set('session_token', '', {
        maxAge: 0,
        domain: 'localhost',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateSessionToken, getSessionExpiry } from '@/lib/auth';
import { generateSessionHash, constructHashPathUrl } from '@/lib/session-hash';
import { RateLimiters, trackLoginAttempt, isAccountLocked } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const rateLimit = RateLimiters.login(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiados intentos de inicio de sesión. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if account is locked
    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${lockStatus.lockoutMinutes} minutos.` },
        { status: 423 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Track failed attempt even for non-existent users (prevent user enumeration timing attacks)
      trackLoginAttempt(email, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      // Track failed attempt
      const attemptResult = trackLoginAttempt(email, false);

      if (attemptResult.locked) {
        return NextResponse.json(
          { error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${attemptResult.lockoutMinutes} minutos.` },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: 'Invalid credentials',
          attemptsRemaining: attemptResult.attemptsRemaining,
        },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts
    trackLoginAttempt(email, true);

    // Generate session token
    const token = generateSessionToken();
    const expiresAt = getSessionExpiry(7); // 7 days

    let redirectUrl: string;
    let accessHash: string | null = null;

    // All authenticated users get unique hash path
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      accessHash = generateSessionHash();

      // Check if hash is already in use
      const existingSession = await prisma.session.findUnique({
        where: { accessHash },
      });

      if (!existingSession) {
        break; // Found a unique hash
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique session. Please try again.' },
        { status: 500 }
      );
    }

    // Construct hash-based URL
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      redirectUrl = constructHashPathUrl(accessHash!, '/admin/dashboard');
    } else {
      redirectUrl = constructHashPathUrl(accessHash!, '/dashboard');
    }

    // Create session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        accessHash: accessHash!,
        expiresAt,
      },
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    };

    // Set domain for hash-based paths (no wildcard subdomain support needed)
    if (process.env.NODE_ENV === 'production') {
      const domain = process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'ecolimpio.es';
      response.cookies.set('session_token', token, {
        ...cookieOptions,
        domain: domain, // No leading dot - hash paths are on main domain
      });
    } else {
      response.cookies.set('session_token', token, {
        ...cookieOptions,
        domain: 'localhost',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthResult {
  authenticated: boolean;
  user?: SessionUser;
  error?: string;
  status?: number;
}

/**
 * Verify session token and return user info
 * @param request - NextRequest object
 * @returns AuthResult with user data or error
 */
export async function verifySession(request: NextRequest): Promise<AuthResult> {
  const sessionToken = request.cookies.get('session_token')?.value;

  if (!sessionToken) {
    return {
      authenticated: false,
      error: 'No autorizado - Sesión requerida',
      status: 401,
    };
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      return {
        authenticated: false,
        error: 'Sesión inválida',
        status: 401,
      };
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });

      return {
        authenticated: false,
        error: 'Sesión expirada',
        status: 401,
      };
    }

    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
      },
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      authenticated: false,
      error: 'Error de autenticación',
      status: 500,
    };
  }
}

/**
 * Require authentication - returns error response if not authenticated
 * @param request - NextRequest object
 * @returns User data or NextResponse error
 */
export async function requireAuth(request: NextRequest): Promise<SessionUser | NextResponse> {
  const result = await verifySession(request);

  if (!result.authenticated) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return result.user!;
}

/**
 * Require specific roles - returns error response if not authorized
 * @param request - NextRequest object
 * @param allowedRoles - Array of allowed roles
 * @returns User data or NextResponse error
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<SessionUser | NextResponse> {
  const result = await verifySession(request);

  if (!result.authenticated) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  if (!allowedRoles.includes(result.user!.role)) {
    return NextResponse.json(
      { error: 'No tienes permisos para realizar esta acción' },
      { status: 403 }
    );
  }

  return result.user!;
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<SessionUser | NextResponse> {
  return requireRole(request, ['ADMIN']);
}

/**
 * Require admin or staff role
 */
export async function requireStaff(request: NextRequest): Promise<SessionUser | NextResponse> {
  return requireRole(request, ['ADMIN', 'STAFF']);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and errors
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate CUID format for IDs
 * @param id - ID to validate
 * @returns boolean
 */
export function isValidCuid(id: string): boolean {
  // CUID format: starts with 'c', followed by lowercase letters and numbers
  return /^c[a-z0-9]{24}$/.test(id);
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RateLimiters } from '@/lib/rate-limit';

// Track failed verification attempts per phone number
const failedAttempts = new Map<string, { count: number; lockedUntil?: number }>();

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const rateLimit = RateLimiters.smsCode(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Teléfono y código son obligatorios' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanedPhone = phone.replace(/\s/g, '');

    // Validate phone format
    const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Formato de código inválido' },
        { status: 400 }
      );
    }

    // Check for too many failed attempts
    const attempts = failedAttempts.get(cleanedPhone);
    const now = Date.now();

    if (attempts?.lockedUntil && now < attempts.lockedUntil) {
      const waitMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Espera ${waitMinutes} minutos.` },
        { status: 429 }
      );
    }

    // Find the verification code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanedPhone,
        code,
        verified: false,
      },
    });

    if (!verification) {
      // Track failed attempt
      const currentAttempts = (attempts?.count || 0) + 1;
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (currentAttempts >= maxAttempts) {
        failedAttempts.set(cleanedPhone, {
          count: currentAttempts,
          lockedUntil: now + lockoutDuration,
        });
        return NextResponse.json(
          { error: 'Demasiados intentos fallidos. Espera 15 minutos.' },
          { status: 429 }
        );
      }

      failedAttempts.set(cleanedPhone, { count: currentAttempts });

      return NextResponse.json(
        {
          error: 'Código incorrecto',
          attemptsRemaining: maxAttempts - currentAttempts,
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      // Delete expired code
      await prisma.verificationCode.delete({
        where: { id: verification.id },
      });

      return NextResponse.json(
        { error: 'El código ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Clear failed attempts on successful verification
    failedAttempts.delete(cleanedPhone);

    // Mark code as verified
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Teléfono verificado correctamente',
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Error al verificar el código' },
      { status: 500 }
    );
  }
}

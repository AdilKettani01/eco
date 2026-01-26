import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RateLimiters } from '@/lib/rate-limit';

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verify Google reCAPTCHA token
async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('CRITICAL: RECAPTCHA_SECRET_KEY not configured');
    // In production, always fail if not configured
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    // In development, warn but allow (for testing only)
    console.warn('⚠️ Development mode: Captcha verification skipped (configure RECAPTCHA_SECRET_KEY)');
    return true;
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Captcha verification error:', error);
    return false;
  }
}

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
    const { phone, captchaToken } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'El número de teléfono es obligatorio' },
        { status: 400 }
      );
    }

    // Validate phone format (Spanish phone numbers)
    const cleanedPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    // Verify captcha
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Verificación de seguridad requerida' },
        { status: 400 }
      );
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'Verificación de seguridad fallida. Recarga la página.' },
        { status: 400 }
      );
    }

    // Rate limiting: Check if a code was sent recently (within 1 minute)
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanedPhone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // 1 minute ago
        },
      },
    });

    if (recentCode) {
      return NextResponse.json(
        { error: 'Espera 1 minuto antes de solicitar otro código' },
        { status: 429 }
      );
    }

    // Delete any existing codes for this phone
    await prisma.verificationCode.deleteMany({
      where: { phone: cleanedPhone },
    });

    // Generate new code
    const code = generateCode();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save code to database
    await prisma.verificationCode.create({
      data: {
        phone: cleanedPhone,
        code,
        expiresAt,
      },
    });

    // TODO: Integrate with real SMS service (Twilio, etc.)
    // For now, log the code to console in development ONLY
    // SECURITY: Never expose code in API response - only in server logs
    if (process.env.NODE_ENV === 'development') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 Verification code for ${cleanedPhone}: ${code}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // In production, you would send the SMS here:
    // await sendSMS(cleanedPhone, `Tu código de verificación EcoLimpio es: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Código enviado correctamente',
      // SECURITY: Code is NEVER returned in response - check server logs in development
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RateLimiters } from '@/lib/rate-limit';
import { sendSMS, isValidPhoneNumber } from '@/lib/sms';

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verify Google reCAPTCHA v3 token
async function verifyCaptcha(token: string, expectedAction: string = 'send_code'): Promise<boolean> {
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

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 0.0 = very likely a bot, 1.0 = very likely a human
    // Common threshold is 0.5, but you can adjust based on your needs
    const SCORE_THRESHOLD = 0.5;

    if (process.env.NODE_ENV === 'development') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔒 reCAPTCHA v3 Verification:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Score: ${data.score} (threshold: ${SCORE_THRESHOLD})`);
      console.log(`   Action: ${data.action} (expected: ${expectedAction})`);
      console.log(`   Hostname: ${data.hostname}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // Check if verification was successful, score is above threshold, and action matches
    return (
      data.success === true &&
      data.score >= SCORE_THRESHOLD &&
      data.action === expectedAction
    );
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
    let cleanedPhone = phone.replace(/\s/g, '');

    // Convert to E.164 format if Spanish number without country code
    if (/^[6-9]\d{8}$/.test(cleanedPhone)) {
      cleanedPhone = '+34' + cleanedPhone;
    }

    // Validate E.164 format
    const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    // Ensure it starts with +34
    if (!cleanedPhone.startsWith('+')) {
      cleanedPhone = '+34' + cleanedPhone.replace(/^34/, '');
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

    // Send SMS via MessageBird
    const smsMessage = `Tu código de verificación EcoLimpio es: ${code}. Válido por 10 minutos.`;
    const smsResult = await sendSMS(cleanedPhone, smsMessage);

    // Always log the code if SMS fails or is not configured
    if (!smsResult.success || process.env.NODE_ENV === 'development') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 Verification code for ${cleanedPhone}: ${code}`);
      console.log(`📨 SMS Status: ${smsResult.success ? '✅ Sent' : '❌ Failed/Not Configured'}`);
      if (smsResult.messageId) {
        console.log(`📋 Message ID: ${smsResult.messageId}`);
      }
      if (smsResult.error) {
        console.log(`⚠️ Error: ${smsResult.error}`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // If MessageBird is not configured, still allow the flow to continue
    // The code is saved in the database and logged to console
    // This allows testing without SMS service
    const messageBirdConfigured = !!process.env.MESSAGEBIRD_API_KEY;

    if (!messageBirdConfigured) {
      console.warn('⚠️ MessageBird not configured - code logged above. Configure MESSAGEBIRD_API_KEY for production SMS.');
    }

    // Return success even if SMS failed when MessageBird is not configured
    // This allows the verification flow to continue
    return NextResponse.json({
      success: true,
      message: messageBirdConfigured && smsResult.success
        ? 'Código enviado correctamente'
        : 'Código generado (revisa los logs del servidor)',
      // SECURITY: Code is NEVER returned in response - check server logs
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { RateLimiters } from '@/lib/rate-limit';
import { sendEmail, isValidEmail } from '@/lib/email';

const RESET_TOKEN_TTL_MINUTES = 30;
const RESEND_WINDOW_MINUTES = 10;

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function buildResetEmailHtml(params: {
  name: string;
  resetUrl: string;
  minutes: number;
}): string {
  const { name, resetUrl, minutes } = params;
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f6f7f9; padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:24px 28px;background:#064e3b;color:#ffffff;">
          <h1 style="margin:0;font-size:22px;">EcoLimpio</h1>
          <p style="margin:6px 0 0;color:#d1fae5;font-size:14px;">Restablecimiento de contraseña</p>
        </div>
        <div style="padding:28px;color:#111827;">
          <p style="margin:0 0 12px;font-size:16px;">Hola ${escapeHtml(name || 'cliente')},</p>
          <p style="margin:0 0 16px;line-height:1.5;">
            Hemos recibido una solicitud para restablecer tu contraseña. Puedes crear una nueva aquí:
          </p>
          <p style="margin:0 0 20px;">
            <a href="${resetUrl}" style="background:#059669;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;display:inline-block;font-weight:600;">
              Restablecer contraseña
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">
            Este enlace caduca en ${minutes} minutos.
          </p>
          <p style="margin:0;font-size:14px;color:#4b5563;">
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
        </div>
        <div style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px;">
          EcoLimpio • Barcelona
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = RateLimiters.passwordReset(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'El email es obligatorio' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const genericResponse = {
      success: true,
      message: 'Si existe una cuenta con ese correo, enviaremos un enlace de recuperación.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        createdAt: {
          gte: new Date(Date.now() - RESEND_WINDOW_MINUTES * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentToken) {
      return NextResponse.json(genericResponse);
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = generateResetToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ecolimpio.es').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const emailHtml = buildResetEmailHtml({
      name: user.name,
      resetUrl,
      minutes: RESET_TOKEN_TTL_MINUTES,
    });

    const emailResult = await sendEmail(
      user.email,
      'Restablece tu contraseña en EcoLimpio',
      emailHtml
    );

    if (!emailResult.success) {
      console.error('❌ Password reset email failed:', emailResult.error);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 Password reset URL: ${resetUrl}`);
      }
    }

    if (!process.env.BIRD_API_KEY) {
      console.warn('⚠️ Bird API key not configured - reset link logged in development only.');
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

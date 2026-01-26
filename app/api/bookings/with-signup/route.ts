import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/auth-guard';
import { RateLimiters } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = RateLimiters.booking(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      // User data
      name,
      email,
      password,
      phone,
      // Booking data
      services,
      date,
      time,
      address,
      notes,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Todos los campos de usuario son obligatorios' },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services) || services.length === 0 || !date || !time || !address) {
      return NextResponse.json(
        { error: 'Todos los campos de reserva son obligatorios' },
        { status: 400 }
      );
    }

    // Validate services (only allow known service IDs)
    const validServices = ['vehiculos', 'entradas', 'ventanas', 'pack'];
    const invalidServices = services.filter((s: string) => !validServices.includes(s));
    if (invalidServices.length > 0) {
      return NextResponse.json(
        { error: 'Selección de servicio inválida' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre es demasiado largo (máximo 100 caracteres)' },
        { status: 400 }
      );
    }

    if (address.length > 500) {
      return NextResponse.json(
        { error: 'La dirección es demasiado larga (máximo 500 caracteres)' },
        { status: 400 }
      );
    }

    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { error: 'Las notas son demasiado largas (máximo 1000 caracteres)' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate <= today) {
      return NextResponse.json(
        { error: 'La fecha debe ser en el futuro' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanedPhone = phone.replace(/\s/g, '');

    // Validate phone format (Spanish phone numbers)
    const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    // Check if phone was verified
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: cleanedPhone,
        verified: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'El teléfono no ha sido verificado' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. Por favor, inicia sesión.' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and booking in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name: sanitize(name),
          role: 'CUSTOMER',
        },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          services,
          date: bookingDate,
          time: sanitize(time),
          name: sanitize(name),
          email: email.toLowerCase().trim(),
          phone: cleanedPhone,
          address: sanitize(address),
          notes: notes ? sanitize(notes) : null,
          status: 'PENDING',
        },
      });

      // Delete verification code (cleanup)
      await tx.verificationCode.delete({
        where: { id: verification.id },
      });

      return { user, booking };
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada y reserva realizada correctamente',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      booking: {
        id: result.booking.id,
        services: result.booking.services,
        date: result.booking.date,
        time: result.booking.time,
      },
    });
  } catch (error) {
    console.error('Error creating account and booking:', error);
    return NextResponse.json(
      { error: 'Error al crear la cuenta y la reserva' },
      { status: 500 }
    );
  }
}

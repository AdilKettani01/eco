import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth-guard';
import { RateLimiters } from '@/lib/rate-limit';

// GET /api/bookings - List all bookings (Admin/Staff only)
export async function GET(request: NextRequest) {
  try {
    // Require admin or staff authentication
    const authResult = await requireStaff(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query filter
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking (public with rate limiting)
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
      services,
      date,
      time,
      name,
      email,
      phone,
      address,
      notes,
    } = body;

    // Validate required fields
    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service is required' },
        { status: 400 }
      );
    }

    // Validate services (only allow known service IDs)
    const validServices = ['vehiculos', 'entradas', 'ventanas', 'pack'];
    const invalidServices = services.filter((s: string) => !validServices.includes(s));
    if (invalidServices.length > 0) {
      return NextResponse.json(
        { error: 'Invalid service selection' },
        { status: 400 }
      );
    }

    if (!date || !time || !name || !email || !phone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        { error: 'Invalid email format' },
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

    // Sanitize inputs
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        services,
        date: bookingDate,
        time: sanitize(time),
        name: sanitize(name),
        email: email.toLowerCase().trim(),
        phone: sanitize(phone),
        address: sanitize(address),
        notes: notes ? sanitize(notes) : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

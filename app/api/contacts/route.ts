import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth-guard';
import { RateLimiters } from '@/lib/rate-limit';

// GET /api/contacts - List all contact messages (Admin/Staff only)
export async function GET(request: NextRequest) {
  try {
    // Require admin or staff authentication
    const authResult = await requireStaff(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query filter
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Fetch contacts
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      contacts,
      count: contacts.length,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact message (public with rate limiting)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = RateLimiters.contactForm(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
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

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'El mensaje es demasiado largo (máximo 2000 caracteres)' },
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

    // Sanitize inputs (basic XSS prevention)
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        name: sanitize(name),
        email: email.toLowerCase().trim(),
        phone: sanitize(phone),
        service: service ? sanitize(service) : null,
        message: sanitize(message),
        status: 'NEW',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact message sent successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to send contact message' },
      { status: 500 }
    );
  }
}

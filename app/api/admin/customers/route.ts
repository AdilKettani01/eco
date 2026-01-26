import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth-guard';

export async function GET(request: NextRequest) {
  try {
    // Require admin or staff authentication
    const authResult = await requireStaff(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Validate search length to prevent excessive queries
    if (search.length > 100) {
      return NextResponse.json(
        { error: 'Búsqueda demasiado larga' },
        { status: 400 }
      );
    }

    // Sanitize search input
    const sanitizedSearch = search.replace(/<[^>]*>/g, '').trim();

    // Fetch customers with their booking counts
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(sanitizedSearch && {
          OR: [
            { name: { contains: sanitizedSearch } },
            { email: { contains: sanitizedSearch } },
          ],
        }),
      },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for frontend
    const transformedCustomers = customers.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
      totalBookings: customer._count.bookings,
      lastBooking: customer.bookings[0] || null,
    }));

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

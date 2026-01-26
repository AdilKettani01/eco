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

    // Get counts
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalContacts,
      newContacts,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'NEW' } }),
    ]);

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        services: true,
        date: true,
        status: true,
        createdAt: true,
      },
    });

    // Get recent contacts
    const recentContacts = await prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    // Get bookings by service (count occurrences)
    const allBookings = await prisma.booking.findMany({
      select: { services: true },
    });

    const serviceStats: Record<string, number> = {};
    allBookings.forEach((booking: any) => {
      const services = booking.services as string[] | null;
      if (services && Array.isArray(services)) {
        services.forEach((service) => {
          serviceStats[service] = (serviceStats[service] || 0) + 1;
        });
      }
    });

    // Get bookings trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookingsTrend = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      stats: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
        },
        contacts: {
          total: totalContacts,
          new: newContacts,
        },
        recentBookings,
        recentContacts,
        serviceStats,
        bookingsTrend: bookingsTrend.length,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff, requireAdmin, isValidCuid } from '@/lib/auth-guard';

// GET /api/bookings/[id] - Get a single booking (Admin/Staff only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require admin or staff authentication
    const authResult = await requireStaff(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Validate ID format
    if (!isValidCuid(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
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

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update a booking (Admin/Staff only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require admin or staff authentication
    const authResult = await requireStaff(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Validate ID format
    if (!isValidCuid(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes, date, time } = body;

    // Validate status if provided
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate notes length
    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { error: 'Las notas son demasiado largas (máximo 1000 caracteres)' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes ? sanitize(notes) : null;
    }
    if (date) {
      updateData.date = new Date(date);
    }
    if (time) {
      updateData.time = sanitize(time);
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require admin authentication for delete
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Validate ID format
    if (!isValidCuid(id)) {
      return NextResponse.json(
        { error: 'ID de reserva inválido' },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting booking:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

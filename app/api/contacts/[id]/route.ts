import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff, requireAdmin, isValidCuid } from '@/lib/auth-guard';

// GET /api/contacts/[id] - Get a single contact (Admin/Staff only)
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
        { error: 'ID de contacto inválido' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

// PATCH /api/contacts/[id] - Update a contact (Admin/Staff only)
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
        { error: 'ID de contacto inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status if provided
    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      contact,
      message: 'Contact updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating contact:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a contact (Admin only)
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
        { error: 'ID de contacto inválido' },
        { status: 400 }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting contact:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}

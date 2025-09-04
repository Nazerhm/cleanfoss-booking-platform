import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID er påkrævet' },
        { status: 400 }
      );
    }

    console.log(`Fetching booking details for ID: ${bookingId}`);

    // Fetch booking from database
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: {
          include: {
            brand: true,
            model: true
          }
        },
        services: {
          include: {
            service: true
          }
        },
        location: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking ikke fundet' },
        { status: 404 }
      );
    }

    // Format booking data for frontend
    const bookingDetails = {
      id: booking.id,
      customerInfo: {
        name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone || ''
      },
      pricing: {
        total: booking.totalPrice
      },
      service: {
        name: booking.services[0]?.service?.name || 'Service'
      },
      vehicle: {
        make: booking.vehicle?.brand?.name || 'Standard',
        model: booking.vehicle?.model?.name || 'Bil'
      },
      selectedDateTime: booking.scheduledAt.toISOString(),
      status: booking.status,
      specialRequests: booking.notes
    };

    return NextResponse.json({
      success: true,
      booking: bookingDetails
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { success: false, error: 'Intern serverfejl' },
      { status: 500 }
    );
  }
}

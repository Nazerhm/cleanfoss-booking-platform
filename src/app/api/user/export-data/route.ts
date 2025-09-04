import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';

// GET /api/user/export-data - Export user data
async function exportUserData(req: NextRequest, userId: string) {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        language: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        services: {
          include: {
            service: {
              select: {
                name: true,
                description: true,
                duration: true,
                price: true,
              },
            },
          },
        },
        vehicle: {
          include: {
            brand: true,
            model: true,
          },
        },
        location: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user's vehicles
    const vehicles = await prisma.customerVehicle.findMany({
      where: { customerId: userId },
      include: {
        brand: true,
        model: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Prepare export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        accountCreated: user.createdAt.toISOString(),
        lastUpdated: user.updatedAt.toISOString(),
      },
      bookings: bookings.map(booking => ({
        id: booking.id,
        status: booking.status,
        scheduledAt: booking.scheduledAt.toISOString(),
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        services: booking.services.map(bs => ({
          name: bs.service?.name,
          description: bs.service?.description,
          quantity: bs.quantity,
          unitPrice: bs.unitPrice,
          totalPrice: bs.totalPrice,
          duration: bs.service?.duration,
        })),
        vehicle: booking.vehicle ? {
          make: booking.vehicle.brand.name,
          model: booking.vehicle.model.name,
          year: booking.vehicle.year,
          color: booking.vehicle.color,
          licensePlate: booking.vehicle.licensePlate,
        } : null,
        location: booking.location ? {
          name: booking.location.name,
          address: booking.location.address,
          city: booking.location.city,
          postalCode: booking.location.postalCode,
        } : null,
        payments: booking.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt.toISOString(),
        })),
      })),
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.brand.name,
        model: vehicle.model.name,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        nickname: vehicle.nickname,
        addedAt: vehicle.createdAt.toISOString(),
        lastUpdated: vehicle.updatedAt.toISOString(),
      })),
      statistics: {
        totalBookings: bookings.length,
        totalVehicles: vehicles.length,
        totalAmountSpent: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
        firstBooking: bookings.length > 0 ? bookings[bookings.length - 1].createdAt.toISOString() : null,
        lastBooking: bookings.length > 0 ? bookings[0].createdAt.toISOString() : null,
      },
    };

    // Return as JSON file download
    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="cleanfoss-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export data' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(exportUserData);

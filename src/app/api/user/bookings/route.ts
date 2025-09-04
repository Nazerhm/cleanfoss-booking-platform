import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';

// GET /api/user/bookings - Get current user's booking history
async function getUserBookings(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      customerId: request.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    // If user has company, only show bookings from their company
    if (request.user.companyId) {
      whereClause.companyId = request.user.companyId;
    }

    // Get bookings with basic information
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        duration: true,
        totalPrice: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        vehicle: {
          select: {
            id: true,
            color: true,
            licensePlate: true,
            brand: {
              select: {
                name: true,
              },
            },
            model: {
              select: {
                name: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
        services: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                duration: true,
                price: true,
              },
            },
          },
        },
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
    });

    // Get total count for pagination
    const totalCount = await prisma.booking.count({
      where: whereClause,
    });

    // Transform data for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      duration: booking.duration,
      totalPrice: booking.totalPrice,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      services: booking.services.map(bs => ({
        id: bs.service?.id,
        name: bs.service?.name,
        description: bs.service?.description,
        duration: bs.service?.duration,
        price: bs.service?.price,
        quantity: bs.quantity,
        unitPrice: bs.unitPrice,
        totalPrice: bs.totalPrice,
      })),
      vehicle: booking.vehicle ? {
        id: booking.vehicle.id,
        make: booking.vehicle.brand?.name || 'Unknown',
        model: booking.vehicle.model?.name || 'Unknown',
        color: booking.vehicle.color,
        licensePlate: booking.vehicle.licensePlate,
      } : null,
      location: booking.location,
      payments: booking.payments,
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + bookings.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Export protected handler
export const GET = withAuth(getUserBookings);

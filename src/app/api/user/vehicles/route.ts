import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';

// GET /api/user/vehicles - Get user's saved vehicles
async function getUserVehicles(req: NextRequest, userId: string) {
  try {
    const vehicles = await prisma.customerVehicle.findMany({
      where: { customerId: userId },
      include: {
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
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        vehicles,
      },
    });
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/user/vehicles - Add new vehicle for user
async function addUserVehicle(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const { 
      brandId, 
      modelId, 
      year, 
      color, 
      licensePlate, 
      nickname, 
      isDefault 
    } = body;

    if (!brandId || !modelId) {
      return NextResponse.json(
        { success: false, message: 'Brand and model are required' },
        { status: 400 }
      );
    }

    // Get user's company ID for multi-tenant support
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { success: false, message: 'User company not found' },
        { status: 404 }
      );
    }

    // If this should be the default vehicle, unset other defaults
    if (isDefault) {
      await prisma.customerVehicle.updateMany({
        where: { 
          customerId: userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const vehicle = await prisma.customerVehicle.create({
      data: {
        customerId: userId,
        companyId: user.companyId,
        brandId,
        modelId,
        year: year ? parseInt(year) : null,
        color,
        licensePlate,
        nickname,
        isDefault: isDefault || false,
      },
      include: {
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
    });

    return NextResponse.json({
      success: true,
      data: { vehicle },
    });
  } catch (error) {
    console.error('Error adding user vehicle:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add vehicle' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUserVehicles);
export const POST = withAuth(addUserVehicle);

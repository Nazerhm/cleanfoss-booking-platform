import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for vehicle creation
const CreateVehicleSchema = z.object({
  customerId: z.string(),
  brandId: z.string(),
  modelId: z.string(),
  licensePlate: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  companyId: z.string(),
});

// Schema for vehicle update
const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  id: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const companyId = searchParams.get('companyId');

    if (!customerId || !companyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'customerId and companyId are required' 
        },
        { status: 400 }
      );
    }

    // Fetch customer vehicles with brand and model information
    const vehicles = await prisma.customerVehicle.findMany({
      where: {
        customerId,
        companyId,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        },
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            vehicleType: true,
            vehicleSize: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: vehicles,
      total: vehicles.length,
    });

  } catch (error) {
    console.error('Vehicles GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicles' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateVehicleSchema.parse(body);

    // Check if license plate already exists for this company
    const existingVehicle = await prisma.customerVehicle.findFirst({
      where: {
        licensePlate: validatedData.licensePlate,
        companyId: validatedData.companyId,
      }
    });

    if (existingVehicle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vehicle with this license plate already exists' 
        },
        { status: 409 }
      );
    }

    // Create the vehicle
    const vehicle = await prisma.customerVehicle.create({
      data: validatedData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        },
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            vehicleType: true,
            vehicleSize: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
    }, { status: 201 });

  } catch (error) {
    console.error('Vehicles POST Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid vehicle data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create vehicle' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateVehicleSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Check if vehicle exists and belongs to the customer
    const existingVehicle = await prisma.customerVehicle.findUnique({
      where: { id }
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vehicle not found' 
        },
        { status: 404 }
      );
    }

    // Update the vehicle
    const vehicle = await prisma.customerVehicle.update({
      where: { id },
      data: updateData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        },
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            vehicleType: true,
            vehicleSize: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
    });

  } catch (error) {
    console.error('Vehicles PUT Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid vehicle data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update vehicle' 
      },
      { status: 500 }
    );
  }
}

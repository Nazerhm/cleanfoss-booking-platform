import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdmin, withCompanyScope, AuthenticatedRequest } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';

// Schema for creating/updating services
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  deposit: z.number().min(0, 'Deposit must be non-negative').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  image: z.string().url().optional(),
  backgroundColor: z.string().optional(),
  categoryId: z.string().optional(),
  minCapacity: z.number().min(1).default(1),
  maxCapacity: z.number().min(1).default(1),
});

// GET /api/admin/services - List company services (Admin+)
async function getServices(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'ACTIVE';
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      companyId: request.user.companyId,
      status,
    };

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get services with related data
    const services = await prisma.service.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        extras: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
        _count: {
          select: {
            bookingServices: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.service.count({
      where: whereClause,
    });

    // Transform data for response
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      deposit: service.deposit,
      duration: service.duration,
      image: service.image,
      backgroundColor: service.backgroundColor,
      status: service.status,
      minCapacity: service.minCapacity,
      maxCapacity: service.maxCapacity,
      category: service.category,
      extras: service.extras,
      bookingCount: service._count.bookingServices,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        services: formattedServices,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + services.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/admin/services - Create service (Admin+)
async function createService(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    // Check if service name already exists in company
    const existingService = await prisma.service.findFirst({
      where: {
        name: validatedData.name,
        companyId: request.user.companyId,
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 409 }
      );
    }

    // Validate category if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          companyId: request.user.companyId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found or not accessible' },
          { status: 400 }
        );
      }
    }

    // Create service
    const newService = await prisma.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        deposit: validatedData.deposit,
        duration: validatedData.duration,
        image: validatedData.image,
        backgroundColor: validatedData.backgroundColor,
        categoryId: validatedData.categoryId,
        minCapacity: validatedData.minCapacity,
        maxCapacity: validatedData.maxCapacity,
        companyId: request.user.companyId!,
        status: 'ACTIVE',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        extras: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: { service: newService },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = withCompanyScope(getServices);
export const POST = withAdmin(createService);

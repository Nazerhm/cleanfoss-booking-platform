import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'companyId is required' 
        },
        { status: 400 }
      );
    }

    // Fetch car brands for the company
    const brands = await prisma.carBrand.findMany({
      where: {
        companyId,
        status: 'ACTIVE'
      },
      include: {
        models: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            name: true,
            slug: true,
            vehicleType: true,
            vehicleSize: true,
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: brands,
      total: brands.length,
    });

  } catch (error) {
    console.error('Car Brands API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch car brands' 
      },
      { status: 500 }
    );
  }
}

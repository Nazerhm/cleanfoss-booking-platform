import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple test endpoint to create minimal test data for booking flow
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Test data creation only available in development' },
      { status: 403 }
    );
  }

  try {
    console.log('Creating minimal test data...');

    // 1. Create license first
    const license = await prisma.license.upsert({
      where: { id: 'test-license' },
      update: {},
      create: {
        id: 'test-license',
        key: 'TEST-LICENSE-KEY',
        type: 'YEARLY',
        status: 'ACTIVE',
        maxUsers: 10,
        maxLocations: 5,
        maxAgents: 20,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // 2. Create company
    const company = await prisma.company.upsert({
      where: { id: 'test-company' },
      update: {},
      create: {
        id: 'test-company',
        name: 'Test CleanFoss',
        slug: 'test-cleanfoss',
        email: 'test@cleanfoss.dk',
        phone: '+45 12 34 56 78',
        licenseId: license.id,
      },
    });

    // 3. Create test customer
    const customer = await prisma.user.upsert({
      where: { email: 'test@customer.dk' },
      update: {},
      create: {
        id: 'test-customer',
        name: 'Test Customer',
        email: 'test@customer.dk',
        phone: '+45 12 34 56 78',
        role: 'CUSTOMER',
        companyId: company.id,
      },
    });

    // 3. Create car brand and model
    const brand = await prisma.carBrand.upsert({
      where: { id: 'toyota' },
      update: {},
      create: {
        id: 'toyota',
        name: 'Toyota',
        slug: 'toyota',
        companyId: company.id,
      },
    });

    const model = await prisma.carModel.upsert({
      where: { id: 'corolla' },
      update: {},
      create: {
        id: 'corolla',
        name: 'Corolla',
        slug: 'corolla',
        vehicleType: 'SEDAN',
        vehicleSize: 'MEDIUM',
        brandId: brand.id,
        companyId: company.id,
      },
    });

    // 4. Create customer vehicle
    const vehicle = await prisma.customerVehicle.upsert({
      where: { id: 'test-vehicle' },
      update: {},
      create: {
        id: 'test-vehicle',
        year: 2020,
        color: 'Sort',
        licensePlate: 'AB12345',
        isDefault: true,
        customerId: customer.id,
        brandId: brand.id,
        modelId: model.id,
        companyId: company.id,
      },
    });

    // 5. Create basic service
    const service = await prisma.service.upsert({
      where: { id: 'basic-wash' },
      update: {},
      create: {
        id: 'basic-wash',
        name: 'Basic vask',
        description: 'Standard bilrengøring',
        price: 299.0,
        duration: 120,
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    // 6. Create service extra
    const extra = await prisma.serviceExtra.upsert({
      where: { id: 'wax-extra' },
      update: {},
      create: {
        id: 'wax-extra',
        name: 'Voksbehandling',
        description: 'Ekstra beskyttelse med voks',
        price: 99.0,
        duration: 30,
        serviceId: service.id,
        companyId: company.id,
      },
    });

    console.log('Test data created successfully!');

    return NextResponse.json({
      success: true,
      data: {
        company: company.id,
        customer: customer.id,
        vehicle: vehicle.id,
        service: service.id,
        extra: extra.id,
      },
      message: 'Test data created successfully',
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create test data',
      },
      { status: 500 }
    );
  }
}

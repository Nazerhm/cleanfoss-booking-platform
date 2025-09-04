import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Seeding only available in development' },
      { status: 403 }
    );
  }

  try {
    console.log('Starting database seeding...');

    // Create default license first
    const license = await prisma.license.upsert({
      where: { id: 'default-license' },
      update: {},
      create: {
        id: 'default-license',
        key: 'DEFAULT-LICENSE-KEY',
        type: 'YEARLY',
        status: 'ACTIVE',
        maxUsers: 10,
        maxLocations: 5,
        maxAgents: 20,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });

    // Create default company
    const company = await prisma.company.upsert({
      where: { id: 'default-company' },
      update: {},
      create: {
        id: 'default-company',
        name: 'CleanFoss',
        slug: 'cleanfoss',
        email: 'info@cleanfoss.dk',
        phone: '+45 12 34 56 78',
        licenseId: license.id,
      },
    });

    console.log('Company created:', company.id);

    // Create car brands
    const toyotaBrand = await prisma.carBrand.upsert({
      where: { id: 'toyota-brand' },
      update: {},
      create: {
        id: 'toyota-brand',
        name: 'Toyota',
        slug: 'toyota',
        logo: 'https://www.toyota.dk/images/toyota-logo.png',
        companyId: company.id,
      },
    });

    // Create car models
    const corollaModel = await prisma.carModel.upsert({
      where: { id: 'corolla-model' },
      update: {},
      create: {
        id: 'corolla-model',
        name: 'Corolla',
        slug: 'corolla',
        vehicleType: 'SEDAN',
        vehicleSize: 'SMALL',
        brandId: toyotaBrand.id,
        companyId: company.id,
      },
    });

    // Create test customer
    const customer = await prisma.user.upsert({
      where: { email: 'test@cleanfoss.dk' },
      update: {},
      create: {
        name: 'Test Kunde',
        email: 'test@cleanfoss.dk',
        phone: '+45 12 34 56 78',
        role: 'CUSTOMER',
        companyId: company.id,
      },
    });

    console.log('Customer created:', customer.id);

    // Create test vehicle
    const vehicle = await prisma.customerVehicle.upsert({
      where: { id: 'test-vehicle-1' },
      update: {},
      create: {
        id: 'test-vehicle-1',
        year: 2020,
        color: 'Sort',
        licensePlate: 'AB12345',
        nickname: 'Min Toyota',
        isDefault: true,
        companyId: company.id,
        customerId: customer.id,
        brandId: toyotaBrand.id,
        modelId: corollaModel.id,
      },
    });

    console.log('Vehicle created:', vehicle.id);

    // Create test location
    const location = await prisma.location.upsert({
      where: { id: 'test-location-1' },
      update: {},
      create: {
        id: 'test-location-1',
        name: 'Test Location',
        address: 'Testgade 1',
        city: 'København',
        postalCode: '2100',
        country: 'Denmark',
        companyId: company.id,
      },
    });

    console.log('Location created:', location.id);

    // Create basic wash service
    const basicWash = await prisma.service.upsert({
      where: { id: 'basic-wash-service' },
      update: {},
      create: {
        id: 'basic-wash-service',
        name: 'Basis Bilvask',
        description: 'Udvendig vask og støvsugning',
        price: 299.00,
        duration: 60,
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    // Create service extras
    const waxExtra = await prisma.serviceExtra.upsert({
      where: { id: 'wax-extra' },
      update: {},
      create: {
        id: 'wax-extra',
        name: 'Voks behandling',
        description: 'Beskyttende voks på bilens lak',
        price: 199.00,
        duration: 30,
        serviceId: basicWash.id,
        companyId: company.id,
      },
    });

    const interiorExtra = await prisma.serviceExtra.upsert({
      where: { id: 'interior-extra' },
      update: {},
      create: {
        id: 'interior-extra',
        name: 'Indvendig rengøring',
        description: 'Grundig rengøring af bilens interiør',
        price: 149.00,
        duration: 45,
        serviceId: basicWash.id,
        companyId: company.id,
      },
    });

    console.log('Services and extras created');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        companyId: company.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceId: basicWash.id,
        extras: [waxExtra.id, interiorExtra.id],
      },
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

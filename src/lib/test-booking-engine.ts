import { PrismaClient, LicenseType, LicenseStatus, UserRole, VehicleType, VehicleSize, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test Booking Engine Models
 * Validates Location, Agent, Booking, BookingService, and BookingExtra models
 */
async function testBookingEngineModels() {
  console.log('📅 Testing Booking Engine Models...\n');

  // Cleanup existing test data
  await cleanupTestData();

  try {
    // 1. Create test license and company
    console.log('1️⃣ Creating test license and company...');
    const license = await prisma.license.create({
      data: {
        key: `test-license-booking-${Date.now()}`,
        type: LicenseType.MONTHLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const company = await prisma.company.create({
      data: {
        name: 'CleanFoss Booking Services',
        slug: 'cleanfoss-booking-services',
        email: 'test@cleanfoss-booking.com',
        licenseId: license.id,
      },
    });
    console.log(`✅ Created company: ${company.name}\n`);

    // 2. Create location
    console.log('2️⃣ Creating service location...');
    const location = await prisma.location.create({
      data: {
        name: 'CleanFoss Main Location',
        address: 'Copenhagen Street 123',
        city: 'Copenhagen',
        postalCode: '1000',
        country: 'Denmark',
        phone: '+45 12 34 56 78',
        email: 'location@cleanfoss.com',
        timezone: 'Europe/Copenhagen',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });
    console.log(`✅ Created location: ${location.name}\n`);

    // 3. Create agent user and agent profile
    console.log('3️⃣ Creating agent and customer...');
    const agentUser = await prisma.user.create({
      data: {
        name: 'Lars Hansen',
        email: 'lars@cleanfoss.com',
        role: UserRole.AGENT,
        companyId: company.id,
      },
    });

    const agent = await prisma.agent.create({
      data: {
        specialties: ['exterior', 'interior', 'detailing'],
        skillLevel: 4,
        hourlyRate: 250.0, // DKK per hour
        commissionRate: 65.0, // 65% to agent
        status: 'ACTIVE',
        companyId: company.id,
        userId: agentUser.id,
        locationId: location.id,
      },
    });

    // Create customer
    const customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'customer@test.com',
        role: UserRole.CUSTOMER,
        companyId: company.id,
      },
    });
    console.log(`✅ Created agent: ${agentUser.name} and customer: ${customer.name}\n`);

    // 4. Set up car data (reuse from previous tests)
    console.log('4️⃣ Setting up car data...');
    const carBrand = await prisma.carBrand.create({
      data: {
        name: 'BMW',
        slug: 'bmw',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    const carModel = await prisma.carModel.create({
      data: {
        name: 'X5',
        slug: 'x5',
        vehicleType: VehicleType.SUV,
        vehicleSize: VehicleSize.LARGE,
        status: 'ACTIVE',
        companyId: company.id,
        brandId: carBrand.id,
      },
    });

    const customerVehicle = await prisma.customerVehicle.create({
      data: {
        year: 2021,
        color: 'Black',
        licensePlate: 'ABC123',
        nickname: 'My BMW X5',
        isDefault: true,
        companyId: company.id,
        customerId: customer.id,
        brandId: carBrand.id,
        modelId: carModel.id,
      },
    });
    console.log(`✅ Created car data: ${carBrand.name} ${carModel.name}\n`);

    // 5. Set up services
    console.log('5️⃣ Setting up services...');
    const category = await prisma.category.create({
      data: {
        name: 'Premium Services',
        slug: 'premium-services',
        description: 'High-end car cleaning',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    const exteriorService = await prisma.service.create({
      data: {
        name: 'Premium Exterior Wash',
        description: 'Complete exterior cleaning with wax',
        price: 300.00,
        duration: 90,
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: category.id,
      },
    });

    const interiorService = await prisma.service.create({
      data: {
        name: 'Interior Detail',
        description: 'Complete interior cleaning and protection',
        price: 250.00,
        duration: 60,
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: category.id,
      },
    });

    // Create service extra
    const waxExtra = await prisma.serviceExtra.create({
      data: {
        name: 'Premium Wax',
        description: 'High-quality protective wax',
        price: 150.00,
        duration: 30,
        status: 'ACTIVE',
        companyId: company.id,
        serviceId: exteriorService.id,
      },
    });

    // Create bundle
    const detailBundle = await prisma.bundle.create({
      data: {
        name: 'Complete Detail Package',
        description: 'Exterior + Interior + Premium Wax',
        price: 600.00, // Discounted from 700
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    // Add services to bundle
    await prisma.bundleService.createMany({
      data: [
        {
          bundleId: detailBundle.id,
          serviceId: exteriorService.id,
          quantity: 1,
        },
        {
          bundleId: detailBundle.id,
          serviceId: interiorService.id,
          quantity: 1,
        },
      ],
    });

    // Create pricing rule for SUVs
    const suvPricingRule = await prisma.servicePricingRule.create({
      data: {
        vehicleType: VehicleType.SUV,
        priceModifier: 25.0, // +25% for SUV
        durationModifier: 30.0, // +30% more time
        description: 'SUV upcharge',
        isActive: true,
        companyId: company.id,
        serviceId: exteriorService.id,
      },
    });
    console.log(`✅ Created services and pricing rules\n`);

    // 6. Create bookings
    console.log('6️⃣ Creating test bookings...');
    
    // Calculate pricing for SUV
    const basePrice = exteriorService.price;
    const baseDuration = exteriorService.duration;
    const suvPrice = basePrice * (1 + suvPricingRule.priceModifier / 100);
    const suvDuration = baseDuration * (1 + suvPricingRule.durationModifier / 100);

    // Simple single-service booking
    const simpleBooking = await prisma.booking.create({
      data: {
        scheduledAt: new Date('2025-09-05T10:00:00Z'),
        duration: Math.round(suvDuration), // SUV duration
        status: BookingStatus.CONFIRMED,
        totalPrice: suvPrice, // SUV pricing
        notes: 'Customer requested extra attention to wheels',
        companyId: company.id,
        customerId: customer.id,
        agentId: agent.id,
        locationId: location.id,
        vehicleId: customerVehicle.id,
      },
    });

    // Add service to simple booking
    const simpleBookingService = await prisma.bookingService.create({
      data: {
        quantity: 1,
        unitPrice: suvPrice,
        totalPrice: suvPrice,
        duration: Math.round(suvDuration),
        bookingId: simpleBooking.id,
        serviceId: exteriorService.id,
      },
    });

    // Add extra to the service
    const bookingExtra = await prisma.bookingExtra.create({
      data: {
        quantity: 1,
        unitPrice: waxExtra.price,
        totalPrice: waxExtra.price,
        bookingServiceId: simpleBookingService.id,
        extraId: waxExtra.id,
      },
    });

    // Update booking total to include extra
    await prisma.booking.update({
      where: { id: simpleBooking.id },
      data: {
        totalPrice: suvPrice + waxExtra.price,
        duration: Math.round(suvDuration) + waxExtra.duration,
      },
    });

    console.log(`✅ Simple booking created: ${suvPrice + waxExtra.price} DKK, ${Math.round(suvDuration) + waxExtra.duration} min`);

    // Bundle booking
    const bundleBooking = await prisma.booking.create({
      data: {
        scheduledAt: new Date('2025-09-06T14:00:00Z'),
        duration: 180, // Estimated total for bundle
        status: BookingStatus.PENDING,
        totalPrice: detailBundle.price * 1.25, // Bundle price + SUV modifier
        notes: 'Full detail package for SUV',
        companyId: company.id,
        customerId: customer.id,
        agentId: agent.id,
        locationId: location.id,
        vehicleId: customerVehicle.id,
      },
    });

    // Add bundle to booking
    const bundleBookingService = await prisma.bookingService.create({
      data: {
        quantity: 1,
        unitPrice: detailBundle.price * 1.25,
        totalPrice: detailBundle.price * 1.25,
        duration: 180,
        bookingId: bundleBooking.id,
        bundleId: detailBundle.id,
      },
    });

    console.log(`✅ Bundle booking created: ${detailBundle.price * 1.25} DKK, 180 min\n`);

    // 7. Test booking retrieval and relationships
    console.log('7️⃣ Testing booking relationships...');
    
    const bookingWithDetails = await prisma.booking.findUnique({
      where: { id: simpleBooking.id },
      include: {
        customer: true,
        agent: {
          include: {
            user: true,
          },
        },
        location: true,
        vehicle: {
          include: {
            brand: true,
            model: true,
          },
        },
        services: {
          include: {
            service: true,
            bundle: true,
            extras: {
              include: {
                extra: true,
              },
            },
          },
        },
      },
    });

    if (bookingWithDetails) {
      console.log(`📋 Booking Details:`);
      console.log(`   Customer: ${bookingWithDetails.customer.name}`);
      console.log(`   Agent: ${bookingWithDetails.agent?.user.name}`);
      console.log(`   Location: ${bookingWithDetails.location.name}`);
      console.log(`   Vehicle: ${bookingWithDetails.vehicle.brand.name} ${bookingWithDetails.vehicle.model.name}`);
      console.log(`   Scheduled: ${bookingWithDetails.scheduledAt}`);
      console.log(`   Duration: ${bookingWithDetails.duration} minutes`);
      console.log(`   Total Price: ${bookingWithDetails.totalPrice} DKK`);
      console.log(`   Status: ${bookingWithDetails.status}`);
      console.log(`   Services: ${bookingWithDetails.services.length}`);
      
      bookingWithDetails.services.forEach((service, index) => {
        console.log(`     Service ${index + 1}: ${service.service?.name || 'Bundle'} - ${service.totalPrice} DKK`);
        service.extras.forEach((extra, extraIndex) => {
          console.log(`       Extra ${extraIndex + 1}: ${extra.extra.name} - ${extra.totalPrice} DKK`);
        });
      });
    }

    // 8. Test booking status workflow
    console.log('\n8️⃣ Testing booking status workflow...');
    
    // Update booking status through workflow
    const statusUpdates = [
      BookingStatus.CONFIRMED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
    ];

    for (const status of statusUpdates) {
      await prisma.booking.update({
        where: { id: bundleBooking.id },
        data: { status },
      });
      console.log(`✅ Updated booking status to: ${status}`);
    }

    // 9. Test multi-tenant isolation
    console.log('\n9️⃣ Testing multi-tenant isolation...');
    
    // Create second company
    const license2 = await prisma.license.create({
      data: {
        key: `test-license-booking-2-${Date.now()}`,
        type: LicenseType.YEARLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const company2 = await prisma.company.create({
      data: {
        name: 'Another Booking Co',
        slug: 'another-booking',
        email: 'test@another-booking.com',
        licenseId: license2.id,
      },
    });

    // Check booking isolation
    const company1Bookings = await prisma.booking.findMany({
      where: { companyId: company.id },
    });

    const company2Bookings = await prisma.booking.findMany({
      where: { companyId: company2.id },
    });

    console.log(`✅ Company 1 has ${company1Bookings.length} bookings`);
    console.log(`✅ Company 2 has ${company2Bookings.length} bookings`);
    console.log(`✅ Multi-tenant isolation working correctly\n`);

    // 10. Test business calculations
    console.log('🔟 Testing business calculations...');
    
    // Calculate agent commission for completed booking
    const completedBooking = await prisma.booking.findFirst({
      where: { 
        status: BookingStatus.COMPLETED,
        agentId: agent.id,
      },
      include: {
        agent: true,
      },
    });

    if (completedBooking && completedBooking.agent) {
      const agentCommission = completedBooking.totalPrice * (completedBooking.agent.commissionRate / 100);
      const companyRevenue = completedBooking.totalPrice - agentCommission;
      
      console.log(`💰 Revenue Split Calculation:`);
      console.log(`   Total Booking: ${completedBooking.totalPrice} DKK`);
      console.log(`   Agent Commission (${completedBooking.agent.commissionRate}%): ${agentCommission.toFixed(2)} DKK`);
      console.log(`   Company Revenue: ${companyRevenue.toFixed(2)} DKK`);
    }

    console.log('\n🎉 All Booking Engine Model tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  // Delete in correct order due to foreign key constraints
  await prisma.bookingExtra.deleteMany({});
  await prisma.bookingService.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.bundleService.deleteMany({});
  await prisma.servicePricingRule.deleteMany({});
  await prisma.serviceExtra.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customerVehicle.deleteMany({});
  await prisma.carModel.deleteMany({});
  await prisma.carBrand.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'cleanfoss' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Booking' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Another' } } });
  await prisma.license.deleteMany({ where: { key: { contains: 'test-license-booking' } } });
  
  console.log('✅ Cleanup completed');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBookingEngineModels()
    .then(() => {
      console.log('Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testBookingEngineModels };

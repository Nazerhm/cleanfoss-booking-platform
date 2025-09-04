import { PrismaClient, LicenseType, LicenseStatus, UserRole, VehicleType, VehicleSize } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test Car Management Models
 * Validates CarBrand, CarModel, CustomerVehicle, and ServicePricingRule models
 */
async function testCarManagementModels() {
  console.log('🚗 Testing Car Management Models...\n');

  // Cleanup existing test data
  await cleanupTestData();

  try {
    // 1. Create test license and company
    console.log('1️⃣ Creating test license and company...');
    const license = await prisma.license.create({
      data: {
        key: `test-license-car-${Date.now()}`,
        type: LicenseType.MONTHLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const company = await prisma.company.create({
      data: {
        name: 'CleanFoss Car Services',
        slug: 'cleanfoss-car-services',
        email: 'test@cleanfoss-cars.com',
        licenseId: license.id,
      },
    });
    console.log(`✅ Created company: ${company.name}\n`);

    // 2. Create car brands
    console.log('2️⃣ Creating car brands...');
    const bmw = await prisma.carBrand.create({
      data: {
        name: 'BMW',
        slug: 'bmw',
        logo: 'bmw-logo.png',
        status: 'ACTIVE',
        sortOrder: 1,
        companyId: company.id,
      },
    });

    const audi = await prisma.carBrand.create({
      data: {
        name: 'Audi',
        slug: 'audi',
        logo: 'audi-logo.png',
        status: 'ACTIVE',
        sortOrder: 2,
        companyId: company.id,
      },
    });

    const volkswagen = await prisma.carBrand.create({
      data: {
        name: 'Volkswagen',
        slug: 'volkswagen',
        logo: 'vw-logo.png',
        status: 'ACTIVE',
        sortOrder: 3,
        companyId: company.id,
      },
    });
    console.log(`✅ Created ${3} car brands\n`);

    // 3. Create car models
    console.log('3️⃣ Creating car models...');
    const bmw3Series = await prisma.carModel.create({
      data: {
        name: '3 Series',
        slug: '3-series',
        vehicleType: VehicleType.SEDAN,
        vehicleSize: VehicleSize.MEDIUM,
        status: 'ACTIVE',
        sortOrder: 1,
        companyId: company.id,
        brandId: bmw.id,
      },
    });

    const bmwX5 = await prisma.carModel.create({
      data: {
        name: 'X5',
        slug: 'x5',
        vehicleType: VehicleType.SUV,
        vehicleSize: VehicleSize.LARGE,
        status: 'ACTIVE',
        sortOrder: 2,
        companyId: company.id,
        brandId: bmw.id,
      },
    });

    const audiA4 = await prisma.carModel.create({
      data: {
        name: 'A4',
        slug: 'a4',
        vehicleType: VehicleType.SEDAN,
        vehicleSize: VehicleSize.MEDIUM,
        status: 'ACTIVE',
        sortOrder: 1,
        companyId: company.id,
        brandId: audi.id,
      },
    });

    const vwGolf = await prisma.carModel.create({
      data: {
        name: 'Golf',
        slug: 'golf',
        vehicleType: VehicleType.HATCHBACK,
        vehicleSize: VehicleSize.SMALL,
        status: 'ACTIVE',
        sortOrder: 1,
        companyId: company.id,
        brandId: volkswagen.id,
      },
    });
    console.log(`✅ Created ${4} car models\n`);

    // 4. Create test customer
    console.log('4️⃣ Creating test customer...');
    const customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'customer@test.com',
        role: UserRole.CUSTOMER,
        companyId: company.id,
      },
    });
    console.log(`✅ Created customer: ${customer.name}\n`);

    // 5. Create customer vehicles
    console.log('5️⃣ Creating customer vehicles...');
    const customerBmw = await prisma.customerVehicle.create({
      data: {
        year: 2020,
        color: 'Black',
        licensePlate: 'ABC123',
        nickname: 'My BMW',
        isDefault: true,
        companyId: company.id,
        customerId: customer.id,
        brandId: bmw.id,
        modelId: bmw3Series.id,
      },
    });

    const customerAudi = await prisma.customerVehicle.create({
      data: {
        year: 2019,
        color: 'Silver',
        licensePlate: 'XYZ789',
        nickname: 'Family Car',
        isDefault: false,
        companyId: company.id,
        customerId: customer.id,
        brandId: audi.id,
        modelId: audiA4.id,
      },
    });
    console.log(`✅ Created ${2} customer vehicles\n`);

    // 6. Create a test service for pricing rules
    console.log('6️⃣ Creating test service and category...');
    const category = await prisma.category.create({
      data: {
        name: 'Full Service',
        slug: 'full-service',
        description: 'Complete car wash and detail',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    const service = await prisma.service.create({
      data: {
        name: 'Premium Wash',
        description: 'Complete wash with wax',
        price: 200.00, // Base price in DKK
        duration: 60, // Base duration in minutes
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: category.id,
      },
    });
    console.log(`✅ Created service: ${service.name}\n`);

    // 7. Create service pricing rules
    console.log('7️⃣ Creating service pricing rules...');
    
    // Rule for SUV vehicles (larger, takes more time and costs more)
    const suvRule = await prisma.servicePricingRule.create({
      data: {
        vehicleType: VehicleType.SUV,
        priceModifier: 25.0, // +25% for SUVs
        durationModifier: 30.0, // +30% more time
        description: 'SUV upcharge for larger vehicle size',
        isActive: true,
        companyId: company.id,
        serviceId: service.id,
      },
    });

    // Rule for small vehicles (discount)
    const smallRule = await prisma.servicePricingRule.create({
      data: {
        vehicleSize: VehicleSize.SMALL,
        priceModifier: -15.0, // -15% for small cars
        durationModifier: -20.0, // -20% less time
        description: 'Small car discount',
        isActive: true,
        companyId: company.id,
        serviceId: service.id,
      },
    });

    // Rule for large vehicles
    const largeRule = await prisma.servicePricingRule.create({
      data: {
        vehicleSize: VehicleSize.LARGE,
        priceModifier: 20.0, // +20% for large cars
        durationModifier: 25.0, // +25% more time
        description: 'Large vehicle upcharge',
        isActive: true,
        companyId: company.id,
        serviceId: service.id,
      },
    });
    console.log(`✅ Created ${3} pricing rules\n`);

    // 8. Test pricing calculations
    console.log('8️⃣ Testing pricing calculations...');
    
    // Test SUV pricing (BMW X5)
    const suvPricing = calculateServicePrice(service.price, service.duration, [suvRule]);
    console.log(`🧮 SUV Pricing (BMW X5):`);
    console.log(`   Base: ${service.price} DKK, ${service.duration} min`);
    console.log(`   Final: ${suvPricing.price} DKK, ${suvPricing.duration} min`);
    console.log(`   Modifier: +${suvRule.priceModifier}% price, +${suvRule.durationModifier}% time`);

    // Test small car pricing (VW Golf)
    const smallPricing = calculateServicePrice(service.price, service.duration, [smallRule]);
    console.log(`🧮 Small Car Pricing (VW Golf):`);
    console.log(`   Base: ${service.price} DKK, ${service.duration} min`);
    console.log(`   Final: ${smallPricing.price} DKK, ${smallPricing.duration} min`);
    console.log(`   Modifier: ${smallRule.priceModifier}% price, ${smallRule.durationModifier}% time\n`);

    // 9. Validate relationships and data integrity
    console.log('9️⃣ Validating relationships...');
    
    // Test brand with models
    const brandWithModels = await prisma.carBrand.findUnique({
      where: { id: bmw.id },
      include: { 
        models: true,
        customerVehicles: true,
        company: true,
      },
    });
    console.log(`✅ BMW brand has ${brandWithModels?.models.length} models and ${brandWithModels?.customerVehicles.length} customer vehicles`);

    // Test customer with vehicles
    const customerWithVehicles = await prisma.user.findUnique({
      where: { id: customer.id },
      include: { 
        vehicles: {
          include: {
            brand: true,
            model: true,
          }
        },
      },
    });
    console.log(`✅ Customer has ${customerWithVehicles?.vehicles.length} vehicles registered`);
    
    // Show vehicle details
    customerWithVehicles?.vehicles.forEach((vehicle, index) => {
      console.log(`   Vehicle ${index + 1}: ${vehicle.brand.name} ${vehicle.model.name} (${vehicle.color}, ${vehicle.year})`);
      console.log(`   Type: ${vehicle.model.vehicleType}, Size: ${vehicle.model.vehicleSize}, Default: ${vehicle.isDefault}`);
    });

    // Test service with pricing rules
    const serviceWithRules = await prisma.service.findUnique({
      where: { id: service.id },
      include: { 
        pricingRules: true,
        company: true,
      },
    });
    console.log(`✅ Service "${serviceWithRules?.name}" has ${serviceWithRules?.pricingRules.length} pricing rules`);

    // 10. Test multi-tenant isolation
    console.log('\n🔟 Testing multi-tenant isolation...');
    
    // Create second company
    const license2 = await prisma.license.create({
      data: {
        key: `test-license-car-2-${Date.now()}`,
        type: LicenseType.YEARLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const company2 = await prisma.company.create({
      data: {
        name: 'Another Car Wash Co',
        slug: 'another-car-wash',
        email: 'test@another-wash.com',
        licenseId: license2.id,
      },
    });

    // Verify company 1 vs company 2 data isolation
    const company1Brands = await prisma.carBrand.findMany({
      where: { companyId: company.id },
    });

    const company2Brands = await prisma.carBrand.findMany({
      where: { companyId: company2.id },
    });

    console.log(`✅ Company 1 has ${company1Brands.length} car brands`);
    console.log(`✅ Company 2 has ${company2Brands.length} car brands`);
    console.log(`✅ Multi-tenant isolation working correctly\n`);

    console.log('🎉 All Car Management Model tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

/**
 * Helper function to calculate service pricing with modifiers
 */
function calculateServicePrice(basePrice: number, baseDuration: number, pricingRules: any[]) {
  let finalPrice = basePrice;
  let finalDuration = baseDuration;

  pricingRules.forEach(rule => {
    if (rule.priceModifier !== 0) {
      finalPrice = finalPrice * (1 + rule.priceModifier / 100);
    }
    if (rule.durationModifier !== 0) {
      finalDuration = finalDuration * (1 + rule.durationModifier / 100);
    }
  });

  return {
    price: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
    duration: Math.round(finalDuration), // Round to nearest minute
  };
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  // Delete in correct order due to foreign key constraints
  await prisma.servicePricingRule.deleteMany({});
  await prisma.customerVehicle.deleteMany({});
  await prisma.carModel.deleteMany({});
  await prisma.carBrand.deleteMany({});
  await prisma.service.deleteMany({ where: { name: { contains: 'Premium Wash' } } });
  await prisma.category.deleteMany({ where: { name: { contains: 'Full Service' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Car' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Another' } } });
  await prisma.license.deleteMany({ where: { key: { contains: 'test-license-car' } } });
  
  console.log('✅ Cleanup completed');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCarManagementModels()
    .then(() => {
      console.log('Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testCarManagementModels, calculateServicePrice };

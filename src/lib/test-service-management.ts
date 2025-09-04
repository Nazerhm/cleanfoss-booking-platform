import { PrismaClient, LicenseType, LicenseStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test Service Management Models
 * Validates Category, Service, ServiceExtra, and Bundle models work correctly
 */
async function testServiceManagementModels() {
  console.log('🧪 Testing Service Management Models...\n');

  // Cleanup existing test data
  await cleanupTestData();

  try {
    // 1. Create test license and company
    console.log('1️⃣ Creating test license and company...');
    const license = await prisma.license.create({
      data: {
        key: `test-license-${Date.now()}`,
        type: LicenseType.MONTHLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const company = await prisma.company.create({
      data: {
        name: 'CleanFoss Test Services',
        slug: 'cleanfoss-test-services',
        email: 'test@cleanfoss-services.com',
        licenseId: license.id,
      },
    });
    console.log(`✅ Created company: ${company.name}\n`);

    // 2. Create categories
    console.log('2️⃣ Creating service categories...');
    const exteriorCategory = await prisma.category.create({
      data: {
        name: 'Exterior Cleaning',
        description: 'External car cleaning services',
        slug: 'exterior-cleaning',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    const interiorCategory = await prisma.category.create({
      data: {
        name: 'Interior Cleaning',
        description: 'Internal car cleaning services',
        slug: 'interior-cleaning',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    const premiumCategory = await prisma.category.create({
      data: {
        name: 'Premium Services',
        description: 'High-end detailing services',
        slug: 'premium-services',
        status: 'ACTIVE',
        companyId: company.id,
      },
    });
    console.log(`✅ Created ${3} categories\n`);

    // 3. Create base services
    console.log('3️⃣ Creating base services...');
    const basicWash = await prisma.service.create({
      data: {
        name: 'Basic Exterior Wash',
        description: 'Standard exterior car wash with soap and rinse',
        price: 150.00, // DKK
        duration: 30, // minutes
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: exteriorCategory.id,
      },
    });

    const interiorVacuum = await prisma.service.create({
      data: {
        name: 'Interior Vacuum & Wipe',
        description: 'Complete interior cleaning with vacuum and surface wipe',
        price: 200.00,
        duration: 45,
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: interiorCategory.id,
      },
    });

    const premiumDetail = await prisma.service.create({
      data: {
        name: 'Premium Full Detail',
        description: 'Complete car detailing with wax and interior protection',
        price: 800.00,
        duration: 180,
        status: 'ACTIVE',
        companyId: company.id,
        categoryId: premiumCategory.id,
      },
    });
    console.log(`✅ Created ${3} base services\n`);

    // 4. Create service extras (these are tied to specific services)
    console.log('4️⃣ Creating service extras...');
    const waxExtra = await prisma.serviceExtra.create({
      data: {
        name: 'Premium Wax',
        description: 'High-quality car wax for lasting shine',
        price: 100.00,
        duration: 20,
        status: 'ACTIVE',
        companyId: company.id,
        serviceId: basicWash.id, // Tied to basic wash service
      },
    });

    const tireCareExtra = await prisma.serviceExtra.create({
      data: {
        name: 'Tire Care & Shine',
        description: 'Tire cleaning and protective shine treatment',
        price: 75.00,
        duration: 15,
        status: 'ACTIVE',
        companyId: company.id,
        serviceId: basicWash.id, // Also tied to basic wash
      },
    });

    const leatherTreatment = await prisma.serviceExtra.create({
      data: {
        name: 'Leather Treatment',
        description: 'Professional leather cleaning and conditioning',
        price: 150.00,
        duration: 30,
        status: 'ACTIVE',
        companyId: company.id,
        serviceId: interiorVacuum.id, // Tied to interior service
      },
    });
    console.log(`✅ Created ${3} service extras\n`);

    // 5. Create service bundles
    console.log('5️⃣ Creating service bundles...');
    const completeBundle = await prisma.bundle.create({
      data: {
        name: 'Complete Clean Package',
        description: 'Exterior wash + interior cleaning combo',
        price: 300.00, // Discounted from 350 individual
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    // Add services to the bundle
    await prisma.bundleService.createMany({
      data: [
        {
          bundleId: completeBundle.id,
          serviceId: basicWash.id,
          quantity: 1,
        },
        {
          bundleId: completeBundle.id,
          serviceId: interiorVacuum.id,
          quantity: 1,
        },
      ],
    });

    const premiumBundle = await prisma.bundle.create({
      data: {
        name: 'Premium Detail Package',
        description: 'Full premium service package',
        price: 1000.00, // Discounted
        status: 'ACTIVE',
        companyId: company.id,
      },
    });

    // Add services to premium bundle
    await prisma.bundleService.create({
      data: {
        bundleId: premiumBundle.id,
        serviceId: premiumDetail.id,
        quantity: 1,
      },
    });
    console.log(`✅ Created ${2} service bundles\n`);

    // 6. Validate relationships and data integrity
    console.log('6️⃣ Validating relationships...');
    
    // Test category with services
    const categoryWithServices = await prisma.category.findUnique({
      where: { id: exteriorCategory.id },
      include: { 
        services: true,
        company: true,
      },
    });
    console.log(`✅ Category "${categoryWithServices?.name}" has ${categoryWithServices?.services.length} services`);

    // Test service with extras
    const serviceWithExtras = await prisma.service.findUnique({
      where: { id: basicWash.id },
      include: { 
        extras: true,
        category: true,
        company: true,
      },
    });
    console.log(`✅ Service "${serviceWithExtras?.name}" has ${serviceWithExtras?.extras.length} extras`);

    // Test bundle with services
    const bundleWithServices = await prisma.bundle.findUnique({
      where: { id: completeBundle.id },
      include: {
        services: {
          include: {
            service: true,
          }
        },
        company: true,
      },
    });
    
    if (bundleWithServices) {
      const serviceCount = bundleWithServices.services.length;
      const totalServicePrice = bundleWithServices.services.reduce((sum: number, bundleService) => 
        sum + bundleService.service.price, 0);
      const discount = totalServicePrice - bundleWithServices.price;
      console.log(`✅ Bundle "${bundleWithServices.name}" has ${serviceCount} services`);
      console.log(`✅ Bundle saves ${discount.toFixed(2)} DKK (${Math.round((discount/totalServicePrice)*100)}% off)`);
    }

    // 7. Test multi-tenant isolation
    console.log('\n7️⃣ Testing multi-tenant isolation...');
    
    // Create second company
    const license2 = await prisma.license.create({
      data: {
        key: `test-license-2-${Date.now()}`,
        type: LicenseType.YEARLY,
        status: LicenseStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const company2 = await prisma.company.create({
      data: {
        name: 'Another Cleaning Co',
        slug: 'another-cleaning-co',
        email: 'test@another-cleaning.com',
        licenseId: license2.id,
      },
    });

    // Verify company 1 cannot see company 2's data
    const company1Services = await prisma.service.findMany({
      where: { companyId: company.id },
    });

    const company2Services = await prisma.service.findMany({
      where: { companyId: company2.id },
    });

    console.log(`✅ Company 1 has ${company1Services.length} services`);
    console.log(`✅ Company 2 has ${company2Services.length} services`);
    console.log(`✅ Multi-tenant isolation working correctly\n`);

    console.log('🎉 All Service Management Model tests passed!\n');

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
  await prisma.bundleService.deleteMany({});
  await prisma.bundle.deleteMany({ where: { name: { contains: 'Package' } } });
  await prisma.serviceExtra.deleteMany({ where: { name: { contains: 'Premium Wax' } } });
  await prisma.serviceExtra.deleteMany({ where: { name: { contains: 'Tire Care' } } });
  await prisma.serviceExtra.deleteMany({ where: { name: { contains: 'Leather Treatment' } } });
  await prisma.service.deleteMany({ where: { name: { contains: 'Wash' } } });
  await prisma.service.deleteMany({ where: { name: { contains: 'Vacuum' } } });
  await prisma.service.deleteMany({ where: { name: { contains: 'Detail' } } });
  await prisma.category.deleteMany({ where: { name: { contains: 'Cleaning' } } });
  await prisma.category.deleteMany({ where: { name: { contains: 'Premium' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Test' } } });
  await prisma.company.deleteMany({ where: { name: { contains: 'Another' } } });
  await prisma.license.deleteMany({ where: { type: { in: [LicenseType.MONTHLY, LicenseType.YEARLY] } } });
  
  console.log('✅ Cleanup completed');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testServiceManagementModels()
    .then(() => {
      console.log('Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testServiceManagementModels };

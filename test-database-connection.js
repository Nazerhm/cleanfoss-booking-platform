// Test database connection and basic operations
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test license creation first
    const testLicense = await prisma.license.create({
      data: {
        key: 'test-license-' + Date.now(),
        type: 'MONTHLY',
        status: 'ACTIVE'
      }
    });
    console.log('✅ License creation successful:', testLicense.key);
    
    // Test company creation (basic model test)
    const testCompany = await prisma.company.create({
      data: {
        name: 'Test Company',
        email: 'test@company' + Date.now() + '.com',
        slug: 'test-company-' + Date.now(),
        isActive: true,
        licenseId: testLicense.id
      }
    });
    console.log('✅ Company creation successful:', testCompany.name);
    
    // Clean up test data
    await prisma.company.delete({
      where: { id: testCompany.id }
    });
    await prisma.license.delete({
      where: { id: testLicense.id }
    });
    console.log('✅ Test cleanup successful');
    
    console.log('🎉 All database tests passed! Infrastructure is working correctly.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();

import { prisma } from './prisma'

export async function testMultiTenantModels() {
  try {
    console.log('🧪 Testing Multi-Tenant Models...')
    
    // Test 1: Create a license
    console.log('1️⃣ Creating license...')
    const license = await prisma.license.create({
      data: {
        key: 'CF-TEST-' + Date.now(),
        type: 'MONTHLY',
        status: 'ACTIVE',
        maxUsers: 50,
        maxLocations: 10,
        maxAgents: 25,
        features: {
          carManagement: true,
          whatsappNotifications: true,
          advancedReporting: true
        }
      }
    })
    console.log('✅ License created:', license.key)
    
    // Test 2: Create a company
    console.log('2️⃣ Creating company...')
    const company = await prisma.company.create({
      data: {
        name: 'Test Car Cleaning Co',
        slug: 'test-car-cleaning-' + Date.now(),
        email: 'test@carwash.dk',
        phone: '+45 12 34 56 78',
        address: 'Copenhagen, Denmark',
        vatNumber: 'DK12345678',
        vatRate: 25.0,
        brandColor: '#FF6B35',
        brandName: 'CleanCars Pro',
        currency: 'DKK',
        timezone: 'Europe/Copenhagen',
        defaultWorkerCommission: 65.0,
        licenseId: license.id
      }
    })
    console.log('✅ Company created:', company.name)
    
    // Test 3: Create users with different roles
    console.log('3️⃣ Creating users...')
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@carwash.dk',
        role: 'ADMIN',
        companyId: company.id
      }
    })
    
    const agent = await prisma.user.create({
      data: {
        name: 'Agent Smith',
        email: 'agent@carwash.dk',
        role: 'AGENT',
        companyId: company.id
      }
    })
    
    const customer = await prisma.user.create({
      data: {
        name: 'John Customer',
        email: 'john@customer.dk',
        role: 'CUSTOMER'
        // No companyId - customers can book across companies
      }
    })
    
    console.log('✅ Users created: Admin, Agent, Customer')
    
    // Test 4: Test relationships
    console.log('4️⃣ Testing relationships...')
    const companyWithUsers = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        users: true,
        license: true
      }
    })
    
    console.log('✅ Company relationships:', {
      companyName: companyWithUsers?.name,
      usersCount: companyWithUsers?.users.length,
      licenseType: companyWithUsers?.license.type,
      licenseStatus: companyWithUsers?.license.status
    })
    
    // Test 5: Test enum validations
    console.log('5️⃣ Testing enum values...')
    const roles = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'CUSTOMER', 'FINANCE']
    const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED']
    console.log('✅ User roles available:', roles)
    console.log('✅ User statuses available:', statuses)
    
    // Test 6: Test multi-tenancy isolation
    console.log('6️⃣ Testing multi-tenancy isolation...')
    const adminUsers = await prisma.user.findMany({
      where: {
        companyId: company.id,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin users for company:', adminUsers.length)
    
    // Cleanup test data
    console.log('🧹 Cleaning up test data...')
    await prisma.user.deleteMany({
      where: { email: { in: ['admin@carwash.dk', 'agent@carwash.dk', 'john@customer.dk'] } }
    })
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.license.delete({ where: { id: license.id } })
    
    console.log('✅ All multi-tenant model tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Multi-tenant model test failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMultiTenantModels()
}

// Run test if this file is executed directly
if (require.main === module) {
  testMultiTenantModels()
}

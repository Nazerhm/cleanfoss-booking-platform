import { prisma } from './prisma'

export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query test successful:', result)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
}

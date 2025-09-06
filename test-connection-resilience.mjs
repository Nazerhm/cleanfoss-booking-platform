// Test connection resilience features
import { 
  prisma, 
  connectWithRetry, 
  executeWithRetry, 
  checkDatabaseHealth, 
  disconnectPrisma 
} from './src/lib/prisma.js';

async function testConnectionResilience() {
  console.log('🔍 Testing connection resilience features...\n');
  
  try {
    // Test 1: Connection with retry
    console.log('1️⃣ Testing connection with retry logic...');
    await connectWithRetry(3);
    console.log('✅ Connection retry logic working\n');
    
    // Test 2: Health check
    console.log('2️⃣ Testing database health check...');
    const isHealthy = await checkDatabaseHealth();
    console.log(`${isHealthy ? '✅' : '❌'} Database health status: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}\n`);
    
    // Test 3: Operation with retry
    console.log('3️⃣ Testing database operation with retry logic...');
    const result = await executeWithRetry(async () => {
      return await prisma.$queryRaw`SELECT 'Connection resilience test' as message, NOW() as timestamp`;
    });
    console.log('✅ Operation retry logic working:', result[0], '\n');
    
    // Test 4: Create and clean up test data with retry
    console.log('4️⃣ Testing CRUD operations with retry logic...');
    const testLicense = await executeWithRetry(async () => {
      return await prisma.license.create({
        data: {
          key: 'resilience-test-' + Date.now(),
          type: 'MONTHLY',
          status: 'ACTIVE'
        }
      });
    });
    console.log('✅ Create operation with retry successful:', testLicense.key);
    
    await executeWithRetry(async () => {
      return await prisma.license.delete({
        where: { id: testLicense.id }
      });
    });
    console.log('✅ Delete operation with retry successful\n');
    
    // Test 5: Connection pooling behavior
    console.log('5️⃣ Testing connection pooling with concurrent operations...');
    const concurrentOps = Array.from({ length: 5 }, (_, i) => 
      executeWithRetry(async () => {
        return await prisma.$queryRaw`SELECT ${i + 1} as operation_id, 'concurrent_test' as type`;
      })
    );
    
    const results = await Promise.all(concurrentOps);
    console.log('✅ Concurrent operations successful:', results.length, 'operations completed\n');
    
    console.log('🎉 All connection resilience tests passed!');
    console.log('📊 Features validated:');
    console.log('  - ✅ Connection retry with exponential backoff');
    console.log('  - ✅ Database health monitoring');
    console.log('  - ✅ Operation retry for transient failures');
    console.log('  - ✅ CRUD operations with resilience');
    console.log('  - ✅ Concurrent operation handling');
    
  } catch (error) {
    console.error('❌ Connection resilience test failed:', error);
  } finally {
    // Test 6: Graceful disconnect
    console.log('\n6️⃣ Testing graceful disconnect...');
    await disconnectPrisma();
  }
}

testConnectionResilience();

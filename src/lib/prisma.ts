import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration with connection resilience
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  
  // Enhanced error handling 
  errorFormat: 'pretty',
})

// Connection retry logic with exponential backoff
export async function connectWithRetry(maxRetries: number = 3): Promise<void> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      retries++;
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
      
      console.warn(`⚠️  Database connection attempt ${retries}/${maxRetries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('❌ Database connection failed after maximum retries');
        throw error;
      }
      
      console.log(`🔄 Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Graceful database operation with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      // Only retry on connection errors, not business logic errors
      const isConnectionError = error.code === 'P1001' || 
                               error.code === 'P1017' || 
                               error.message?.includes('connect') ||
                               error.message?.includes('timeout');
      
      if (!isConnectionError || retries >= maxRetries) {
        throw error;
      }
      
      retries++;
      const delay = Math.pow(2, retries) * 500; // 1s, 2s exponential backoff
      
      console.warn(`🔄 Retrying database operation (${retries}/${maxRetries}) after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Should not reach here');
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected gracefully');
  } catch (error) {
    console.error('⚠️  Error during database disconnect:', error);
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

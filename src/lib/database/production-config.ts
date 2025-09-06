/**
 * Production Database Configuration
 * Optimized connection pooling and performance settings for PostgreSQL
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Production Connection Pool Configuration
export const PRODUCTION_DB_CONFIG = {
  // Connection Pool Settings
  pool: {
    max: parseInt(process.env.DATABASE_POOL_MAX || '20'), // Maximum connections
    min: parseInt(process.env.DATABASE_POOL_MIN || '5'),  // Minimum connections
    acquireTimeoutMillis: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000'), // 30 seconds
    idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '300000'), // 5 minutes
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  
  // Query Performance Settings
  query: {
    timeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '15000'), // 15 seconds
    maxWait: parseInt(process.env.DATABASE_MAX_WAIT || '10000'), // 10 seconds
    batchRequestsLimit: parseInt(process.env.DATABASE_BATCH_LIMIT || '100'),
  },
  
  // Logging Configuration
  log: isProduction 
    ? ['error' as const, 'warn' as const, 'info' as const]
    : ['query' as const, 'error' as const, 'warn' as const, 'info' as const],
      
  // Error Handling
  errorFormat: (isProduction ? 'minimal' : 'pretty') as Prisma.ErrorFormat,
  rejectOnNotFound: false,
  
  // Transaction Settings
  transactionOptions: {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  }
};

// Create optimized Prisma client instance
let databaseClient: PrismaClient | undefined;

export function createPrismaClient(): PrismaClient {
  if (databaseClient) return databaseClient;
  
  const client = new PrismaClient({
    log: PRODUCTION_DB_CONFIG.log,
    errorFormat: PRODUCTION_DB_CONFIG.errorFormat,
    
    // Datasource configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Connection lifecycle management
  client.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
    });

  databaseClient = client;
  return client;
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  if (databaseClient) {
    await databaseClient.$disconnect();
    console.log('📊 Database disconnected');
    databaseClient = undefined;
  }
}

// Database health check with detailed diagnostics
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
}> {
  try {
    const client = createPrismaClient();
    const startTime = Date.now();
    
    // Test basic connectivity
    const connectTest = await client.$queryRaw`SELECT 1 as test`;
    const connectTime = Date.now() - startTime;
    
    // Test transaction capability
    const txStartTime = Date.now();
    const transactionTest = await client.$transaction([
      client.$queryRaw`SELECT current_database() as database`,
      client.$queryRaw`SELECT version() as version`,
      client.$queryRaw`SELECT current_user as "user"`,
    ]);
    const txTime = Date.now() - txStartTime;
    
    // Get connection pool status (if available)
    const poolStats = {
      // These would be provided by a connection pool monitor
      activeConnections: 'N/A',
      idleConnections: 'N/A',
      totalConnections: 'N/A',
    };

    const dbInfo = transactionTest[0] as any;
    const versionInfo = transactionTest[1] as any;
    const userInfo = transactionTest[2] as any;

    return {
      status: 'healthy',
      details: {
        connectivity: {
          status: 'connected',
          responseTime: `${connectTime}ms`,
          transactionTime: `${txTime}ms`,
        },
        database: {
          name: dbInfo?.database,
          version: versionInfo?.version?.split(' ').slice(0, 2).join(' '),
          user: userInfo?.user,
        },
        pool: poolStats,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      }
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }
    };
  }
}

// Performance monitoring utilities
export class DatabaseMetrics {
  private static queryTimes: number[] = [];
  private static connectionCount = 0;
  
  static recordQuery(duration: number) {
    this.queryTimes.push(duration);
    // Keep only last 100 queries
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
  }
  
  static incrementConnection() {
    this.connectionCount++;
  }
  
  static decrementConnection() {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }
  
  static getMetrics() {
    const avgQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length 
      : 0;
    
    return {
      averageQueryTime: `${avgQueryTime.toFixed(2)}ms`,
      totalQueries: this.queryTimes.length,
      activeConnections: this.connectionCount,
      slowestQuery: this.queryTimes.length > 0 
        ? `${Math.max(...this.queryTimes).toFixed(2)}ms` 
        : '0ms',
      fastestQuery: this.queryTimes.length > 0 
        ? `${Math.min(...this.queryTimes).toFixed(2)}ms` 
        : '0ms',
    };
  }
}

// Export the singleton instance
export const productionPrisma = createPrismaClient();

// Process cleanup
if (typeof process !== 'undefined') {
  process.on('beforeExit', disconnectDatabase);
  process.on('SIGINT', disconnectDatabase);
  process.on('SIGTERM', disconnectDatabase);
}

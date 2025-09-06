/**
 * Database Performance Monitoring API
 * Provides detailed database metrics for production monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, DatabaseMetrics, PRODUCTION_DB_CONFIG } from '@/lib/database/production-config';
import { prisma } from '@/lib/prisma';

// Authentication for monitoring endpoints
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secretToken = request.headers.get('x-monitoring-secret');
  const querySecret = request.nextUrl.searchParams.get('secret');
  
  const expectedSecret = process.env.MONITORING_SECRET || process.env.HEALTH_CHECK_SECRET;
  
  if (!expectedSecret) return true; // Allow if no secret configured
  
  return authHeader === `Bearer ${expectedSecret}` || 
         secretToken === expectedSecret || 
         querySecret === expectedSecret;
}

// Get database performance metrics
async function getDatabaseMetrics() {
  try {
    // Get basic connection info
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        current_setting('server_version_num') as version_num
    `;

    // Get connection statistics
    const connectionStats = await prisma.$queryRaw`
      SELECT 
        state,
        COUNT(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `;

    // Get database size information
    const databaseSize = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as size_bytes
    `;

    // Get table statistics
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as total_operations,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY total_operations DESC
      LIMIT 10
    `;

    // Get index usage statistics
    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname||'.'||tablename as table_name,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE idx_scan > 0
      ORDER BY idx_scan DESC
      LIMIT 10
    `;

    // Get slow query statistics (if pg_stat_statements is available)
    let slowQueries: any[] = [];
    try {
      const queryResult = await prisma.$queryRaw`
        SELECT 
          calls,
          total_exec_time,
          mean_exec_time,
          LEFT(query, 100) as query_preview
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 5
      `;
      slowQueries = queryResult as any[];
    } catch {
      // pg_stat_statements not available
      slowQueries = [{ note: 'pg_stat_statements extension not available' }];
    }

    // Get system metrics
    const systemMetrics = DatabaseMetrics.getMetrics();

    return {
      timestamp: new Date().toISOString(),
      connection: (connectionInfo as any[])[0],
      connections: connectionStats,
      database: (databaseSize as any[])[0],
      tables: tableStats,
      indexes: indexStats,
      slowQueries: slowQueries,
      applicationMetrics: systemMetrics,
      configuration: {
        poolMax: PRODUCTION_DB_CONFIG.pool.max,
        poolMin: PRODUCTION_DB_CONFIG.pool.min,
        queryTimeout: PRODUCTION_DB_CONFIG.query.timeout,
        environment: process.env.NODE_ENV,
      }
    };

  } catch (error) {
    throw new Error(`Failed to collect database metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get database health status
async function getHealthStatus() {
  return await checkDatabaseHealth();
}

// Main monitoring endpoint
export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access to monitoring endpoint' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const check = searchParams.get('check') || 'all';

  try {
    let response: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    switch (check) {
      case 'health':
        response.health = await getHealthStatus();
        break;
        
      case 'metrics':
        response.metrics = await getDatabaseMetrics();
        break;
        
      case 'performance':
        response.performance = {
          applicationMetrics: DatabaseMetrics.getMetrics(),
          configuration: {
            poolMax: PRODUCTION_DB_CONFIG.pool.max,
            poolMin: PRODUCTION_DB_CONFIG.pool.min,
            queryTimeout: PRODUCTION_DB_CONFIG.query.timeout,
          }
        };
        break;
        
      case 'all':
      default:
        response.health = await getHealthStatus();
        response.metrics = await getDatabaseMetrics();
        break;
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// Database optimization endpoint (POST)
export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access to monitoring endpoint' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action;

    let result: any = {
      timestamp: new Date().toISOString(),
      action,
      status: 'completed'
    };

    switch (action) {
      case 'analyze':
        // Run ANALYZE on all tables
        await prisma.$executeRaw`ANALYZE`;
        result.message = 'Database statistics updated';
        break;

      case 'vacuum':
        // Run VACUUM on all tables (careful in production!)
        if (process.env.NODE_ENV !== 'production') {
          await prisma.$executeRaw`VACUUM`;
          result.message = 'Database vacuumed (non-production only)';
        } else {
          result.status = 'skipped';
          result.message = 'VACUUM skipped in production - use scheduled maintenance';
        }
        break;

      case 'reset-stats':
        // Reset query statistics
        try {
          await prisma.$executeRaw`SELECT pg_stat_statements_reset()`;
          result.message = 'Query statistics reset';
        } catch {
          result.status = 'skipped';
          result.message = 'pg_stat_statements not available';
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

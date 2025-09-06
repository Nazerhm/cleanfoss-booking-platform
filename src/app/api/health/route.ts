/**
 * Production Health Check API
 * Provides system health monitoring for production deployment
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSecurityConfig } from '@/lib/config/production-security';

const security = getSecurityConfig();

// Health check authentication
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secretToken = request.headers.get('x-health-secret');
  const querySecret = request.nextUrl.searchParams.get('secret');
  
  const expectedSecret = security.monitoring.healthCheck.secret;
  
  if (!expectedSecret) return true; // Allow if no secret configured
  
  return authHeader === `Bearer ${expectedSecret}` || 
         secretToken === expectedSecret || 
         querySecret === expectedSecret;
}

// Individual health checks
async function checkDatabase(): Promise<{ status: string; details?: any }> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      details: {
        responseTime: `${responseTime}ms`,
        connected: true
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown database error',
        connected: false
      }
    };
  }
}

async function checkAuth(): Promise<{ status: string; details?: any }> {
  try {
    // Test authentication configuration
    const authConfig = security.auth;
    const hasSecret = !!process.env.NEXTAUTH_SECRET;
    const hasUrl = !!process.env.NEXTAUTH_URL;
    
    return {
      status: hasSecret && hasUrl ? 'healthy' : 'unhealthy',
      details: {
        hasSecret,
        hasUrl,
        sessionMaxAge: authConfig.session.maxAge,
        isProduction: security.isProduction
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown auth error'
      }
    };
  }
}

async function checkSystem(): Promise<{ status: string; details?: any }> {
  try {
    return {
      status: 'healthy',
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
        environment: process.env.NODE_ENV,
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown system error'
      }
    };
  }
}

// Main health check endpoint
export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized health check access' },
      { status: 401 }
    );
  }

  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const [database, auth, system] = await Promise.all([
      checkDatabase(),
      checkAuth(), 
      checkSystem()
    ]);
    
    // Determine overall health status
    const allChecks = [database, auth, system];
    const unhealthyChecks = allChecks.filter(check => check.status === 'unhealthy');
    const overallStatus = unhealthyChecks.length === 0 ? 'healthy' : 'unhealthy';
    
    const responseTime = Date.now() - startTime;
    
    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database,
        auth,
        system
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthReport, { 
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error during health check',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

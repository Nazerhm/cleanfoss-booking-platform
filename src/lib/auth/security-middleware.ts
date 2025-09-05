/**
 * Security Middleware for CleanFoss Authentication System
 * Implements CSRF protection, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS, RATE_LIMIT, SecurityEventType } from './security-config';
import { prisma } from '../prisma';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });
  
  return response;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT = 'login'
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${type}:${ip}`;
  const config = RATE_LIMIT[type];
  const now = Date.now();

  let store = rateLimitStore.get(key);
  
  // Initialize or reset if window has passed
  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }

  // Check if currently blocked
  if (store.blockedUntil && now < store.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store.blockedUntil
    };
  }

  store.count++;
  
  // Check if limit exceeded
  if (store.count > config.maxAttempts) {
    store.blockedUntil = now + config.blockDuration;
    rateLimitStore.set(key, store);
    
    // Log security event
    logSecurityEvent(SecurityEventType.LOGIN_BLOCKED, {
      ip,
      timestamp: new Date(),
      details: `Rate limit exceeded for ${type}`
    });
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: store.blockedUntil
    };
  }

  rateLimitStore.set(key, store);
  
  return {
    allowed: true,
    remaining: config.maxAttempts - store.count,
    resetTime: store.resetTime
  };
}

/**
 * CSRF Token validation
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const sessionToken = request.cookies.get('next-auth.csrf-token');
  
  if (!token || !sessionToken) {
    return false;
  }
  
  // Simple token validation (in production, use crypto.timingSafeEqual)
  return token === sessionToken.value;
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  if (!origin && !referer) {
    return false; // Require origin or referer for state-changing requests
  }
  
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`, // Allow HTTP for development
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean);
  
  if (origin) {
    return allowedOrigins.includes(origin);
  }
  
  if (referer) {
    const refererUrl = new URL(referer);
    return allowedOrigins.includes(refererUrl.origin);
  }
  
  return false;
}

/**
 * Detect suspicious activity patterns
 */
export function detectSuspiciousActivity(request: NextRequest, context: any): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || '';
  
  // Check for bot/automated requests
  const suspiciousBots = [
    'bot', 'crawler', 'spider', 'scraper', 'automation',
    'python', 'curl', 'wget', 'postman'
  ];
  
  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    return true;
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /update.*set/i,
    /exec.*sp_/i,
    /xp_cmdshell/i
  ];
  
  const requestBody = JSON.stringify(context);
  if (sqlPatterns.some(pattern => pattern.test(requestBody))) {
    return true;
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /vbscript:/i
  ];
  
  if (xssPatterns.some(pattern => pattern.test(requestBody))) {
    return true;
  }
  
  return false;
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  details: {
    ip?: string;
    userId?: string;
    userAgent?: string;
    timestamp: Date;
    details?: string;
    request?: any;
  }
): Promise<void> {
  try {
    // In production, use a dedicated logging service
    console.log(`[SECURITY] ${eventType}:`, {
      type: eventType,
      timestamp: details.timestamp,
      ip: details.ip,
      userId: details.userId,
      userAgent: details.userAgent,
      details: details.details
    });
    
    // Store in database for audit trail
    if (prisma) {
      // Note: You would need to add a SecurityLog model to your Prisma schema
      // await prisma.securityLog.create({
      //   data: {
      //     eventType,
      //     ip: details.ip,
      //     userId: details.userId,
      //     userAgent: details.userAgent,
      //     details: details.details,
      //     timestamp: details.timestamp,
      //   }
      // });
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Security middleware wrapper for API routes
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    requireCSRF?: boolean;
    rateLimitType?: keyof typeof RATE_LIMIT;
    validateOrigin?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      // Apply rate limiting
      if (options.rateLimitType) {
        const rateResult = rateLimit(request, options.rateLimitType);
        if (!rateResult.allowed) {
          const response = NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
          
          response.headers.set('X-RateLimit-Remaining', '0');
          response.headers.set('X-RateLimit-Reset', rateResult.resetTime.toString());
          
          return applySecurityHeaders(response);
        }
      }
      
      // Validate CSRF token for state-changing requests
      if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        if (!validateCSRFToken(request)) {
          await logSecurityEvent(SecurityEventType.CSRF_ATTACK, {
            ip: request.ip || request.headers.get('x-forwarded-for') || '',
            timestamp: new Date(),
            details: 'CSRF token validation failed'
          });
          
          const response = NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
          
          return applySecurityHeaders(response);
        }
      }
      
      // Validate request origin
      if (options.validateOrigin && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        if (!validateOrigin(request)) {
          const response = NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
          );
          
          return applySecurityHeaders(response);
        }
      }
      
      // Detect suspicious activity
      if (detectSuspiciousActivity(request, {})) {
        await logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          ip: request.ip || request.headers.get('x-forwarded-for') || '',
          userAgent: request.headers.get('user-agent') || '',
          timestamp: new Date(),
          details: 'Suspicious activity detected'
        });
        
        const response = NextResponse.json(
          { error: 'Suspicious activity detected' },
          { status: 403 }
        );
        
        return applySecurityHeaders(response);
      }
      
      // Process the request
      const response = await handler(request);
      
      // Apply security headers
      const secureResponse = applySecurityHeaders(response);
      
      // Log successful request (optional, for audit)
      const processingTime = Date.now() - startTime;
      if (processingTime > 5000) { // Log slow requests
        console.log(`[PERFORMANCE] Slow request: ${request.method} ${request.url} took ${processingTime}ms`);
      }
      
      return secureResponse;
      
    } catch (error) {
      console.error('Security middleware error:', error);
      
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      return applySecurityHeaders(response);
    }
  };
}

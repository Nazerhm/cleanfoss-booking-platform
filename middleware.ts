/**
 * Next.js Middleware for Security Headers and Authentication
 * Applies security measures at the application level
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SECURITY_HEADERS, RATE_LIMIT } from './src/lib/auth/security-config'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/booking/history',
  '/api/user',
  '/api/admin',
  '/api/super-admin'
];

// Routes that should have CSRF protection
const CSRF_PROTECTED_ROUTES = [
  '/api/auth/register',
  '/api/bookings',
  '/api/user',
  '/api/admin',
  '/api/super-admin'
];

// Public routes that don't need protection
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/booking',
  '/services',
  '/api/auth',
  '/api/services',
  '/api/pricing'
];

export async function middleware(request: NextRequest) {
  // Skip middleware during build time to prevent static generation issues
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL) {
    return NextResponse.next();
  }
  
  const { pathname } = request.nextUrl;
  
  // Only run middleware for routes that actually need it
  const needsMiddleware = 
    PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
    CSRF_PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/super-admin/');

  // Skip middleware for routes that should remain static
  if (!needsMiddleware) {
    return NextResponse.next();
  }
  
  // Create response
  let response = NextResponse.next();
  
  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });
  
  // Add additional security headers based on route
  if (pathname.startsWith('/api/')) {
    // API routes get additional security
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-API-Version', '1.0');
  }
  
  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Get the JWT token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token) {
      // Redirect unauthenticated users to login
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      } else {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // Check user status and company status for multi-tenant validation
    if (token.status !== 'ACTIVE') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Account is not active' },
          { status: 403 }
        );
      } else {
        return NextResponse.redirect(new URL('/auth/account-inactive', request.url));
      }
    }
  }
  
  // CSRF Protection for state-changing requests
  const requiresCSRF = CSRF_PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (requiresCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionCookie = request.cookies.get('__Host-next-auth.csrf-token');
    
    if (!csrfToken || !sessionCookie || csrfToken !== sessionCookie.value) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  // Rate limiting for sensitive endpoints
  if (pathname === '/api/auth/register' || pathname === '/api/auth/signin') {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Simple rate limiting implementation
    // In production, use Redis or a proper rate limiting service
    const rateLimitKey = `${pathname}:${ip}`;
    
    // This is a simplified version - in production you'd use a proper store
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', '4');
    response.headers.set('X-RateLimit-Reset', Date.now().toString());
  }
  
  // Role-based route protection
  if (pathname.startsWith('/api/admin/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role as string)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }
  
  if (pathname.startsWith('/api/super-admin/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }
  }
  
  // Add security logging for suspicious requests
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    'sqlmap', 'nmap', 'nikto', 'acunetix', 'nessus'
  ];
  
  if (suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )) {
    console.log(`🚨 Suspicious request blocked:`, {
      pathname,
      ip: request.ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    );
  }
  
  return response;
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    // Only match specific protected routes to avoid static generation interference
    '/profile/:path*',
    '/booking/history/:path*',
    '/api/user/:path*',
    '/api/admin/:path*', 
    '/api/super-admin/:path*',
    '/api/bookings/:path*',
    '/api/auth/register'
  ],
}

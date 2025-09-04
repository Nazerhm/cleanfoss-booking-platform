import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Enhanced request type with authenticated user
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    companyId?: string;
  };
}

// Standard error responses
export const AuthErrors = {
  UNAUTHORIZED: {
    error: 'Unauthorized',
    message: 'Authentication required',
  },
  FORBIDDEN: {
    error: 'Forbidden',
    message: 'Insufficient permissions',
  },
  INVALID_SESSION: {
    error: 'Invalid Session',
    message: 'Please log in again',
  },
} as const;

/**
 * Higher-order function for API route authentication
 * Requires valid session to access the route
 */
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 });
      }

      // Fetch complete user data from database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyId: true,
        },
      });

      if (!user) {
        return NextResponse.json(AuthErrors.INVALID_SESSION, { status: 401 });
      }

      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
        companyId: user.companyId || undefined,
      };

      return await handler(authenticatedRequest, ...args);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Higher-order function for role-based API route protection
 * Requires valid session AND specific role(s)
 */
export function withRole<T extends any[]>(
  allowedRoles: UserRole[],
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (request: AuthenticatedRequest, ...args: T) => {
    if (!allowedRoles.includes(request.user.role)) {
      return NextResponse.json(AuthErrors.FORBIDDEN, { status: 403 });
    }

    return await handler(request, ...args);
  });
}

/**
 * Higher-order function for optional authentication
 * Allows both authenticated and guest access, but adds user data when available
 */
export function optionalAuth<T extends any[]>(
  handler: (request: NextRequest & { user?: AuthenticatedRequest['user'] }, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      // Extend request with optional user data
      const extendedRequest = request as NextRequest & { user?: AuthenticatedRequest['user'] };

      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
          },
        });

        if (user) {
          extendedRequest.user = {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
            companyId: user.companyId || undefined,
          };
        }
      }

      return await handler(extendedRequest, ...args);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // For optional auth, continue without user data on error
      return await handler(request as NextRequest & { user?: undefined }, ...args);
    }
  };
}

/**
 * Admin-only middleware (ADMIN, SUPER_ADMIN)
 */
export function withAdmin<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRole(['ADMIN', 'SUPER_ADMIN'], handler);
}

/**
 * Super Admin-only middleware
 */
export function withSuperAdmin<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRole(['SUPER_ADMIN'], handler);
}

/**
 * Company-scoped access middleware
 * Ensures users can only access data from their own company
 */
export function withCompanyScope<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (request: AuthenticatedRequest, ...args: T) => {
    if (!request.user.companyId) {
      return NextResponse.json(
        { error: 'Company Required', message: 'User must be associated with a company' },
        { status: 400 }
      );
    }

    return await handler(request, ...args);
  });
}

/**
 * Utility function to check if user has permission for company data
 */
export function canAccessCompanyData(userRole: UserRole, userCompanyId: string | undefined, targetCompanyId: string): boolean {
  // Super admins can access all company data
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // All other users must be in the same company
  return userCompanyId === targetCompanyId;
}

/**
 * Middleware for company-scoped data access with role elevation
 */
export function withCompanyAccess<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (request: AuthenticatedRequest, ...args: T) => {
    // Super admins have access to all companies
    if (request.user.role === 'SUPER_ADMIN') {
      return await handler(request, ...args);
    }

    // Regular users must have a company
    if (!request.user.companyId) {
      return NextResponse.json(
        { error: 'Company Required', message: 'User must be associated with a company' },
        { status: 400 }
      );
    }

    return await handler(request, ...args);
  });
}

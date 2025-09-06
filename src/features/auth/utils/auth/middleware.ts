// Authentication and authorization middleware for API routes
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth'
import { UserRole, Permission, hasPermission, hasRoleLevel, canAccessCompany } from './permissions'
import { AuthUser } from './roleUtils'

interface AuthError {
  code: string
  message: string
  statusCode: number
}

// Authentication error types
export const AuthErrors = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Du skal være logget ind for at få adgang til denne ressource',
    statusCode: 401
  },
  FORBIDDEN: {
    code: 'FORBIDDEN', 
    message: 'Du har ikke tilladelse til at få adgang til denne ressource',
    statusCode: 403
  },
  INVALID_SESSION: {
    code: 'INVALID_SESSION',
    message: 'Din session er ugyldig. Log venligst ind igen',
    statusCode: 401
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 'INSUFFICIENT_PERMISSIONS',
    message: 'Du har ikke de nødvendige tilladelser til at udføre denne handling',
    statusCode: 403
  }
} as const

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: (session.user.role as UserRole) || UserRole.CUSTOMER,
      companyId: session.user.companyId || null
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

/**
 * Create error response for authentication failures
 */
export function createAuthErrorResponse(error: AuthError): NextResponse {
  return NextResponse.json(
    {
      error: error.code,
      message: error.message
    },
    { status: error.statusCode }
  )
}

/**
 * Require user authentication for API route
 */
export function requireAuth() {
  return async function middleware(request: NextRequest): Promise<AuthUser | NextResponse> {
    const user = await getAuthUser(request)
    
    if (!user) {
      return createAuthErrorResponse(AuthErrors.UNAUTHORIZED)
    }
    
    return user
  }
}

/**
 * Require specific user role for API route
 */
export function requireRole(requiredRole: UserRole) {
  return async function middleware(request: NextRequest): Promise<AuthUser | NextResponse> {
    const authResult = await requireAuth()(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const user = authResult as AuthUser
    
    if (!hasRoleLevel(user.role, requiredRole)) {
      return createAuthErrorResponse(AuthErrors.INSUFFICIENT_PERMISSIONS)
    }
    
    return user
  }
}

/**
 * Require specific permission for API route
 */
export function requirePermission(permission: Permission) {
  return async function middleware(request: NextRequest): Promise<AuthUser | NextResponse> {
    const authResult = await requireAuth()(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const user = authResult as AuthUser
    
    if (!hasPermission(user.role, permission)) {
      return createAuthErrorResponse(AuthErrors.INSUFFICIENT_PERMISSIONS)
    }
    
    return user
  }
}

/**
 * Require company access for API route
 */
export function requireCompanyAccess(getCompanyId: (request: NextRequest) => string | null | Promise<string | null>) {
  return async function middleware(request: NextRequest): Promise<AuthUser | NextResponse> {
    const authResult = await requireAuth()(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const user = authResult as AuthUser
    const targetCompanyId = await getCompanyId(request)
    
    if (!canAccessCompany(user.role, user.companyId, targetCompanyId)) {
      return createAuthErrorResponse(AuthErrors.FORBIDDEN)
    }
    
    return user
  }
}

/**
 * Combined authorization middleware
 */
export interface AuthMiddlewareOptions {
  role?: UserRole
  permission?: Permission
  companyAccess?: (request: NextRequest) => string | null | Promise<string | null>
  allowSelf?: boolean // Allow users to access their own resources
}

export function withAuth(options: AuthMiddlewareOptions = {}) {
  return async function middleware(request: NextRequest): Promise<AuthUser | NextResponse> {
    // First check authentication
    const authResult = await requireAuth()(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const user = authResult as AuthUser
    
    // Check role requirement
    if (options.role && !hasRoleLevel(user.role, options.role)) {
      return createAuthErrorResponse(AuthErrors.INSUFFICIENT_PERMISSIONS)
    }
    
    // Check permission requirement
    if (options.permission && !hasPermission(user.role, options.permission)) {
      return createAuthErrorResponse(AuthErrors.INSUFFICIENT_PERMISSIONS)
    }
    
    // Check company access
    if (options.companyAccess) {
      const targetCompanyId = await options.companyAccess(request)
      if (!canAccessCompany(user.role, user.companyId, targetCompanyId)) {
        return createAuthErrorResponse(AuthErrors.FORBIDDEN)
      }
    }
    
    return user
  }
}

/**
 * Helper to extract user ID from URL parameters
 */
export function getUserIdFromParams(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  
  // Look for user ID in common patterns like /api/users/:userId
  const userIndex = pathSegments.findIndex(segment => segment === 'users')
  if (userIndex >= 0 && pathSegments[userIndex + 1]) {
    return pathSegments[userIndex + 1]
  }
  
  return null
}

/**
 * Helper to extract company ID from URL parameters
 */
export function getCompanyIdFromParams(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  
  // Look for company ID in common patterns like /api/companies/:companyId
  const companyIndex = pathSegments.findIndex(segment => segment === 'companies')
  if (companyIndex >= 0 && pathSegments[companyIndex + 1]) {
    return pathSegments[companyIndex + 1]
  }
  
  return null
}

/**
 * Check if user can access their own resources
 */
export function canAccessSelfResource(user: AuthUser, resourceUserId: string): boolean {
  return user.id === resourceUserId
}

/**
 * Wrapper for API route handlers with authentication
 */
export function withApiAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse> | NextResponse,
  options: AuthMiddlewareOptions = {}
) {
  return async function(request: NextRequest): Promise<NextResponse> {
    const authResult = await withAuth(options)(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const user = authResult as AuthUser
    
    // Handle self-access for customer resources
    if (options.allowSelf && user.role === UserRole.CUSTOMER) {
      const userId = getUserIdFromParams(request)
      if (userId && userId !== user.id) {
        return createAuthErrorResponse(AuthErrors.FORBIDDEN)
      }
    }
    
    try {
      return await handler(request, user)
    } catch (error) {
      console.error('API route error:', error)
      return NextResponse.json(
        {
          error: 'INTERNAL_ERROR',
          message: 'Der opstod en intern fejl'
        },
        { status: 500 }
      )
    }
  }
}

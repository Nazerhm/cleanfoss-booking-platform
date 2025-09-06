// Authentication and authorization library exports

// Core permissions and roles
export * from './permissions'
export * from './roleUtils'

// Middleware for API routes
export * from './middleware'

// Enhanced API middleware
export {
  withAuth as withApiAuth,
  withRole as withApiRole,
  optionalAuth,
  withAdmin,
  withSuperAdmin,
  withCompanyScope,
  withCompanyAccess,
  canAccessCompanyData,
  AuthErrors as ApiAuthErrors
} from './api-middleware'

export type { AuthenticatedRequest } from './api-middleware'

// React hooks for components
export * from './hooks'

// Role checking utilities and helper functions
import { UserRole, Permission, hasPermission, hasRoleLevel, canAccessCompany } from './permissions'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string | null
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
}

/**
 * Role-based access control utility class
 */
export class RoleUtils {
  private user: AuthUser | null

  constructor(user: AuthUser | null) {
    this.user = user
  }

  /**
   * Check if current user is authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null
  }

  /**
   * Get current user role
   */
  getRole(): UserRole | null {
    return this.user?.role || null
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    if (!this.user) return false
    return hasPermission(this.user.role, permission)
  }

  /**
   * Check if user has required role level or higher
   */
  hasRoleLevel(requiredRole: UserRole): boolean {
    if (!this.user) return false
    return hasRoleLevel(this.user.role, requiredRole)
  }

  /**
   * Check if user can access company-scoped resources
   */
  canAccessCompany(targetCompanyId: string | null): boolean {
    if (!this.user) return false
    return canAccessCompany(this.user.role, this.user.companyId, targetCompanyId)
  }

  /**
   * Check if user is a customer
   */
  isCustomer(): boolean {
    return this.user?.role === UserRole.CUSTOMER
  }

  /**
   * Check if user is an agent or higher
   */
  isAgent(): boolean {
    if (!this.user) return false
    return hasRoleLevel(this.user.role, UserRole.AGENT)
  }

  /**
   * Check if user is finance role
   */
  isFinance(): boolean {
    return this.user?.role === UserRole.FINANCE
  }

  /**
   * Check if user is an admin or higher
   */
  isAdmin(): boolean {
    if (!this.user) return false
    return hasRoleLevel(this.user.role, UserRole.ADMIN)
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.user?.role === UserRole.SUPER_ADMIN
  }

  /**
   * Check if user can manage bookings
   */
  canManageBookings(): boolean {
    return this.hasPermission(Permission.MANAGE_BOOKINGS)
  }

  /**
   * Check if user can view all bookings or only own bookings
   */
  canViewAllBookings(): boolean {
    return this.hasPermission(Permission.VIEW_ALL_BOOKINGS)
  }

  /**
   * Check if user can manage services
   */
  canManageServices(): boolean {
    return this.hasPermission(Permission.MANAGE_SERVICES)
  }

  /**
   * Check if user can manage company settings
   */
  canManageCompany(): boolean {
    return this.hasPermission(Permission.MANAGE_COMPANY)
  }

  /**
   * Check if user can manage other users
   */
  canManageUsers(): boolean {
    return this.hasPermission(Permission.MANAGE_USERS)
  }

  /**
   * Check if user can view financial data
   */
  canViewFinancial(): boolean {
    return this.hasPermission(Permission.VIEW_PAYMENTS) || 
           this.hasPermission(Permission.VIEW_FINANCIAL_REPORTS)
  }

  /**
   * Get user's company ID
   */
  getCompanyId(): string | null {
    return this.user?.companyId || null
  }

  /**
   * Get user information for display
   */
  getUserInfo(): AuthUser | null {
    return this.user
  }
}

/**
 * Factory function to create RoleUtils instance
 */
export function createRoleUtils(user: AuthUser | null): RoleUtils {
  return new RoleUtils(user)
}

/**
 * Higher-order function for role-based conditional execution
 */
export function withRole<T>(
  user: AuthUser | null,
  requiredRole: UserRole,
  callback: () => T
): T | null {
  const roleUtils = createRoleUtils(user)
  
  if (roleUtils.hasRoleLevel(requiredRole)) {
    return callback()
  }
  
  return null
}

/**
 * Higher-order function for permission-based conditional execution
 */
export function withPermission<T>(
  user: AuthUser | null,
  permission: Permission,
  callback: () => T
): T | null {
  const roleUtils = createRoleUtils(user)
  
  if (roleUtils.hasPermission(permission)) {
    return callback()
  }
  
  return null
}

/**
 * Filter items based on user permissions and company access
 */
export function filterByAccess<T extends { companyId?: string | null }>(
  user: AuthUser | null,
  items: T[],
  permission?: Permission
): T[] {
  if (!user) return []
  
  const roleUtils = createRoleUtils(user)
  
  // Check permission if provided
  if (permission && !roleUtils.hasPermission(permission)) {
    return []
  }
  
  // Super admin can see all
  if (roleUtils.isSuperAdmin()) {
    return items
  }
  
  // Filter by company access
  return items.filter(item => {
    if (!item.companyId) return true // Public items
    return roleUtils.canAccessCompany(item.companyId)
  })
}

/**
 * Check if user can access specific resource
 */
export function canAccessResource(
  user: AuthUser | null,
  resource: {
    companyId?: string | null
    userId?: string | null
  },
  permission?: Permission
): boolean {
  if (!user) return false
  
  const roleUtils = createRoleUtils(user)
  
  // Check permission if provided
  if (permission && !roleUtils.hasPermission(permission)) {
    return false
  }
  
  // Super admin can access all
  if (roleUtils.isSuperAdmin()) {
    return true
  }
  
  // Check company access
  if (resource.companyId) {
    if (!roleUtils.canAccessCompany(resource.companyId)) {
      return false
    }
  }
  
  // Check user ownership (customers can only access own resources)
  if (roleUtils.isCustomer() && resource.userId) {
    return resource.userId === user.id
  }
  
  return true
}

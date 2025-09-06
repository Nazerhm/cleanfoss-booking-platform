// React hooks for role-based access control
'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { UserRole, Permission } from './permissions'
import { AuthUser, RoleUtils, createRoleUtils } from './roleUtils'

/**
 * Hook to get current authenticated user
 */
export function useAuthUser(): AuthUser | null {
  const { data: session } = useSession()
  
  return useMemo(() => {
    if (!session?.user) return null
    
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: (session.user.role as UserRole) || UserRole.CUSTOMER,
      companyId: session.user.companyId || null
    }
  }, [session])
}

/**
 * Hook to get role utilities for the current user
 */
export function useRoleUtils(): RoleUtils {
  const user = useAuthUser()
  return useMemo(() => createRoleUtils(user), [user])
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: Permission): boolean {
  const roleUtils = useRoleUtils()
  return roleUtils.hasPermission(permission)
}

/**
 * Hook to check if user has required role level
 */
export function useRole(requiredRole: UserRole): boolean {
  const roleUtils = useRoleUtils()
  return roleUtils.hasRoleLevel(requiredRole)
}

/**
 * Hook to check if user can access company resources
 */
export function useCompanyAccess(targetCompanyId: string | null): boolean {
  const roleUtils = useRoleUtils()
  return roleUtils.canAccessCompany(targetCompanyId)
}

/**
 * Hook for customer-specific checks
 */
export function useCustomerAccess() {
  const roleUtils = useRoleUtils()
  
  return {
    isCustomer: roleUtils.isCustomer(),
    canViewOwnBookings: roleUtils.hasPermission(Permission.VIEW_OWN_BOOKINGS),
    canCreateBookings: roleUtils.hasPermission(Permission.CREATE_BOOKINGS)
  }
}

/**
 * Hook for agent-specific checks
 */
export function useAgentAccess() {
  const roleUtils = useRoleUtils()
  
  return {
    isAgent: roleUtils.isAgent(),
    canManageBookings: roleUtils.canManageBookings(),
    canViewAllBookings: roleUtils.canViewAllBookings(),
    canViewVehicles: roleUtils.hasPermission(Permission.VIEW_VEHICLES)
  }
}

/**
 * Hook for finance-specific checks
 */
export function useFinanceAccess() {
  const roleUtils = useRoleUtils()
  
  return {
    isFinance: roleUtils.isFinance(),
    canViewPayments: roleUtils.hasPermission(Permission.VIEW_PAYMENTS),
    canManagePayments: roleUtils.hasPermission(Permission.MANAGE_PAYMENTS),
    canViewReports: roleUtils.hasPermission(Permission.VIEW_FINANCIAL_REPORTS)
  }
}

/**
 * Hook for admin-specific checks
 */
export function useAdminAccess() {
  const roleUtils = useRoleUtils()
  
  return {
    isAdmin: roleUtils.isAdmin(),
    canManageCompany: roleUtils.canManageCompany(),
    canManageUsers: roleUtils.canManageUsers(),
    canManageServices: roleUtils.canManageServices(),
    canViewFinancial: roleUtils.canViewFinancial()
  }
}

/**
 * Hook for super admin checks
 */
export function useSuperAdminAccess() {
  const roleUtils = useRoleUtils()
  
  return {
    isSuperAdmin: roleUtils.isSuperAdmin(),
    hasSystemAccess: roleUtils.hasPermission(Permission.SYSTEM_ADMIN),
    canViewAllCompanies: roleUtils.hasPermission(Permission.VIEW_ALL_COMPANIES),
    canViewLogs: roleUtils.hasPermission(Permission.VIEW_LOGS)
  }
}

/**
 * Hook to get user display information
 */
export function useUserDisplay() {
  const user = useAuthUser()
  const { getRoleDisplayName, getRoleDescription } = require('./permissions')
  
  return useMemo(() => {
    if (!user) {
      return {
        displayName: 'Ikke logget ind',
        roleName: '',
        roleDescription: '',
        initials: 'GL'
      }
    }
    
    // Generate initials from name
    const initials = user.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
    
    return {
      displayName: user.name,
      roleName: getRoleDisplayName(user.role),
      roleDescription: getRoleDescription(user.role),
      initials: initials || 'U',
      email: user.email
    }
  }, [user])
}

/**
 * Hook for navigation-specific role checks
 */
export function useNavigation() {
  const roleUtils = useRoleUtils()
  
  return {
    // Main navigation items visibility
    showDashboard: roleUtils.isAgent(),
    showBookings: roleUtils.hasPermission(Permission.VIEW_ALL_BOOKINGS) || roleUtils.hasPermission(Permission.VIEW_OWN_BOOKINGS),
    showServices: roleUtils.hasPermission(Permission.VIEW_SERVICES),
    showVehicles: roleUtils.hasPermission(Permission.VIEW_VEHICLES),
    showUsers: roleUtils.hasPermission(Permission.MANAGE_USERS),
    showCompany: roleUtils.hasPermission(Permission.MANAGE_COMPANY),
    showFinance: roleUtils.canViewFinancial(),
    showReports: roleUtils.hasPermission(Permission.VIEW_FINANCIAL_REPORTS),
    showAdmin: roleUtils.isAdmin(),
    showSystem: roleUtils.hasPermission(Permission.SYSTEM_ADMIN),
    
    // Action permissions
    canCreateBooking: roleUtils.hasPermission(Permission.CREATE_BOOKINGS),
    canManageBooking: roleUtils.hasPermission(Permission.MANAGE_BOOKINGS),
    canCreateUser: roleUtils.hasPermission(Permission.CREATE_USERS),
    canManageService: roleUtils.hasPermission(Permission.MANAGE_SERVICES),
    canViewPayments: roleUtils.hasPermission(Permission.VIEW_PAYMENTS)
  }
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(permissions: Permission[]): Record<Permission, boolean> {
  const roleUtils = useRoleUtils()
  
  return useMemo(() => {
    const result: Record<Permission, boolean> = {} as Record<Permission, boolean>
    
    permissions.forEach(permission => {
      result[permission] = roleUtils.hasPermission(permission)
    })
    
    return result
  }, [roleUtils, permissions])
}

/**
 * Hook to filter items based on user access
 */
export function useAccessFilter<T extends { companyId?: string | null }>() {
  const user = useAuthUser()
  const { filterByAccess } = require('./roleUtils')
  
  return (items: T[], permission?: Permission): T[] => {
    return filterByAccess(user, items, permission)
  }
}

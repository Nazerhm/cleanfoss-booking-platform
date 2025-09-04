'use client'

import React from 'react'
import { UserRole, Permission } from '@/lib/auth/permissions'
import { useRole, usePermission, useCompanyAccess, useAuthUser } from '@/lib/auth/hooks'

interface BaseRoleGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

interface RoleGuardProps extends BaseRoleGuardProps {
  role?: UserRole
  permission?: Permission
  companyId?: string | null
  allowSelf?: boolean
  resourceUserId?: string
}

/**
 * Guard component for role-based conditional rendering
 */
export function RoleGuard({
  children,
  fallback = null,
  loading = null,
  role,
  permission,
  companyId,
  allowSelf = false,
  resourceUserId
}: RoleGuardProps) {
  const user = useAuthUser()
  const hasRequiredRole = useRole(role || UserRole.CUSTOMER)
  const hasRequiredPermission = usePermission(permission || Permission.VIEW_SERVICES)
  const canAccessCompany = useCompanyAccess(companyId ?? null)
  
  // Loading state while session is being fetched
  if (user === undefined) {
    return <>{loading}</>
  }
  
  // Not authenticated
  if (!user) {
    return <>{fallback}</>
  }
  
  // Check role requirement
  if (role && !hasRequiredRole) {
    // Special case: allow users to access their own resources
    if (allowSelf && resourceUserId && user.id === resourceUserId) {
      // Continue to other checks
    } else {
      return <>{fallback}</>
    }
  }
  
  // Check permission requirement
  if (permission && !hasRequiredPermission) {
    // Special case: allow users to access their own resources
    if (allowSelf && resourceUserId && user.id === resourceUserId) {
      // Continue to other checks
    } else {
      return <>{fallback}</>
    }
  }
  
  // Check company access
  if (companyId !== undefined && !canAccessCompany) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Guard for customer-only content
 */
export function CustomerGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard role={UserRole.CUSTOMER} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for agent-level access and above
 */
export function AgentGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard role={UserRole.AGENT} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for finance access
 */
export function FinanceGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard role={UserRole.FINANCE} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for admin-level access and above
 */
export function AdminGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard role={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for super admin access only
 */
export function SuperAdminGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard role={UserRole.SUPER_ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for booking management permissions
 */
export function BookingManagementGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard permission={Permission.MANAGE_BOOKINGS} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for service management permissions  
 */
export function ServiceManagementGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard permission={Permission.MANAGE_SERVICES} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for financial data access
 */
export function FinancialGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard permission={Permission.VIEW_PAYMENTS} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for user management permissions
 */
export function UserManagementGuard({ children, fallback }: BaseRoleGuardProps) {
  return (
    <RoleGuard permission={Permission.MANAGE_USERS} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard that shows content only to unauthenticated users
 */
export function UnauthenticatedGuard({ children, fallback }: BaseRoleGuardProps) {
  const user = useAuthUser()
  
  if (user) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Guard that shows content only to authenticated users
 */
export function AuthenticatedGuard({ children, fallback, loading }: BaseRoleGuardProps) {
  const user = useAuthUser()
  
  // Loading state
  if (user === undefined) {
    return <>{loading}</>
  }
  
  if (!user) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

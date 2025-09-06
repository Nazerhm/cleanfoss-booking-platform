// Permission and role hierarchy definitions

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN', 
  AGENT = 'AGENT',
  FINANCE = 'FINANCE',
  CUSTOMER = 'CUSTOMER'
}

// Permission categories for granular access control
export enum Permission {
  // User Management
  CREATE_USERS = 'CREATE_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Company Management
  MANAGE_COMPANY = 'MANAGE_COMPANY',
  VIEW_ALL_COMPANIES = 'VIEW_ALL_COMPANIES',
  
  // Service Management
  MANAGE_SERVICES = 'MANAGE_SERVICES',
  VIEW_SERVICES = 'VIEW_SERVICES',
  
  // Booking Management
  CREATE_BOOKINGS = 'CREATE_BOOKINGS',
  VIEW_ALL_BOOKINGS = 'VIEW_ALL_BOOKINGS',
  VIEW_OWN_BOOKINGS = 'VIEW_OWN_BOOKINGS',
  MANAGE_BOOKINGS = 'MANAGE_BOOKINGS',
  
  // Vehicle Management
  MANAGE_VEHICLES = 'MANAGE_VEHICLES',
  VIEW_VEHICLES = 'VIEW_VEHICLES',
  
  // Financial Operations
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',
  VIEW_FINANCIAL_REPORTS = 'VIEW_FINANCIAL_REPORTS',
  
  // System Administration
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  VIEW_LOGS = 'VIEW_LOGS'
}

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 1,
  [UserRole.AGENT]: 2,
  [UserRole.FINANCE]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5
}

// Role-based permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.SYSTEM_ADMIN,
    Permission.VIEW_LOGS,
    Permission.CREATE_USERS,
    Permission.MANAGE_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_ALL_COMPANIES,
    Permission.MANAGE_COMPANY,
    Permission.MANAGE_SERVICES,
    Permission.VIEW_SERVICES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.MANAGE_VEHICLES,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PAYMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.CREATE_BOOKINGS
  ],
  
  [UserRole.ADMIN]: [
    // Company-wide management
    Permission.CREATE_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_COMPANY,
    Permission.MANAGE_SERVICES,
    Permission.VIEW_SERVICES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.MANAGE_VEHICLES,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.CREATE_BOOKINGS
  ],
  
  [UserRole.AGENT]: [
    // Service operations
    Permission.VIEW_SERVICES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_BOOKINGS,
    Permission.VIEW_PAYMENTS
  ],
  
  [UserRole.FINANCE]: [
    // Financial operations
    Permission.VIEW_SERVICES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.MANAGE_PAYMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_VEHICLES
  ],
  
  [UserRole.CUSTOMER]: [
    // Basic customer access
    Permission.VIEW_OWN_BOOKINGS,
    Permission.CREATE_BOOKINGS,
    Permission.VIEW_SERVICES
  ]
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole] || []
  return permissions.includes(permission)
}

/**
 * Check if a role has higher or equal hierarchy than another role
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return rolePermissions[userRole] || []
}

/**
 * Check if user can access company-scoped resources
 */
export function canAccessCompany(
  userRole: UserRole, 
  userCompanyId: string | null, 
  targetCompanyId: string | null
): boolean {
  // Super admins can access all companies
  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }
  
  // Other roles need to be in the same company
  if (!userCompanyId || !targetCompanyId) {
    return false
  }
  
  return userCompanyId === targetCompanyId
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // Can only manage users with lower role hierarchy
  return roleHierarchy[managerRole] > roleHierarchy[targetRole]
}

/**
 * Get user role display name in Danish
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Superadministrator',
    [UserRole.ADMIN]: 'Administrator', 
    [UserRole.AGENT]: 'Agent',
    [UserRole.FINANCE]: 'Økonomi',
    [UserRole.CUSTOMER]: 'Kunde'
  }
  
  return roleNames[role] || 'Ukendt rolle'
}

/**
 * Get role description in Danish
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Fuld systemadgang til alle funktioner og virksomheder',
    [UserRole.ADMIN]: 'Virksomhedsadministrator med adgang til ledelse og rapporter',
    [UserRole.AGENT]: 'Servicetekniker med adgang til bookinger og køretøjer',
    [UserRole.FINANCE]: 'Økonomimedarbejder med adgang til betalinger og rapporter',
    [UserRole.CUSTOMER]: 'Kunde med adgang til egne bookinger og services'
  }
  
  return descriptions[role] || 'Ingen beskrivelse tilgængelig'
}

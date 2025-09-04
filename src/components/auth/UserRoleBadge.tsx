'use client'

import React from 'react'
import { UserRole, getRoleDisplayName } from '@/lib/auth/permissions'

interface UserRoleBadgeProps {
  role: UserRole
  className?: string
  showIcon?: boolean
}

/**
 * Component to display user role as a styled badge
 */
export default function UserRoleBadge({ role, className = '', showIcon = true }: UserRoleBadgeProps) {
  // Role-based styling
  const getRoleStyles = (role: UserRole): string => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return `${baseStyles} bg-purple-100 text-purple-800 border border-purple-200`
      case UserRole.ADMIN:
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`
      case UserRole.AGENT:
        return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`
      case UserRole.FINANCE:
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`
      case UserRole.CUSTOMER:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }
  
  // Role icons
  const getRoleIcon = (role: UserRole): JSX.Element | null => {
    if (!showIcon) return null
    
    const iconClass = 'w-3 h-3 mr-1'
    
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case UserRole.ADMIN:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        )
      case UserRole.AGENT:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        )
      case UserRole.FINANCE:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        )
      case UserRole.CUSTOMER:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <span className={`${getRoleStyles(role)} ${className}`}>
      {getRoleIcon(role)}
      {getRoleDisplayName(role)}
    </span>
  )
}

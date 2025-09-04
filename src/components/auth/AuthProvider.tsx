'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN'
  companyId?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Internal component that uses NextAuth session
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<User | null>(null)

  // Update user when session changes
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user.role as User['role']) || 'CUSTOMER',
        companyId: session.user.companyId
      })
    } else {
      setUser(null)
    }
  }, [session])

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is handled by the LoginForm component using NextAuth signIn
    // We'll just return false here as this should not be called directly
    console.warn('login() should be called through LoginForm component')
    return false
  }

  const logout = async (): Promise<void> => {
    const { signOut } = await import('next-auth/react')
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  const refetchUser = async (): Promise<void> => {
    await update()
  }

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    login,
    logout,
    refetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Main AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}

// Utility hook for checking roles
export const useRole = () => {
  const { user, isAuthenticated } = useAuth()
  
  const hasRole = (role: User['role']): boolean => {
    return isAuthenticated && user?.role === role
  }

  const isCustomer = (): boolean => hasRole('CUSTOMER')
  const isCompanyAdmin = (): boolean => hasRole('COMPANY_ADMIN')  
  const isSuperAdmin = (): boolean => hasRole('SUPER_ADMIN')

  return {
    hasRole,
    isCustomer,
    isCompanyAdmin,
    isSuperAdmin,
    userRole: user?.role
  }
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: User['role']
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Redirect to login
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
          return
        }

        if (requiredRole && user?.role !== requiredRole) {
          // Redirect to unauthorized page or homepage
          window.location.href = '/'
          return
        }

        setShouldRender(true)
      }
    }, [isAuthenticated, isLoading, user])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!shouldRender) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

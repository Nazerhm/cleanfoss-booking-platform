/**
 * Authenticated Layout with Navigation Integration
 * Provides layout structure with authentication-aware navigation
 */

'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from './Navigation';
import { LoginButton } from '../../features/auth/components/AuthButtons';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string | string[];
  fallbackComponent?: ReactNode;
}

export default function AuthenticatedLayout({ 
  children, 
  requireAuth = false,
  requiredRole,
  fallbackComponent
}: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const userRole = session?.user?.role || 'CUSTOMER';

  // Check role permissions
  const hasRequiredRole = (): boolean => {
    if (!requiredRole) return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  };

  // Handle authentication requirements
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
    }
  }, [isLoading, requireAuth, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Authentication required but not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Login Påkrævet
              </h2>
              <p className="text-gray-600 mb-6">
                Du skal være logget ind for at få adgang til denne side.
              </p>
              <LoginButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role check failed
  if (isAuthenticated && requiredRole && !hasRequiredRole()) {
    const unauthorizedComponent = fallbackComponent || (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 8.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-4">
                Adgang Nægtet
              </h2>
              <p className="text-gray-600 mb-6">
                Du har ikke tilladelse til at få adgang til denne side.
              </p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Gå til Forsiden
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return unauthorizedComponent;
  }

  // Main layout with navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

/**
 * Public Layout - No authentication required
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

/**
 * Customer Layout - Customer authentication required
 */
export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedLayout requireAuth={true} requiredRole={['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']}>
      {children}
    </AuthenticatedLayout>
  );
}

/**
 * Admin Layout - Admin authentication required
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedLayout requireAuth={true} requiredRole={['ADMIN', 'SUPER_ADMIN']}>
      {children}
    </AuthenticatedLayout>
  );
}

/**
 * Super Admin Layout - Super Admin authentication required
 */
export function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedLayout requireAuth={true} requiredRole="SUPER_ADMIN">
      {children}
    </AuthenticatedLayout>
  );
}

/**
 * Optimized Navigation Hook
 * Memoizes expensive navigation item calculations and reduces re-renders
 */

'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
  roles?: string[];
}

export interface UseNavigationReturn {
  navigationItems: NavigationItem[];
  isItemVisible: (item: NavigationItem) => boolean;
  isItemActive: (href: string) => boolean;
  isAuthenticated: boolean;
  userRole: string;
}

export function useNavigation(): UseNavigationReturn {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Memoize authentication status to prevent unnecessary re-calculations
  const authStatus = useMemo(() => ({
    isAuthenticated: status === 'authenticated',
    userRole: session?.user?.role || 'CUSTOMER',
    isLoading: status === 'loading'
  }), [status, session?.user?.role]);

  // Memoize static navigation items (these never change)
  const staticNavigationItems = useMemo((): NavigationItem[] => [
    // Public items
    { name: 'Hjem', href: '/', icon: HomeIcon },
    { name: 'Services', href: '/services', icon: WrenchScrewdriverIcon },
    { name: 'Book Rengøring', href: '/booking', icon: CalendarDaysIcon },
    
    // Authenticated items
    { name: 'Mine Bookinger', href: '/profile/bookings', icon: CalendarDaysIcon, requireAuth: true },
    { name: 'Mine Køretøjer', href: '/profile/vehicles', icon: TruckIcon, requireAuth: true },
    { name: 'Betalinger', href: '/profile/payments', icon: CreditCardIcon, requireAuth: true },
    
    // Admin items
    { 
      name: 'Admin', 
      href: '/admin', 
      icon: ShieldCheckIcon, 
      roles: ['ADMIN', 'SUPER_ADMIN'],
      requireAuth: true 
    },
    
    // Super Admin items
    { 
      name: 'System', 
      href: '/super-admin', 
      icon: BuildingOfficeIcon, 
      roles: ['SUPER_ADMIN'],
      requireAuth: true 
    },
  ], []);

  // Memoize filtered navigation items based on auth status
  const navigationItems = useMemo(() => {
    if (authStatus.isLoading) {
      // Return basic items during loading
      return staticNavigationItems.filter(item => !item.requireAuth);
    }

    return staticNavigationItems.filter(item => {
      // Always show public items
      if (!item.requireAuth) return true;
      
      // Hide auth-required items if not authenticated
      if (!authStatus.isAuthenticated) return false;
      
      // Check role requirements
      if (item.roles) {
        return item.roles.includes(authStatus.userRole);
      }
      
      return true;
    });
  }, [staticNavigationItems, authStatus]);

  // Memoize visibility checker
  const isItemVisible = useMemo(() => (item: NavigationItem): boolean => {
    // Public items are always visible
    if (!item.requireAuth) return true;
    
    // Auth required but not authenticated
    if (!authStatus.isAuthenticated) return false;
    
    // Role-based visibility
    if (item.roles) {
      return item.roles.includes(authStatus.userRole);
    }
    
    return true;
  }, [authStatus]);

  // Memoize active item checker
  const isItemActive = useMemo(() => (href: string): boolean => {
    if (!pathname) return false;
    
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return {
    navigationItems,
    isItemVisible,
    isItemActive,
    isAuthenticated: authStatus.isAuthenticated,
    userRole: authStatus.userRole
  };
}

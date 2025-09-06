/**
 * Navigation Wrapper with Authentication Provider
 * Ensures proper session context for navigation components
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import Navigation from './Navigation';

interface NavigationWrapperProps {
  children?: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  return (
    <SessionProvider>
      <Navigation />
      {children}
    </SessionProvider>
  );
}

export { Navigation };

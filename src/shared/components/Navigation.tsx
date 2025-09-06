/**
 * Enhanced Navigation Component with Performance Optimizations
 * Uses memoized hooks to prevent unnecessary re-renders and computations
 */

'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { LoginButton, RegisterButton, AuthStatus } from '../../features/auth/components/AuthButtons';
import UserMenu from '../../features/auth/components/UserMenu';
import { useNavigation } from '@/hooks/useNavigation';

// Memoize navigation link to prevent unnecessary re-renders
const NavigationLink = memo(({ 
  item, 
  isActive, 
  onClick, 
  className 
}: {
  item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <Link
    key={item.name}
    href={item.href}
    className={className}
    onClick={onClick}
  >
    <item.icon className="w-5 h-5 mr-3" />
    {item.name}
  </Link>
));

NavigationLink.displayName = 'NavigationLink';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession(); // Keep session for mobile menu display
  const { 
    navigationItems, 
    isItemVisible, 
    isItemActive, 
    isAuthenticated 
  } = useNavigation();

  // Close mobile menu when route changes - optimized with useEffect
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [navigationItems.length]); // Only trigger when navigation actually changes

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                CleanFoss
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems
              .filter(isItemVisible)
              .map((item) => {
                const isActive = isItemActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {/* Authentication Status for larger screens */}
            <div className="hidden lg:block">
              <AuthStatus />
            </div>

            {/* User Menu or Login Buttons */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <LoginButton size="sm" />
                <RegisterButton size="sm" />
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Åbn hovedmenu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Authentication Status on Mobile */}
              <div className="px-3 py-2 border-b border-gray-100">
                <AuthStatus />
              </div>

              {/* Navigation Items */}
              {navigationItems
                .filter(isItemVisible)
                .map((item) => {
                  const isActive = isItemActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors
                        ${isActive 
                          ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}

              {/* Mobile Authentication Buttons */}
              {!isAuthenticated && (
                <div className="px-3 py-4 space-y-3 border-t border-gray-200">
                  <LoginButton className="w-full justify-center" />
                  <RegisterButton className="w-full justify-center" />
                </div>
              )}

              {/* Mobile User Menu Items */}
              {isAuthenticated && (
                <div className="px-3 py-2 space-y-1 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {session?.user?.name || session?.user?.email}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 mr-3 inline" />
                    Min Profil
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Authentication Button Component
 * Provides login/logout functionality with Danish localization
 */

'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface AuthButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoginButton({ 
  variant = 'primary', 
  showIcon = true, 
  showText = true,
  size = 'md',
  className = ''
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('credentials', { 
        callbackUrl: window.location.pathname || '/' 
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
    disabled:pointer-events-none disabled:opacity-50
  `;
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-6 text-base gap-2.5'
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {showIcon && (
        <ArrowRightOnRectangleIcon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      )}
      {showText && (
        <span>{isLoading ? 'Logger ind...' : 'Log ind'}</span>
      )}
    </button>
  );
}

export function LogoutButton({ 
  variant = 'outline', 
  showIcon = true, 
  showText = true,
  size = 'md',
  className = ''
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm('Er du sikker på, at du vil logge ud?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
    disabled:pointer-events-none disabled:opacity-50
  `;
  
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-6 text-base gap-2.5'
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {showIcon && (
        <ArrowLeftOnRectangleIcon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      )}
      {showText && (
        <span>{isLoading ? 'Logger ud...' : 'Log ud'}</span>
      )}
    </button>
  );
}

export function RegisterButton({ 
  variant = 'secondary', 
  showIcon = true, 
  showText = true,
  size = 'md',
  className = ''
}: AuthButtonProps) {
  return (
    <button
      onClick={() => signIn('credentials', { callbackUrl: '/auth/register' })}
      className={`
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        bg-green-600 text-white hover:bg-green-700 shadow-sm
        ${size === 'sm' ? 'h-8 px-3 text-sm gap-1.5' : 
          size === 'lg' ? 'h-10 px-6 text-base gap-2.5' : 'h-9 px-4 text-sm gap-2'}
        ${className}
      `}
    >
      {showIcon && (
        <UserIcon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      )}
      {showText && <span>Opret konto</span>}
    </button>
  );
}

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
        <span>Indlæser...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center gap-3">
        <LoginButton size="sm" />
        <RegisterButton size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="h-2 w-2 bg-green-500 rounded-full" />
      <span>Logget ind som {session?.user?.name || session?.user?.email}</span>
    </div>
  );
}

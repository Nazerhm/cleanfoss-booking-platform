/**
 * Navigation Components Index
 * Centralized exports for all navigation-related components
 */

export { default as Navigation } from './Navigation';
export { default as NavigationWrapper } from './NavigationWrapper';
export { default as AuthenticatedLayout, PublicLayout, CustomerLayout, AdminLayout, SuperAdminLayout } from './AuthenticatedLayout';
export { default as Breadcrumb, PageHeader } from './Breadcrumb';

// Re-export auth components for convenience
export { LoginButton, LogoutButton, RegisterButton, AuthStatus } from './auth/AuthButtons';
export { default as UserMenu } from './auth/UserMenu';

// Error Boundaries and Monitoring
export { default as ErrorBoundary, BookingErrorBoundary, AuthErrorBoundary } from './ErrorBoundary';
export { PerformanceMonitorProvider, useUserTracking } from './PerformanceMonitorProvider';

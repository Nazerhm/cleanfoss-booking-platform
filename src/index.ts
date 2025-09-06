/**
 * CleanFoss Platform - Feature-Based Architecture Index
 * Centralized exports for optimized imports and module organization
 * 
 * Architecture Pattern: Domain-Driven Design with Feature Modules
 * - Each feature has its own: components, hooks, utils, types
 * - Shared utilities in /shared for cross-feature functionality  
 * - Barrel exports for clean import statements
 */

// =============================================================================
// FEATURE EXPORTS (Individual imports to avoid conflicts)
// =============================================================================

// Authentication Feature
export type { 
  LoginFormData, 
  RegisterFormData 
} from './utils/formValidation';

// =============================================================================
// SHARED UTILITIES
// =============================================================================
export * from './shared/components';
export * from './shared/hooks';
export * from './shared/utils';

// =============================================================================
// LEGACY COMPATIBILITY LAYER
// =============================================================================
// Re-export legacy imports to maintain compatibility during migration
export { default as Navigation } from './shared/components/Navigation';
export { default as AuthenticatedLayout } from './shared/components/AuthenticatedLayout';

// Core utilities (selected exports to avoid conflicts)
export { prisma } from './lib/prisma';
export { apiResponse, apiClient, validators } from './lib/api-utils';

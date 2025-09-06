/**
 * COMPATIBILITY LAYER - Legacy Import Support
 * This file provides backward compatibility for existing imports
 * TODO: Update all imports to use new feature-based paths and remove this file
 */

// Auth components (redirect to new feature location)
export * from '../../features/auth/components';

console.warn('DEPRECATION: Importing from components/auth is deprecated. Use @/features/auth instead.');

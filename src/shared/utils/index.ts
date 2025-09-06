/**
 * Shared Utils Barrel Export
 */

// Re-export our optimized API utilities from Task 4 (excluding withAuth to avoid conflicts)
export { apiResponse, withValidation, apiClient, validators, handleApiError } from '@/lib/api-utils';

// Re-export withAuth with alias to avoid conflicts
export { withAuth as withApiAuth } from '@/lib/api-utils';

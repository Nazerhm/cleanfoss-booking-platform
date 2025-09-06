/**
 * Optimized API Utilities
 * Consolidates common API patterns and provides memoized functions
 * Reduces code duplication across API routes and client-side fetch calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Standardized API response creators
 */
export const apiResponse = {
  success: <T>(data: T, message?: string): NextResponse<ApiResponse<T>> => {
    return NextResponse.json({
      success: true,
      data,
      message
    });
  },

  error: (message: string, status = 400, code?: string): NextResponse<ApiResponse> => {
    return NextResponse.json({
      success: false,
      error: message,
      code
    }, { status });
  },

  unauthorized: (message = 'Authentication required'): NextResponse<ApiResponse> => {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 401 });
  },

  forbidden: (message = 'Access denied'): NextResponse<ApiResponse> => {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 403 });
  },

  notFound: (message = 'Resource not found'): NextResponse<ApiResponse> => {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 404 });
  },

  serverError: (message = 'Internal server error'): NextResponse<ApiResponse> => {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
};

/**
 * Authentication middleware wrapper
 */
export async function withAuth<T extends any[]>(
  handler: (request: NextRequest, session: any, ...args: T) => Promise<NextResponse>,
  requiredRole?: string | string[]
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return apiResponse.unauthorized();
      }

      // Check role requirements
      if (requiredRole) {
        const userRole = session.user?.role;
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          return apiResponse.forbidden('Insufficient permissions');
        }
      }

      return await handler(request, session, ...args);
    } catch (error) {
      console.error('API Error:', error);
      return apiResponse.serverError();
    }
  };
}

/**
 * Request body validation wrapper
 */
export async function withValidation<TBody>(
  request: NextRequest,
  validator: (body: any) => body is TBody,
  errorMessage = 'Invalid request data'
): Promise<{ valid: true; body: TBody } | { valid: false; response: NextResponse }> {
  try {
    const body = await request.json();
    
    if (!validator(body)) {
      return {
        valid: false,
        response: apiResponse.error(errorMessage, 400)
      };
    }

    return { valid: true, body };
  } catch (error) {
    return {
      valid: false,
      response: apiResponse.error('Invalid JSON data', 400)
    };
  }
}

/**
 * Memoized fetch utilities for client-side
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl = '/api', defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(
    endpoint: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Singleton API client instance
export const apiClient = new ApiClient();

/**
 * Common validation schemas
 */
export const validators = {
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  phone: (value: string): boolean => {
    return /^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/.test(value.replace(/\s/g, ''));
  },

  postalCode: (value: string): boolean => {
    return /^\d{4}$/.test(value);
  },

  isLoginRequest: (body: any): body is { email: string; password: string } => {
    return (
      typeof body === 'object' &&
      body !== null &&
      typeof body.email === 'string' &&
      typeof body.password === 'string' &&
      validators.email(body.email) &&
      body.password.length >= 8
    );
  },

  isRegisterRequest: (body: any): body is { 
    email: string; 
    password: string; 
    name: string; 
  } => {
    return (
      typeof body === 'object' &&
      body !== null &&
      typeof body.email === 'string' &&
      typeof body.password === 'string' &&
      typeof body.name === 'string' &&
      validators.email(body.email) &&
      body.password.length >= 8 &&
      body.name.trim().length >= 2
    );
  }
};

/**
 * Error handling utilities
 */
export function handleApiError(error: unknown): ApiResponse {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred'
  };
}

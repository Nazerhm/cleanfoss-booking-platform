/**
 * Reusable Form Validation Hook
 * Replaces duplicate validation patterns across booking, auth, and profile forms
 * Provides memoized validation functions for optimal performance
 */

import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  email?: boolean;
  phone?: boolean;
  postalCode?: boolean;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface UseValidationReturn<T> {
  /** Current validation errors */
  errors: Partial<Record<keyof T, string>>;
  /** Check if field has error */
  hasError: (field: keyof T) => boolean;
  /** Validate single field */
  validateField: (field: keyof T, value: any) => string | null;
  /** Validate entire form */
  validateForm: (data: T) => boolean;
  /** Set error for field */
  setError: (field: keyof T, error: string) => void;
  /** Clear error for field */
  clearError: (field: keyof T) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Check if form has any errors */
  hasErrors: boolean;
}

const DANISH_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/,
  postalCode: /^\d{4}$/,
} as const;

export function useValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>
): UseValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Memoized validation function for individual fields
  const validateField = useCallback((field: keyof T, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Dette felt er påkrævet';
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    const stringValue = String(value);

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `Minimum ${rule.minLength} tegn påkrævet`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `Maksimum ${rule.maxLength} tegn tilladt`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return 'Ugyldigt format';
    }

    // Built-in Danish validations
    if (rule.email && !DANISH_PATTERNS.email.test(stringValue)) {
      return 'Indtast en gyldig email adresse';
    }

    if (rule.phone && !DANISH_PATTERNS.phone.test(stringValue.replace(/\s/g, ''))) {
      return 'Indtast et gyldigt dansk telefonnummer (8 cifre)';
    }

    if (rule.postalCode && !DANISH_PATTERNS.postalCode.test(stringValue)) {
      return 'Indtast et gyldigt postnummer (4 cifre)';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  // Validate entire form
  const validateForm = useCallback((data: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    Object.keys(rules).forEach((fieldKey) => {
      const field = fieldKey as keyof T;
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [rules, validateField]);

  // Utility functions
  const hasError = useCallback((field: keyof T): boolean => {
    return !!errors[field];
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Memoized computed values
  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    hasError,
    validateField,
    validateForm,
    setError,
    clearError,
    clearAllErrors,
    hasErrors
  };
}

/**
 * Pre-configured validation rules for common forms
 */
export const commonValidationRules = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 8,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  phone: {
    required: true,
    phone: true,
  },
  postalCode: {
    required: true,
    postalCode: true,
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 100,
  },
} as const;

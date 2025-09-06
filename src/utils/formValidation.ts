/**
 * Consolidated Form Validation Utilities
 * Extracts common validation patterns used across authentication and booking forms
 */

import { FormErrors } from '@/hooks/useFormManager';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Danish format)
const DANISH_PHONE_REGEX = /^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/;

// Postal code regex (Danish format)
const DANISH_POSTAL_CODE_REGEX = /^\d{4}$/;

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (value: string | undefined | null, fieldName: string): string | null => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} er påkrævet`;
    }
    return null;
  },

  email: (email: string): string | null => {
    if (!email.trim()) {
      return 'E-mail er påkrævet';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Indtast en gyldig e-mail adresse';
    }
    return null;
  },

  phone: (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Telefonnummer er påkrævet';
    }
    const cleanPhone = phone.replace(/\s/g, '');
    if (!DANISH_PHONE_REGEX.test(cleanPhone)) {
      return 'Indtast et gyldigt dansk telefonnummer (8 cifre)';
    }
    return null;
  },

  postalCode: (postalCode: string): string | null => {
    if (!postalCode.trim()) {
      return 'Postnummer er påkrævet';
    }
    if (!DANISH_POSTAL_CODE_REGEX.test(postalCode)) {
      return 'Postnummer skal være 4 cifre';
    }
    return null;
  },

  minLength: (value: string, minLength: number, fieldName: string): string | null => {
    if (value.trim().length < minLength) {
      return `${fieldName} skal være mindst ${minLength} tegn`;
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!password) {
      return 'Adgangskode er påkrævet';
    }
    if (password.length < 8) {
      return 'Adgangskode skal være mindst 8 tegn';
    }
    const strength = calculatePasswordStrength(password);
    if (strength.score < 3) {
      return 'Adgangskoden skal være stærkere (mindst 8 tegn, store/små bogstaver og tal)';
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Bekræft adgangskode er påkrævet';
    }
    if (password !== confirmPassword) {
      return 'Adgangskoderne matcher ikke';
    }
    return null;
  }
};

/**
 * Password strength calculation
 * Consolidates password strength logic from multiple components
 */
export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', color: 'gray-300' };
  }

  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character type scoring
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/\d/.test(password)) score += 1;    // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters

  // Return strength assessment
  if (score <= 2) {
    return { score, label: 'Svag', color: 'red-500' };
  } else if (score <= 4) {
    return { score, label: 'Medium', color: 'yellow-500' };
  } else {
    return { score, label: 'Stærk', color: 'green-500' };
  }
}

/**
 * Authentication form validation schemas
 */
export interface LoginFormData {
  email: string;
  password: string;
  general?: string; // For general form errors
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  general?: string; // For general form errors
}

export const AuthValidators = {
  login: (data: LoginFormData): FormErrors => {
    const errors: FormErrors = {};
    
    const emailError = ValidationRules.email(data.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = ValidationRules.required(data.password, 'Adgangskode');
    if (passwordError) errors.password = passwordError;
    
    return errors;
  },

  register: (data: RegisterFormData): FormErrors => {
    const errors: FormErrors = {};
    
    // Name validation
    const nameError = ValidationRules.required(data.name, 'Navn') || 
                     ValidationRules.minLength(data.name, 2, 'Navn');
    if (nameError) errors.name = nameError;
    
    // Email validation
    const emailError = ValidationRules.email(data.email);
    if (emailError) errors.email = emailError;
    
    // Password validation
    const passwordError = ValidationRules.password(data.password);
    if (passwordError) errors.password = passwordError;
    
    // Confirm password validation
    const confirmPasswordError = ValidationRules.confirmPassword(data.password, data.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    return errors;
  }
};

/**
 * API error processing utility
 * Consolidates error handling patterns from form submissions
 */
export interface ApiError {
  field?: string;
  message: string;
}

export function processApiErrors(error: any): FormErrors {
  const errors: FormErrors = {};
  
  if (error?.details && Array.isArray(error.details)) {
    // Handle validation errors from API
    error.details.forEach((detail: ApiError) => {
      if (detail.field && detail.message) {
        errors[detail.field] = detail.message;
      }
    });
  } else if (error?.message) {
    // Handle general error message
    errors.general = error.message;
  } else if (typeof error === 'string') {
    errors.general = error;
  } else {
    errors.general = 'Der opstod en uventet fejl';
  }
  
  return errors;
}

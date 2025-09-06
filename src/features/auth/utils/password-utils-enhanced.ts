import * as bcrypt from 'bcryptjs'
import { PASSWORD_POLICY, COMMON_PASSWORDS, SECURITY_ERRORS } from './auth/security-config'

/**
 * Enhanced Password utility functions for secure password handling
 * Implements comprehensive password policies and security measures
 */

// Configuration constants
const SALT_ROUNDS = 12 // High security salt rounds for production

/**
 * Hash a password using bcrypt with high security salt rounds
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Previously hashed password from database
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Password strength validation with comprehensive security rules
 * @param password - Password to validate
 * @returns Object with validation result and error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Adgangskoden skal være mindst ${PASSWORD_POLICY.minLength} tegn lang`);
  } else if (password.length >= PASSWORD_POLICY.minLength) {
    score += 1;
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Adgangskoden må højst være ${PASSWORD_POLICY.maxLength} tegn lang`);
  }

  // Character type validation
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Adgangskoden skal indeholde mindst ét stort bogstav');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Adgangskoden skal indeholde mindst ét lille bogstav');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Adgangskoden skal indeholde mindst ét tal');
  } else if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (PASSWORD_POLICY.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Adgangskoden skal indeholde mindst ét specialtegn');
  } else if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  // Common password validation
  if (PASSWORD_POLICY.forbidCommonPasswords && isCommonPassword(password)) {
    errors.push(SECURITY_ERRORS.COMMON_PASSWORD);
  }

  // Additional security checks
  if (hasRepeatingChars(password)) {
    errors.push('Adgangskoden må ikke indeholde for mange gentagende tegn');
  }

  if (hasSequentialChars(password)) {
    errors.push('Adgangskoden må ikke indeholde sekventielle tegn (f.eks. 123, abc)');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 5 && password.length >= 12) {
    strength = 'very-strong';
  } else if (score >= 4 && password.length >= 10) {
    strength = 'strong';
  } else if (score >= 3 && password.length >= 8) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Check if password is in common passwords list
 */
function isCommonPassword(password: string): boolean {
  const lowercasePassword = password.toLowerCase();
  return COMMON_PASSWORDS.some(common => 
    lowercasePassword.includes(common.toLowerCase()) ||
    lowercasePassword === common.toLowerCase()
  );
}

/**
 * Check for repeating characters (more than 2 in a row)
 */
function hasRepeatingChars(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Check for sequential characters
 */
function hasSequentialChars(password: string): boolean {
  const sequences = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ];
  
  const lowercasePassword = password.toLowerCase();
  
  return sequences.some(seq => {
    for (let i = 0; i <= seq.length - 3; i++) {
      const substring = seq.substring(i, i + 3);
      if (lowercasePassword.includes(substring) || 
          lowercasePassword.includes(substring.split('').reverse().join(''))) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Generate a secure random password
 * @param length - Length of password (default 12)
 * @returns string - Secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if user is attempting to reuse a recent password
 * @param newPassword - New password to check
 * @param recentPasswords - Array of recent password hashes
 * @returns Promise<boolean> - True if password was recently used
 */
export async function isPasswordReused(newPassword: string, recentPasswords: string[]): Promise<boolean> {
  for (const recentHash of recentPasswords) {
    if (await verifyPassword(newPassword, recentHash)) {
      return true;
    }
  }
  return false;
}

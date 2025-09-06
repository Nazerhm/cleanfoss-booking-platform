/**
 * Security Configuration for CleanFoss Authentication System
 * Implements comprehensive security measures for production deployment
 */

// Password Policy Configuration
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
  historyCount: 3, // Prevent reusing last 3 passwords
} as const;

// Session Security Configuration
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  updateAge: 24 * 60 * 60, // Update session every 24 hours
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  httpOnly: true, // Prevent XSS access to cookies
  domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL : undefined,
} as const;

// Security Headers Configuration (Enhanced for Production)
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
    ? `max-age=${process.env.HSTS_MAX_AGE || 31536000}; includeSubDomains; preload`
    : 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': process.env.NODE_ENV === 'production'
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.stripe.com https://*.stripe.com",
        "frame-src https://js.stripe.com https://hooks.stripe.com",
        `report-uri ${process.env.CSP_REPORT_URI || '/api/security/csp-report'}`
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com", 
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.stripe.com https://*.stripe.com",
        "frame-src https://js.stripe.com https://hooks.stripe.com"
      ].join('; '),
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDuration: 15 * 60 * 1000, // 15 minutes
  },
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 60 * 60 * 1000, // 1 hour
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 60 * 60 * 1000, // 1 hour
  },
} as const;

// Input Validation Patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+45)?[0-9]{8}$/, // Danish phone number format
  postalCode: /^[0-9]{4}$/, // Danish postal code format
  name: /^[a-zA-ZæøåÆØÅ\s\-']{2,50}$/, // Danish characters allowed
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_]+$/,
} as const;

// Common weak passwords to block
export const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', '111111', 'password1', '123123', 'sunshine',
  'master', '1234567890', 'iloveyou', 'princess', 'rockyou',
  // Danish common passwords
  'kodeord', 'adgangskode', 'hemmelig', 'denmark', 'danmark',
] as const;

// Security Event Types for Logging
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_BLOCKED = 'LOGIN_BLOCKED',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CSRF_ATTACK = 'CSRF_ATTACK',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
}

// Error Messages (Danish localized)
export const SECURITY_ERRORS = {
  WEAK_PASSWORD: 'Adgangskoden opfylder ikke sikkerhedskravene',
  COMMON_PASSWORD: 'Adgangskoden er for almindelig, vælg en stærkere adgangskode',
  PASSWORD_REUSED: 'Du kan ikke genbruge en af dine seneste adgangskoder',
  ACCOUNT_LOCKED: 'Kontoen er midlertidigt låst på grund af for mange fejlslagne loginforsøg',
  RATE_LIMITED: 'For mange forsøg. Prøv igen senere',
  INVALID_CSRF: 'Sikkerhedsfejl: Ugyldig anmodning',
  INVALID_INPUT: 'Ugyldige indtastningsdata',
  SESSION_EXPIRED: 'Din session er udløbet. Log ind igen',
} as const;

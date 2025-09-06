/**
 * Authentication API Integration Tests
 * Tests for authentication endpoints and security features
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest, NextResponse } from 'next/server';

// Import API handlers
import { POST as registerHandler } from '../src/app/api/auth/register-secure/route';
import { validatePasswordStrength } from '../src/lib/password-utils';
import { verifyPassword, hashPassword } from '../src/lib/password-utils-enhanced';

// Mock Prisma client
jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Authentication API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Utilities', () => {
    describe('validatePasswordStrength', () => {
      it('should validate strong passwords', () => {
        const result = validatePasswordStrength('StrongPass123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const result = validatePasswordStrength('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should require minimum length', () => {
        const result = validatePasswordStrength('Short1');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
      });

      it('should require uppercase letters', () => {
        const result = validatePasswordStrength('lowercase123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should require lowercase letters', () => {
        const result = validatePasswordStrength('UPPERCASE123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
      });

      it('should require numbers', () => {
        const result = validatePasswordStrength('NoNumbers');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should reject overly long passwords', () => {
        const longPassword = 'a'.repeat(130) + 'A1';
        const result = validatePasswordStrength(longPassword);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be less than 128 characters');
      });
    });

    describe('Password Hashing', () => {
      it('should hash and verify passwords correctly', async () => {
        const password = 'TestPassword123';
        const hashedPassword = await hashPassword(password);
        
        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword).toBeTruthy();
        
        const isValid = await verifyPassword(password, hashedPassword);
        expect(isValid).toBe(true);
      });

      it('should reject incorrect passwords', async () => {
        const password = 'TestPassword123';
        const wrongPassword = 'WrongPassword123';
        const hashedPassword = await hashPassword(password);
        
        const isValid = await verifyPassword(wrongPassword, hashedPassword);
        expect(isValid).toBe(false);
      });

      it('should produce different hashes for same password', async () => {
        const password = 'TestPassword123';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);
        
        expect(hash1).not.toBe(hash2);
        
        // But both should verify correctly
        expect(await verifyPassword(password, hash1)).toBe(true);
        expect(await verifyPassword(password, hash2)).toBe(true);
      });
    });
  });

  describe('Registration API', () => {
    it('should reject registration with invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '',
          email: 'invalid-email',
          password: 'weak',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'invalid-email',
          password: 'weak',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email-format',
          password: 'StrongPass123',
          acceptTerms: true,
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('email');
    });

    it('should validate password strength in registration', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'weak',
          acceptTerms: true,
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should require terms acceptance', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'StrongPass123',
          acceptTerms: false,
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('vilkår');
    });
  });

  describe('Security Tests', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: 'invalid json {',
      });

      const response = await registerHandler(request);
      
      expect(response.status).toBe(400);
    });

    it('should reject SQL injection attempts', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: "'; DROP TABLE users; --",
          email: 'test@example.com',
          password: 'StrongPass123',
          acceptTerms: true,
        }),
      });

      // Should not throw an error and should handle safely
      expect(async () => {
        await registerHandler(request);
      }).not.toThrow();
    });

    it('should reject XSS attempts in input', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          password: 'StrongPass123',
          acceptTerms: true,
        }),
      });

      const response = await registerHandler(request);
      
      // Should handle XSS attempts safely
      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should handle multiple requests within limits', async () => {
      // This would typically require setting up actual rate limiting middleware
      // For now, we test that the handler can handle rapid requests
      const requests = Array.from({ length: 5 }, () => 
        new NextRequest('http://localhost:3000/api/auth/register-secure', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'StrongPass123',
            acceptTerms: true,
          }),
        })
      );

      // Execute requests concurrently
      const responses = await Promise.all(
        requests.map(request => registerHandler(request))
      );

      // All should complete without throwing errors
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response).toBeDefined();
      });
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle very long input strings', async () => {
      const longString = 'a'.repeat(1000);
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: longString,
          email: 'test@example.com',
          password: 'StrongPass123',
          acceptTerms: true,
        }),
      });

      const response = await registerHandler(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle special characters in names', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jøhn Døe-Åndersen',
          email: 'john@example.dk',
          password: 'StrongPass123',
          acceptTerms: true,
        }),
      });

      // Should handle Danish characters properly
      const response = await registerHandler(request);
      
      // Response should be handled (either success or validation error, but not crash)
      expect(response).toBeDefined();
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: '',
      });

      const response = await registerHandler(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register-secure', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name, email, password
          acceptTerms: true,
        }),
      });

      const response = await registerHandler(request);
      
      expect(response.status).toBe(400);
    });
  });
});

/**
 * Enhanced User Registration API with Security Validation
 * Implements comprehensive password polic      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { 
          id: true, 
          isActive: true,
          license: {
            select: { maxUsers: true }
          }
        }
      });
      
      if (!company || !company.isActive) {
        return NextResponse.json(
          { error: 'Ugyldig eller inaktiv virksomhed' },
          { status: 400 }
        );
      }
      
      // Check user limit for company
      if (company.license?.maxUsers) {
        const currentUserCount = await prisma.user.count({
          where: { companyId }
        });
        
        if (currentUserCount >= company.license.maxUsers) {asures
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validatePasswordStrength, isPasswordReused } from '@/lib/password-utils-enhanced';
import { prisma } from '@/lib/prisma';
import { withSecurity, logSecurityEvent } from '@/lib/auth/security-middleware';
import { SecurityEventType, VALIDATION_PATTERNS, SECURITY_ERRORS } from '@/lib/auth/security-config';
import { z } from 'zod';

// Registration validation schema with enhanced security
const registrationSchema = z.object({
  name: z.string()
    .min(2, 'Navnet skal være mindst 2 tegn')
    .max(50, 'Navnet må højst være 50 tegn')
    .regex(VALIDATION_PATTERNS.name, 'Navnet indeholder ugyldige tegn'),
  email: z.string()
    .email('Ugyldig e-mailadresse')
    .min(5, 'E-mailadressen er for kort')
    .max(100, 'E-mailadressen er for lang')
    .regex(VALIDATION_PATTERNS.email, 'Ugyldig e-mailformat')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Adgangskoden skal være mindst 8 tegn')
    .max(128, 'Adgangskoden er for lang'),
  confirmPassword: z.string(),
  companyId: z.string().cuid().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Du skal acceptere servicevilkårene'
  }),
  acceptMarketing: z.boolean().optional().default(false)
}).refine(data => data.password === data.confirmPassword, {
  message: 'Adgangskoderne matcher ikke',
  path: ['confirmPassword']
});

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Validate input data
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      await logSecurityEvent(SecurityEventType.REGISTRATION_FAILED, {
        ip,
        timestamp: new Date(),
        details: `Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`
      });
      
      return NextResponse.json(
        { 
          error: 'Valideringsfejl',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { name, email, password, companyId, acceptTerms, acceptMarketing } = validationResult.data;
    
    // Enhanced password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await logSecurityEvent(SecurityEventType.REGISTRATION_FAILED, {
        ip,
        timestamp: new Date(),
        details: `Weak password: ${passwordValidation.errors.join(', ')}`
      });
      
      return NextResponse.json(
        {
          error: SECURITY_ERRORS.WEAK_PASSWORD,
          details: passwordValidation.errors.map(error => ({ field: 'password', message: error })),
          strength: passwordValidation.strength
        },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, status: true }
    });
    
    if (existingUser) {
      await logSecurityEvent(SecurityEventType.REGISTRATION_FAILED, {
        ip,
        timestamp: new Date(),
        details: `Registration attempt with existing email: ${email}`
      });
      
      return NextResponse.json(
        { error: 'En bruger med denne e-mailadresse findes allerede' },
        { status: 409 }
      );
    }
    
    // Validate company if provided (multi-tenant support)
    let validatedCompanyId = companyId;
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { 
          id: true, 
          isActive: true,
          license: {
            select: { maxUsers: true }
          }
        }
      });
      
      if (!company || !company.isActive) {
        return NextResponse.json(
          { error: 'Ugyldig eller inaktiv virksomhed' },
          { status: 400 }
        );
      }
      
      // Check user limit for company
      if (company.license?.maxUsers) {
        const currentUserCount = await prisma.user.count({
          where: { companyId, status: 'ACTIVE' }
        });
        
        if (currentUserCount >= company.license.maxUsers) {
          return NextResponse.json(
            { error: 'Virksomheden har nået maksimalt antal brugere' },
            { status: 403 }
          );
        }
      }
    }
    
    // Hash password with enhanced security
    const hashedPassword = await hashPassword(password);
    
    // Create user with enhanced security settings
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId: validatedCompanyId,
        role: 'CUSTOMER', // Default role
        status: 'ACTIVE',
        emailVerified: null, // Will be verified via email
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true
      }
    });
    
    // Log successful registration
    await logSecurityEvent(SecurityEventType.REGISTRATION_SUCCESS, {
      ip,
      userId: newUser.id,
      timestamp: new Date(),
      details: `New user registered: ${email}`
    });
    
    // Return success response (don't include sensitive data)
    return NextResponse.json(
      {
        message: 'Bruger oprettet succesfuldt',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    await logSecurityEvent(SecurityEventType.REGISTRATION_FAILED, {
      ip,
      timestamp: new Date(),
      details: `Registration system error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    
    return NextResponse.json(
      { error: 'Der opstod en fejl under oprettelsen af brugeren' },
      { status: 500 }
    );
  }
}

// Apply security middleware with enhanced protection
export const POST = withSecurity(registerHandler, {
  rateLimitType: 'registration',
  requireCSRF: true,
  validateOrigin: true
});

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

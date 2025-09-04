import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, validatePasswordStrength } from '@/lib/password-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Registration validation schema
const registrationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  companyId: z.string().uuid().optional(), // Optional company association
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validatedData = registrationSchema.parse(body)
    const { email, password, name, companyId } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors.map(err => ({
          field: 'password',
          message: err
        }))
      }, { status: 400 })
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password)

    // Create new user with default CUSTOMER role
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CUSTOMER', // Default role for new registrations
        status: 'ACTIVE',
        companyId: companyId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }

    // Handle Prisma database errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}

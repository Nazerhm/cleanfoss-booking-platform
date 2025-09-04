import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdmin, withCompanyAccess, AuthenticatedRequest } from '@/lib/auth/api-middleware';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password-utils';
import { UserRole } from '@prisma/client';

// Schema for creating users
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'AGENT', 'ADMIN', 'FINANCE', 'SUPER_ADMIN']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyId: z.string().optional(), // Optional for super admins
});

// GET /api/admin/team - List team members (Admin and Super Admin)
async function getTeamMembers(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') as UserRole | null;
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    // Company-scoped access (unless super admin)
    if (request.user.role !== 'SUPER_ADMIN') {
      whereClause.companyId = request.user.companyId;
    }

    // Role filter
    if (role) {
      whereClause.role = role;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        companyId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          companyId: user.companyId,
          company: user.company,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + users.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/admin/team - Create team member (Admin and Super Admin)
async function createTeamMember(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Determine company ID
    let companyId = validatedData.companyId;
    
    // Non-super admins can only create users in their own company
    if (request.user.role !== 'SUPER_ADMIN') {
      if (!request.user.companyId) {
        return NextResponse.json(
          { error: 'User must be associated with a company' },
          { status: 400 }
        );
      }
      companyId = request.user.companyId;
    }

    // Super admins must specify company if creating non-super admin users
    if (request.user.role === 'SUPER_ADMIN' && validatedData.role !== 'SUPER_ADMIN' && !companyId) {
      return NextResponse.json(
        { error: 'Company ID required for non-super admin users' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        role: validatedData.role,
        password: hashedPassword,
        companyId: companyId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        companyId: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      data: { user: newUser },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create team member error:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = withCompanyAccess(getTeamMembers);
export const POST = withAdmin(createTeamMember);

// Example protected API route using role-based access control
import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/auth/middleware'
import { UserRole, Permission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users - List users (Admin+ only)
async function handleGet(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build filter conditions
    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Company filter for non-super-admin users
    if (user.role !== UserRole.SUPER_ADMIN && user.companyId) {
      where.companyId = user.companyId
    }
    
    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' }
        ]
      }),
      prisma.user.count({ where })
    ])
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl under hentning af brugere' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create user (Admin+ only)
async function handlePost(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { name, email, role, companyId } = body
    
    // Validation
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Navn, email og rolle er påkrævet' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'En bruger med denne email findes allerede' },
        { status: 400 }
      )
    }
    
    // Only super admins can assign users to different companies
    let targetCompanyId = companyId
    if (user.role !== UserRole.SUPER_ADMIN) {
      targetCompanyId = user.companyId
    }
    
    // Create new user (without password - they'll need to set it via registration)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        companyId: targetCompanyId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(newUser, { status: 201 })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl under oprettelse af bruger' },
      { status: 500 }
    )
  }
}

// Route handlers with role-based protection
export const GET = withApiAuth(handleGet, {
  role: UserRole.ADMIN,
  permission: Permission.MANAGE_USERS
})

export const POST = withApiAuth(handlePost, {
  role: UserRole.ADMIN, 
  permission: Permission.CREATE_USERS
})

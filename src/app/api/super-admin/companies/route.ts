import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireSuperAdmin, validateRequestBody } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  try {
    const companies = await prisma.company.findMany({
      include: {
        license: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireSuperAdmin(request)
  if (authError) return authError

  const bodyOrError = await validateRequestBody(request, ['name', 'email', 'licenseType'])
  if (bodyOrError instanceof Response) return bodyOrError

  const { name, email, licenseType, adminPassword = 'changeme123' } = bodyOrError

  try {
    // Check if company email already exists
    const existing = await prisma.company.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Company email already exists' }, { status: 400 })
    }

    // Generate company slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    
    // Create license
    const expiresAt = licenseType === 'LIFETIME' ? null : 
                     licenseType === 'YEARLY' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) :
                     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const license = await prisma.license.create({
      data: {
        key: `LICENSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: licenseType,
        status: 'ACTIVE',
        expiresAt
      }
    })

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        email,
        licenseId: license.id
      }
    })

    // Create admin user for the company
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrator',
        email,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id
      }
    })

    return Response.json({
      company,
      license,
      adminCreated: true
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating company:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
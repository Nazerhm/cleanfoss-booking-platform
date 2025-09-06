import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"

export async function requireSuperAdmin(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  if (session.user?.role !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Super admin access required' }, { status: 403 })
  }
  
  return null // No error, user is authorized
}

export async function validateRequestBody(request: NextRequest, requiredFields: string[]) {
  try {
    const body = await request.json()
    
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    
    return body
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}
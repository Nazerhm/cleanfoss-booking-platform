import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { verifyPassword } from "../../../lib/password-utils-enhanced"
import { validatePasswordStrength } from "../../../lib/password-utils-enhanced"
import { prisma } from "../../../lib/prisma"
import { SESSION_CONFIG, SecurityEventType } from "../../../lib/auth/security-config"
import { logSecurityEvent } from "../../../lib/auth/security-middleware"

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter with our enhanced database client
  adapter: PrismaAdapter(prisma),
  
  // Session configuration with enhanced security
  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.maxAge,
    updateAge: SESSION_CONFIG.updateAge,
  },
  
  // Secure cookies configuration
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: SESSION_CONFIG.httpOnly,
        sameSite: SESSION_CONFIG.sameSite,
        path: '/',
        secure: SESSION_CONFIG.secure,
        domain: SESSION_CONFIG.domain,
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: SESSION_CONFIG.secure,
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: SESSION_CONFIG.secure,
      }
    }
  },
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          // Get IP for logging
          const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown';
          
          // Find user with enhanced Prisma client
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim()
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              companyId: true,
              status: true
            }
          })
          
          // Check if user exists
          if (!user) {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip: Array.isArray(ip) ? ip[0] : ip,
              timestamp: new Date(),
              details: `Login attempt with non-existent email: ${credentials.email}`
            });
            return null
          }
          
          // Check if user is active
          if (user.status !== 'ACTIVE') {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip: Array.isArray(ip) ? ip[0] : ip,
              userId: user.id,
              timestamp: new Date(),
              details: `Login attempt with inactive account: ${user.status}`
            });
            return null
          }
          
          // Verify password
          if (!user.password) {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip: Array.isArray(ip) ? ip[0] : ip,
              userId: user.id,
              timestamp: new Date(),
              details: 'Login attempt with account that has no password set'
            });
            return null
          }
          
          const isPasswordValid = await verifyPassword(credentials.password, user.password)
          
          if (!isPasswordValid) {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip: Array.isArray(ip) ? ip[0] : ip,
              userId: user.id,
              timestamp: new Date(),
              details: 'Invalid password provided'
            });
            return null
          }
          
          // Log successful login
          await logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
            ip: Array.isArray(ip) ? ip[0] : ip,
            userId: user.id,
            timestamp: new Date(),
            details: 'Successful password authentication'
          });
          
          // Return user object for session (convert null to undefined for NextAuth compatibility)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId ?? undefined,
            status: user.status
          }
          
        } catch (error) {
          console.error('Authentication error:', error)
          
          // Log authentication error
          await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
            timestamp: new Date(),
            details: `Authentication system error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
          
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async session({ session, token }) {
      // Add user ID and role to the session with proper typing
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.companyId = token.companyId;
      }
      return session
    },
    
    async jwt({ token, user }) {
      // Add user role and company to JWT token with proper typing
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    }
  },
  
  pages: {
    signIn: '/auth/login'
  },
  
  debug: process.env.NODE_ENV === 'development',
}

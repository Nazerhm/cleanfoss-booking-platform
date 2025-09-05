import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { verifyPassword } from "./password-utils-enhanced"
import { prisma } from "./prisma"
import { SESSION_CONFIG, SecurityEventType } from "./auth/security-config"
import { logSecurityEvent } from "./auth/security-middleware"

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
              status: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
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
          
          // Check if company is active (multi-tenant validation)
          if (user.company && user.company.status !== 'ACTIVE') {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip: Array.isArray(ip) ? ip[0] : ip,
              userId: user.id,
              timestamp: new Date(),
              details: `Login attempt with inactive company: ${user.company.status}`
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
          
          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
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
      // Attach user information to session
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
      }
      return session
    },
    
    async jwt({ token, user }) {
      // Persist user information in JWT token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    }
  },
  
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },
  
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  
  // Additional security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Debug logging in development
  debug: process.env.NODE_ENV === 'development',
  
  // Events for logging and monitoring
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    },
    async signOut(message) {
      console.log('User signed out:', message.token?.email);
    },
    async session(message) {
      // Log session activity for monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log('Session accessed:', message.session.user?.email);
      }
    }
  }
}

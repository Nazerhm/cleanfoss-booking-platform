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
          const forwardedFor = req?.headers?.['x-forwarded-for'];
          const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || 'unknown';
          
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
              ip,
              timestamp: new Date(),
              details: `Login attempt with non-existent email: ${credentials.email}`
            });
            return null
          }
          
          // Check if user is active
          if (user.status !== 'ACTIVE') {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip,
              userId: user.id,
              timestamp: new Date(),
              details: `Login attempt with inactive account: ${user.status}`
            });
            return null
          }
          
          // Verify password
          if (!user.password) {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip,
              userId: user.id,
              timestamp: new Date(),
              details: 'Login attempt with account that has no password set'
            });
            return null
          }
          
          const isPasswordValid = await verifyPassword(credentials.password, user.password)
          
          if (!isPasswordValid) {
            await logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
              ip,
              userId: user.id,
              timestamp: new Date(),
              details: 'Invalid password provided'
            });
            return null
          }
          
          // Log successful login
          await logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
            ip,
            userId: user.id,
            timestamp: new Date(),
            details: 'Successful password authentication'
          });
          
          // Return user object for session (NextAuth compatible)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId || undefined, // Convert null to undefined
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
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.status = token.status as string
      }
      return session
    },
    
    async jwt({ token, user }) {
      // Persist user information in JWT token
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.status = (user as any).status
      }
      return token
    }
  },
  
  pages: {
    signIn: '/auth/login',
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
      console.log('✅ User signed in:', message.user.email);
    },
    async signOut(message) {
      console.log('👋 User signed out');
    }
  }
}

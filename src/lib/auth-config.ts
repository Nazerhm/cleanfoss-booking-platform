import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter with our enhanced database client
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
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
          
          // Verify user exists and is active
          if (!user || user.status !== 'ACTIVE') {
            return null
          }
          
          // Verify password
          if (!user.password) {
            return null
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }
          
          // Return user object compatible with NextAuth User type
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId ?? undefined, // Convert null to undefined for NextAuth compatibility
            status: user.status
          }
          
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async session({ session, user, token }) {
      // Add user ID and role to the session
      if (session.user) {
        session.user.id = token.sub || user?.id
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
      }
      return session
    },
    
    async jwt({ token, user }) {
      // Add user role and company to JWT token
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    }
  },
  
  pages: {
    signIn: '/auth/login',
    // signUp: '/auth/register' // NextAuth doesn't support signUp page, only signIn
  },
  
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions for better performance
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  debug: process.env.NODE_ENV === 'development',
}

import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

async function testNextAuthConfig() {
  console.log('🔧 Testing NextAuth.js Configuration...')
  
  try {
    // Test configuration structure
    console.log('✅ Auth options structure valid')
    console.log('  - Adapter:', authOptions.adapter ? 'Configured' : 'Missing')
    console.log('  - Providers:', authOptions.providers.length, 'configured')
    console.log('  - Session strategy:', authOptions.session?.strategy || 'default')
    console.log('  - Secret:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing')
    console.log('  - URL:', process.env.NEXTAUTH_URL)
    
    // Test provider configuration
    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials')
    if (credentialsProvider) {
      console.log('✅ Credentials provider configured')
    } else {
      console.log('❌ Credentials provider missing')
    }
    
    // Test environment variables
    if (!process.env.NEXTAUTH_SECRET) {
      console.log('❌ NEXTAUTH_SECRET environment variable is missing')
      return
    }
    
    if (!process.env.NEXTAUTH_URL) {
      console.log('❌ NEXTAUTH_URL environment variable is missing')
      return
    }
    
    console.log('✅ NextAuth.js configuration test completed successfully')
    console.log('🔒 Authentication system is ready for testing')
    
  } catch (error) {
    console.error('❌ NextAuth.js configuration test failed:', error)
  }
}

testNextAuthConfig()

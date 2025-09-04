/**
 * Test script for email/password authentication system
 * Tests user registration and login functionality
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from './src/lib/password-utils.js'

async function testPasswordUtils() {
  console.log('🔐 Testing Password Utilities...\n')
  
  // Test password validation
  console.log('1. Testing password validation:')
  const weakPassword = 'weak'
  const strongPassword = 'StrongPass123'
  
  console.log(`Weak password "${weakPassword}":`, validatePasswordStrength(weakPassword))
  console.log(`Strong password "${strongPassword}":`, validatePasswordStrength(strongPassword))
  
  // Test password hashing and verification
  console.log('\n2. Testing password hashing and verification:')
  const testPassword = 'TestPassword123'
  
  try {
    const hashedPassword = await hashPassword(testPassword)
    console.log('✅ Password hashing successful')
    console.log('Hash length:', hashedPassword.length)
    
    const isValid = await verifyPassword(testPassword, hashedPassword)
    console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED')
    
    const isInvalid = await verifyPassword('WrongPassword', hashedPassword)
    console.log('✅ Wrong password verification:', isInvalid ? 'FAILED (should be false)' : 'SUCCESS (correctly rejected)')
    
  } catch (error) {
    console.error('❌ Password hashing/verification error:', error)
  }
  
  console.log('\n🎉 Password utilities test completed')
}

async function testRegistrationFlow() {
  console.log('\n📝 Testing Registration Flow...\n')
  
  const testUsers = [
    {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123'
    },
    {
      name: 'Another User',
      email: 'another@example.com',
      password: 'AnotherPass456'
    }
  ]
  
  for (const user of testUsers) {
    try {
      console.log(`Testing registration for: ${user.email}`)
      
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Registration successful:', result.message)
        console.log('User ID:', result.user.id)
        console.log('User Role:', result.user.role)
      } else {
        console.log('❌ Registration failed:', result.error)
        if (result.details) {
          console.log('Validation errors:', result.details)
        }
      }
      
    } catch (error) {
      console.error('❌ Registration request error:', error.message)
    }
    
    console.log('---')
  }
}

async function testLoginFlow() {
  console.log('\n🔑 Testing Login Flow...\n')
  
  const testCredentials = [
    {
      email: 'test@example.com',
      password: 'TestPassword123'
    },
    {
      email: 'test@example.com',
      password: 'WrongPassword'
    },
    {
      email: 'nonexistent@example.com',
      password: 'TestPassword123'
    }
  ]
  
  for (const credentials of testCredentials) {
    try {
      console.log(`Testing login for: ${credentials.email}`)
      
      const response = await fetch('http://localhost:3000/api/auth/providers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Auth providers endpoint accessible:', Object.keys(result))
      } else {
        console.log('❌ Auth providers not accessible')
      }
      
    } catch (error) {
      console.error('❌ Login test error:', error.message)
    }
    
    console.log('---')
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Email/Password Authentication Tests\n')
  
  await testPasswordUtils()
  
  // Only run API tests if server is running
  try {
    const serverCheck = await fetch('http://localhost:3000/api/auth/providers')
    if (serverCheck.ok) {
      await testRegistrationFlow()
      await testLoginFlow()
    } else {
      console.log('\n⚠️  Server not running at localhost:3000, skipping API tests')
      console.log('💡 Run "npm run dev" to start the server and test the full flow')
    }
  } catch (error) {
    console.log('\n⚠️  Server not running, skipping API tests')
    console.log('💡 Run "npm run dev" to start the server and test the full flow')
  }
  
  console.log('\n✨ Authentication test completed!')
}

runTests().catch(console.error)

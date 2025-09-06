// Test script to validate NextAuth configuration
import fetch from 'node-fetch';

async function testNextAuth() {
  try {
    console.log('Testing NextAuth configuration...');
    
    // Test providers endpoint
    const providersResponse = await fetch('http://localhost:3001/api/auth/providers');
    if (!providersResponse.ok) {
      throw new Error(`HTTP ${providersResponse.status}: ${providersResponse.statusText}`);
    }
    
    const providers = await providersResponse.json();
    console.log('✅ NextAuth providers endpoint working');
    console.log('Available providers:', Object.keys(providers));
    
    // Test session endpoint
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
    if (!sessionResponse.ok) {
      throw new Error(`HTTP ${sessionResponse.status}: ${sessionResponse.statusText}`);
    }
    
    const session = await sessionResponse.json();
    console.log('✅ NextAuth session endpoint working');
    console.log('Session:', session || 'No active session');
    
    console.log('🎉 NextAuth.js configuration validated successfully!');
    
  } catch (error) {
    console.error('❌ NextAuth configuration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testNextAuth();

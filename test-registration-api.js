import { hashPassword } from './src/lib/password-utils.js';

async function testRegistrationAPI() {
  console.log('🔐 Testing Registration API...\n');
  
  try {
    // Test data
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User',
      role: 'CUSTOMER'
    };
    
    console.log('Test user data:', { ...testUser, password: '[HIDDEN]' });
    
    // Test the registration endpoint
    const response = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const responseData = await response.json();
    
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Data:', responseData);
    
    if (response.ok) {
      console.log('\n✅ Registration API test passed!');
    } else {
      console.log('\n❌ Registration API test failed');
    }
    
  } catch (error) {
    console.error('❌ Registration API test failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure the Next.js development server is running with: npm run dev');
    }
  }
}

testRegistrationAPI();

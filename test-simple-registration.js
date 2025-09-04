// Simple registration API test
async function testRegistrationAPI() {
  console.log('🧪 Testing Registration API...\n');
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };
  
  console.log('Test user:', { ...testUser, password: '[HIDDEN]' });
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('\n📊 Response Status:', response.status);
    
    const responseData = await response.json();
    console.log('📊 Response Data:', responseData);
    
    if (response.ok) {
      console.log('\n✅ Registration API test passed!');
    } else {
      console.log('\n❌ Registration API test failed');
    }
    
  } catch (error) {
    console.error('\n❌ Registration API test error:', error.message);
  }
}

testRegistrationAPI();

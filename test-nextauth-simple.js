// Simple test for NextAuth endpoints
const https = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing NextAuth configuration...\n');
  
  try {
    // Test providers endpoint
    console.log('1. Testing /api/auth/providers');
    const providersResult = await testEndpoint('/api/auth/providers');
    console.log(`   Status: ${providersResult.status}`);
    if (providersResult.status === 200) {
      const providers = JSON.parse(providersResult.data);
      console.log(`   Providers available: ${Object.keys(providers).join(', ')}`);
      console.log('   ✅ Providers endpoint working');
    } else {
      console.log('   ❌ Providers endpoint failed');
      console.log(`   Response: ${providersResult.data}`);
    }
    
    // Test session endpoint
    console.log('\n2. Testing /api/auth/session');
    const sessionResult = await testEndpoint('/api/auth/session');
    console.log(`   Status: ${sessionResult.status}`);
    if (sessionResult.status === 200) {
      console.log('   ✅ Session endpoint working');
      console.log(`   Response: ${sessionResult.data}`);
    } else {
      console.log('   ❌ Session endpoint failed');
    }
    
    console.log('\n🎉 NextAuth.js configuration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();

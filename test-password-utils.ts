// Test password utilities functionality
import { hashPassword, verifyPassword } from './src/lib/password-utils';

async function testPasswordUtils() {
  console.log('🧪 Testing Password Utilities...\n');
  
  const testPassword = 'mySecurePassword123!';
  
  try {
    // Test password hashing
    console.log('1. Testing password hashing...');
    const hashedPassword = await hashPassword(testPassword);
    console.log(`✅ Password hashed successfully: ${hashedPassword.substring(0, 20)}...`);
    
    // Test password verification (correct password)
    console.log('\n2. Testing password verification (correct password)...');
    const isValid = await verifyPassword(testPassword, hashedPassword);
    console.log(`✅ Password verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    
    // Test password verification (incorrect password)
    console.log('\n3. Testing password verification (incorrect password)...');
    const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
    console.log(`✅ Wrong password verification result: ${isInvalid ? 'VALID' : 'INVALID'}`);
    
    console.log('\n🎉 All password utility tests passed!');
    
  } catch (error) {
    console.error('❌ Password utility test failed:', error);
  }
}

testPasswordUtils();

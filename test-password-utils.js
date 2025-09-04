import { hashPassword, verifyPassword, validatePasswordStrength } from './src/lib/password-utils.js';

async function testPasswordUtils() {
  console.log('🔐 Testing Password Utilities...\n');
  
  try {
    const testPassword = 'testPassword123!';
    console.log(`Original password: ${testPassword}`);
    
    // Test password strength validation
    console.log('\n0. Testing password strength validation...');
    const validationResult = validatePasswordStrength(testPassword);
    console.log(`Password validation result:`, validationResult);
    
    // Test hashing
    console.log('\n1. Testing password hashing...');
    const hashedPassword = await hashPassword(testPassword);
    console.log(`Hashed password: ${hashedPassword}`);
    console.log(`Hash length: ${hashedPassword.length}`);
    console.log(`Starts with $2b$: ${hashedPassword.startsWith('$2b$')}`);
    
    // Test verification with correct password
    console.log('\n2. Testing password verification (correct password)...');
    const isValidCorrect = await verifyPassword(testPassword, hashedPassword);
    console.log(`Verification result: ${isValidCorrect}`);
    
    // Test verification with wrong password
    console.log('\n3. Testing password verification (wrong password)...');
    const isValidWrong = await verifyPassword('wrongPassword123!', hashedPassword);
    console.log(`Verification result: ${isValidWrong}`);
    
    // Test with different passwords produce different hashes
    console.log('\n4. Testing hash uniqueness...');
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    console.log(`Hash 1: ${hash1}`);
    console.log(`Hash 2: ${hash2}`);
    console.log(`Hashes are different: ${hash1 !== hash2}`);
    console.log(`Both verify correctly: ${await verifyPassword(testPassword, hash1) && await verifyPassword(testPassword, hash2)}`);
    
    // Test weak password
    console.log('\n5. Testing weak password validation...');
    const weakPassword = '123';
    const weakValidation = validatePasswordStrength(weakPassword);
    console.log(`Weak password validation:`, weakValidation);
    
    console.log('\n✅ All password utility tests passed!');
    
  } catch (error) {
    console.error('❌ Password utilities test failed:', error);
    process.exit(1);
  }
}

testPasswordUtils();

/**
 * Test Debug - Check what the password validator actually expects
 */

const { validatePasswordStrength } = require('./src/lib/password-utils');

console.log('Testing StrongP@ss123:', validatePasswordStrength('StrongP@ss123'));
console.log('Testing Password123!:', validatePasswordStrength('Password123!'));
console.log('Testing CleanFoss2025!:', validatePasswordStrength('CleanFoss2025!'));

// Let's try some variations
console.log('Testing StrongPass123@:', validatePasswordStrength('StrongPass123@'));
console.log('Testing A1b2c3d4!:', validatePasswordStrength('A1b2c3d4!'));

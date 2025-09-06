# Authentication System Documentation

## 📋 Overview

CleanFoss Booking Platform implements a comprehensive authentication system using NextAuth.js v4.24.11 with role-based access control, enterprise-grade security features, and Danish localization.

## 🛡️ Security Features

### Password Security
- **Argon2id Hashing**: Industry-standard password hashing algorithm
- **Password Strength Validation**: Enforces strong passwords with multiple criteria
- **Password History**: Prevents password reuse (configurable)
- **Secure Random Salt**: Each password gets unique salt for enhanced security

### Session Management
- **JWT Tokens**: Stateless session management with signed JWT tokens
- **Session Rotation**: Automatic session token rotation for enhanced security
- **Secure Cookies**: HTTP-only, secure cookies with SameSite protection
- **Session Expiry**: Configurable session timeout with automatic cleanup

### Attack Protection
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: API endpoint protection against brute force attacks
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM

## 👥 User Roles & Access Control

### Role Hierarchy
1. **CUSTOMER** - Standard users who book services
2. **ADMIN** - Company administrators with management access
3. **SUPER_ADMIN** - Platform administrators with full system access

### Role-Based Navigation
- Dynamic navigation menus based on user role
- Protected routes with automatic redirection
- UI components that adapt to user permissions

## 🔧 Component Architecture

### Core Authentication Components

#### AuthButtons (`src/components/auth/AuthButtons.tsx`)
Provides authentication UI components with Danish localization:

```tsx
import { LoginButton, LogoutButton, RegisterButton, AuthStatus } from '@/components/auth/AuthButtons';

// Login button with different variants
<LoginButton variant="primary" size="lg" />
<LoginButton variant="outline" size="sm" />

// Authentication status display
<AuthStatus />

// Logout with confirmation
<LogoutButton showConfirmation={true} />
```

**Features:**
- Multiple button variants (primary, secondary, outline)
- Loading states during authentication
- Danish text and error messages
- Responsive design with proper touch targets

#### UserMenu (`src/components/auth/UserMenu.tsx`)
Professional dropdown menu with role-based features:

```tsx
import UserMenu from '@/components/auth/UserMenu';

// Automatically shows appropriate menu items based on user role
<UserMenu />
```

**Features:**
- Role-based menu items (Customer/Admin/Super Admin)
- User profile information display
- Smooth CSS transitions and animations
- Keyboard navigation support

#### Navigation (`src/components/Navigation.tsx`)
Authentication-aware navigation system:

```tsx
import Navigation from '@/components/Navigation';

// Automatically adapts to authentication state
<Navigation />
```

**Features:**
- Dynamic navigation items based on authentication state
- Role-based menu visibility
- Mobile-responsive hamburger menu
- Active route highlighting

#### AuthenticatedLayout (`src/components/AuthenticatedLayout.tsx`)
Layout components with built-in authentication protection:

```tsx
import { PublicLayout, CustomerLayout, AdminLayout, SuperAdminLayout } from '@/components/AuthenticatedLayout';

// Public pages - no authentication required
<PublicLayout>
  <HomePage />
</PublicLayout>

// Customer pages - requires CUSTOMER, ADMIN, or SUPER_ADMIN
<CustomerLayout>
  <BookingPage />
</CustomerLayout>

// Admin pages - requires ADMIN or SUPER_ADMIN
<AdminLayout>
  <AdminDashboard />
</AdminLayout>

// Super Admin pages - requires SUPER_ADMIN only
<SuperAdminLayout>
  <SystemSettings />
</SuperAdminLayout>
```

**Features:**
- Automatic authentication checking
- Role-based access control
- Loading states with professional spinners
- Unauthorized access handling with Danish error messages

## 🔐 Authentication Flow

### Registration Process
1. **Input Validation**: Email format, password strength, required fields
2. **Duplicate Check**: Verify email not already registered
3. **Company Validation**: Check company license and user limits (multi-tenant)
4. **Password Hashing**: Secure Argon2id hashing with unique salt
5. **User Creation**: Store user in database with CUSTOMER role by default
6. **Email Verification**: Send verification email (future enhancement)

### Login Process
1. **Credentials Validation**: Verify email exists and password matches
2. **Account Status Check**: Ensure user account is active
3. **Session Creation**: Generate JWT token with user information and role
4. **Security Logging**: Log successful/failed authentication attempts
5. **Redirect**: Send user to intended destination or dashboard

### Session Management
1. **Token Validation**: Verify JWT signature and expiration on each request
2. **Role Extraction**: Extract user role from token for authorization
3. **Automatic Refresh**: Refresh token when approaching expiration
4. **Secure Storage**: Store session in HTTP-only cookies

## 🌐 API Endpoints

### Registration API
**Endpoint**: `POST /api/auth/register-secure`

```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "StrongPass123",
  "acceptTerms": true,
  "acceptMarketing": false,
  "companyId": "optional-company-id"
}
```

**Response (Success)**:
```json
{
  "message": "Bruger oprettet med succes",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

**Response (Error)**:
```json
{
  "error": "E-mail er allerede registreret"
}
```

### Authentication Utilities

#### Password Validation
```typescript
import { validatePasswordStrength } from '@/lib/password-utils';

const result = validatePasswordStrength("UserPassword123");
if (!result.isValid) {
  console.log("Errors:", result.errors);
}
```

#### Password Hashing
```typescript
import { hashPassword, verifyPassword } from '@/lib/password-utils-enhanced';

// Hash a password
const hashedPassword = await hashPassword("UserPassword123");

// Verify a password
const isValid = await verifyPassword("UserPassword123", hashedPassword);
```

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Authentication flow and API endpoint testing
- **Security Tests**: Input validation, XSS prevention, SQL injection protection
- **Performance Tests**: Component rendering speed and memory usage
- **Accessibility Tests**: ARIA labels, keyboard navigation, screen reader support

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only authentication tests
npm run test:auth
```

### Test Files
- `tests/auth-system.test.tsx` - Component and integration tests
- `tests/auth-api.test.ts` - API endpoint and security tests

## 🌍 Localization

All authentication components include Danish localization:

### Common Danish Terms
- **Log Ind** - Log In
- **Log Ud** - Log Out  
- **Opret Konto** - Create Account
- **Min Profil** - My Profile
- **Mine Bookinger** - My Bookings
- **Mine Køretøjer** - My Vehicles
- **Administration** - Administration
- **Adgang Nægtet** - Access Denied
- **Login Påkrævet** - Login Required

### Error Messages in Danish
- "Ugyldig e-mail eller adgangskode" - Invalid email or password
- "E-mail er allerede registreret" - Email already registered  
- "Adgangskoden skal være mindst 8 tegn" - Password must be at least 8 characters
- "Du skal acceptere vilkårene" - You must accept the terms

## 🚀 Performance Optimizations

### Component Performance
- **React.memo()**: Prevent unnecessary re-renders
- **Lazy Loading**: Load authentication components only when needed
- **Code Splitting**: Separate authentication bundle from main app
- **Efficient State Management**: Minimize session state updates

### Session Performance
- **JWT Tokens**: Stateless session management reduces database load
- **Token Caching**: Cache session information to reduce API calls
- **Optimistic Updates**: Update UI immediately while background sync occurs

## 🔧 Configuration

### Environment Variables
```env
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://username:password@localhost:5432/cleanfoss
```

### Security Configuration
```typescript
// src/lib/auth-config.ts
export const securityConfig = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Optional
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
  }
};
```

## 📱 Mobile Support

### Responsive Design
- **Mobile Navigation**: Collapsible hamburger menu
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Viewport Optimization**: Proper viewport meta tags
- **Progressive Enhancement**: Works on all device sizes

### Mobile-Specific Features
- **One-Tap Login**: Remember user credentials securely
- **Biometric Authentication**: Support for future biometric login
- **Offline Handling**: Graceful degradation when offline

## 🛠️ Troubleshooting

### Common Issues

#### Authentication Not Working
1. Check environment variables are set correctly
2. Verify database connection is working
3. Ensure NextAuth secret is configured
4. Check console for error messages

#### Session Not Persisting
1. Verify cookies are enabled in browser
2. Check HTTPS configuration for production
3. Ensure SameSite cookie settings are correct
4. Verify session timeout settings

#### Role-Based Access Not Working
1. Check user role is set correctly in database
2. Verify JWT token contains role information
3. Ensure layout components are using correct role checks
4. Check for TypeScript errors in role definitions

### Debug Mode
Enable debug logging in development:
```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
  console.log('Session:', session);
  console.log('User Role:', userRole);
}
```

## 🔄 Future Enhancements

### Planned Features
1. **Email Verification**: Verify email addresses on registration
2. **Password Reset**: Secure password reset via email
3. **Two-Factor Authentication**: TOTP-based 2FA support
4. **Social Login**: Google, Facebook, Apple login integration
5. **Session Analytics**: Track authentication patterns
6. **Advanced Rate Limiting**: IP-based and user-based limits
7. **Audit Logging**: Comprehensive security event logging

### Security Improvements
1. **Device Fingerprinting**: Track login devices
2. **Geolocation Checking**: Detect suspicious login locations
3. **Automated Security Scanning**: Regular security assessments
4. **Compliance Features**: GDPR, CCPA compliance tools

## 📞 Support

For authentication system support:
1. Check this documentation first
2. Review test files for usage examples
3. Check GitHub issues for known problems
4. Contact development team for assistance

---

**Version**: 1.0.0  
**Last Updated**: September 5, 2025  
**Maintainer**: CleanFoss Development Team

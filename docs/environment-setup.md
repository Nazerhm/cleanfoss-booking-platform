# Environment Setup Guide - CleanFoss Booking Platform

## 🌍 Environment Configuration Overview

This guide provides detailed instructions for setting up different environments (development, staging, production) for the CleanFoss Booking Platform.

## 📁 Environment Files Structure

```
├── .env.local                    # Development (ignored by git)
├── .env.development.example      # Development template
├── .env.staging.example          # Staging template  
├── .env.production.example       # Production template
└── .env.test                     # Testing environment
```

## 🔧 Core Environment Variables

### Database Configuration

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# Connection Pooling (Production)
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=30
DATABASE_TIMEOUT=30000

# Development Settings
DATABASE_LOGGING=true          # Enable in dev/staging only
DATABASE_SLOW_QUERY_LOG=true   # Log queries >1s
```

### Authentication Configuration

```env
# NextAuth.js Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-character-secure-secret"

# OAuth Providers (if used)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Session Configuration
SESSION_MAX_AGE=30              # Days
JWT_SECRET="your-jwt-secret"    # Additional JWT secret
```

### Security Configuration

```env
# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI="https://yourdomain.com/api/security/csp-violation"

# CORS Configuration
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=15            # Minutes
RATE_LIMIT_MAX_REQUESTS=100     # Per window
```

### Payment Configuration

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Use pk_test_ for development
STRIPE_SECRET_KEY="sk_live_..."       # Use sk_test_ for development
STRIPE_WEBHOOK_SECRET="whsec_..."

# Payment Settings
PAYMENT_CURRENCY="DKK"
PAYMENT_TIMEOUT=300             # Seconds
```

### Monitoring Configuration

```env
# Health Checks
MONITORING_ENABLED=true
HEALTH_CHECK_SECRET="your-health-check-secret"

# External Services
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"

# Logging
LOG_LEVEL="info"                # debug, info, warn, error
LOG_FORMAT="json"               # json, pretty
```

### Email Configuration

```env
# SMTP Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"

# Email Templates
EMAIL_TEMPLATE_BASE_URL="https://yourdomain.com"
```

## 🏗️ Environment-Specific Configurations

### Development Environment (.env.local)

```env
# Development Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cleanfoss_dev"
DATABASE_LOGGING=true

# Development Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-32-characters-long"

# Development Payment (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Development Monitoring
MONITORING_ENABLED=false
LOG_LEVEL="debug"
```

### Staging Environment (.env.staging)

```env
# Staging Database
DATABASE_URL="postgresql://cleanfoss_staging:password@staging-db:5432/cleanfoss_staging"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=15

# Staging Auth
NEXTAUTH_URL="https://staging.yourdomain.com"
NEXTAUTH_SECRET="staging-32-character-secure-secret"

# Staging Payment (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Staging Monitoring
MONITORING_ENABLED=true
SENTRY_DSN="https://staging-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="staging"
```

### Production Environment (.env.production)

```env
# Production Database
DATABASE_URL="postgresql://cleanfoss_prod:secure_password@prod-db:5432/cleanfoss_prod"
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=30
DATABASE_LOGGING=false

# Production Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-super-secure-32-char-secret"

# Production Payment (Live Mode)
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Production Security
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI="https://yourdomain.com/api/security/csp-violation"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Production Monitoring
MONITORING_ENABLED=true
SENTRY_DSN="https://prod-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"
LOG_LEVEL="warn"
```

## 🛡️ Security Best Practices

### Secret Management

```bash
# Generate secure secrets
openssl rand -hex 32                    # For NEXTAUTH_SECRET
openssl rand -base64 48                 # For JWT_SECRET
openssl rand -hex 16                    # For HEALTH_CHECK_SECRET
```

### Environment Variable Validation

Create `scripts/validate-env.js`:

```javascript
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

Run validation:

```bash
node scripts/validate-env.js
```

## 🔄 Environment Migration

### From Development to Staging

```bash
# 1. Copy and modify environment file
cp .env.local .env.staging

# 2. Update staging-specific values
# - Database URLs
# - Domain names
# - API keys (if different)

# 3. Validate configuration
npm run validate:env staging
```

### From Staging to Production

```bash
# 1. Create production environment file
cp .env.staging .env.production

# 2. Update production values
# - Live payment keys
# - Production domains
# - Secure secrets

# 3. Test configuration
npm run build && npm run test:env
```

## 🧪 Environment Testing

### Database Connection Test

```bash
# Test database connectivity
npm run test:db-connection

# Expected output:
# ✅ Database connected successfully
# ✅ Database query successful: [ { test: 1 } ]
```

### Authentication Test

```bash
# Test authentication configuration
npm run test:auth-config

# Verifies:
# - NextAuth URL configuration
# - Secret presence and format
# - Provider configuration
```

### Payment Integration Test

```bash
# Test payment configuration
npm run test:payment-config

# Verifies:
# - Stripe keys validity
# - Webhook endpoint configuration
# - Payment flow functionality
```

## 📊 Environment Monitoring

### Health Check Configuration

Each environment should have its own health check endpoint:

- **Development**: `http://localhost:3000/api/health`
- **Staging**: `https://staging.yourdomain.com/api/health`
- **Production**: `https://yourdomain.com/api/health`

### Monitoring Setup

```bash
# Set up monitoring for each environment
curl -H "x-health-secret: $HEALTH_CHECK_SECRET" \
     $NEXTAUTH_URL/api/health

# Expected response:
{
  "status": "healthy",
  "environment": "production",
  "timestamp": "2025-09-05T...",
  "checks": {
    "database": { "status": "healthy" },
    "memory": { "status": "healthy" }
  }
}
```

## 🚨 Troubleshooting

### Common Environment Issues

1. **Database Connection Failed**
   ```bash
   # Check DATABASE_URL format
   echo $DATABASE_URL
   
   # Test connection manually
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Authentication Issues**
   ```bash
   # Verify NEXTAUTH_URL matches current domain
   echo $NEXTAUTH_URL
   
   # Check secret length (should be 32+ characters)
   echo $NEXTAUTH_SECRET | wc -c
   ```

3. **Payment Configuration Issues**
   ```bash
   # Verify Stripe keys format
   echo $STRIPE_PUBLISHABLE_KEY | grep -E "^pk_(live|test)_"
   echo $STRIPE_SECRET_KEY | grep -E "^sk_(live|test)_"
   ```

### Environment Variable Debugging

```bash
# Print all environment variables (development only)
npm run debug:env

# Check specific variable
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')"
```

## ✅ Environment Setup Complete

Your environment is now properly configured for the CleanFoss Booking Platform! Remember to:

1. ✅ Keep environment files secure and never commit them to version control
2. ✅ Use different secrets for each environment
3. ✅ Test configuration before deployment
4. ✅ Monitor environment health regularly
5. ✅ Update environment variables as needed for new features

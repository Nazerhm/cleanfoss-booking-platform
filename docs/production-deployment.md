# Production Deployment Guide

## 📋 Pre-deployment Checklist

### ✅ Environment Configuration
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Replace all placeholder values with actual production credentials
- [ ] Verify all required environment variables are set
- [ ] Test database connection with production credentials
- [ ] Configure production domain in NEXTAUTH_URL

### ✅ Security Configuration
- [ ] Generate strong NEXTAUTH_SECRET (32+ characters)
- [ ] Configure production CORS origins
- [ ] Set up CSP reporting endpoint
- [ ] Enable HTTPS-only cookies in production
- [ ] Review and update security headers

### ✅ Database Setup
- [ ] Set up production PostgreSQL database
- [ ] Configure connection pooling (recommended: 20 max connections)
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data: `npx prisma db seed`
- [ ] Set up database backups

### ✅ Payment Configuration  
- [ ] Replace Stripe test keys with live keys
- [ ] Configure webhook endpoints for production domain
- [ ] Test payment flow in production environment
- [ ] Set up payment monitoring and alerts

### ✅ Monitoring & Health Checks
- [ ] Configure health check secret
- [ ] Set up external monitoring (Sentry, etc.)
- [ ] Test `/api/health` endpoint
- [ ] Configure log aggregation
- [ ] Set up error alerting

## 🚀 Deployment Process

### 1. Build Verification
```bash
# Install dependencies
npm ci

# Run production build
npm run build

# Verify build success (exit code 0)
echo "Build exit code: $?"

# Start production server
npm start
```

### 2. Database Migration
```bash
# Deploy migrations to production
npx prisma migrate deploy

# Verify database schema
npx prisma db pull
```

### 3. Health Check Verification
```bash
# Test health endpoint
curl -X GET "https://your-domain.com/api/health?secret=YOUR_HEALTH_SECRET"

# Expected response: {"status": "healthy", ...}
```

### 4. Production Testing
- [ ] Test user registration and login
- [ ] Test booking flow end-to-end  
- [ ] Test payment processing
- [ ] Verify email notifications
- [ ] Test admin functionality
- [ ] Load test critical endpoints

## 🔧 Environment Variables Reference

### Required Production Variables
```bash
# Core Application
NODE_ENV=production
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-32-char-secret

# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Security
HEALTH_CHECK_SECRET=your-health-check-secret
```

### Optional Production Variables
```bash
# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Performance
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_SAMPLE_RATE=0.1

# Email (if configured)
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## 📊 Monitoring & Maintenance

### Health Check Endpoints
- **Main Health**: `GET /api/health`
- **Database Check**: `GET /api/health?check=database`
- **Auth Check**: `GET /api/health?check=auth`

### Security Monitoring
- **CSP Violations**: `POST /api/security/csp-report`
- **Rate Limit Status**: Check `X-RateLimit-*` headers
- **Security Headers**: Verify with security scanners

### Performance Monitoring
- **Build Output**: Monitor bundle sizes in CI/CD
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **API Response Times**: Monitor health check response times
- **Database Performance**: Monitor query times and connections

## 🔒 Security Best Practices

### 1. Environment Security
- Use environment-specific secrets (never reuse dev secrets)
- Rotate secrets regularly (quarterly recommended)
- Use secure secret management (AWS Secrets Manager, etc.)
- Limit environment variable access

### 2. Database Security
- Use SSL/TLS connections (`sslmode=require`)
- Configure connection limits and timeouts
- Regular security updates and patches
- Implement backup encryption

### 3. Application Security
- Enable all security headers in production
- Configure CSP reporting and monitoring
- Implement rate limiting on all endpoints
- Regular security audits and penetration testing

### 4. Infrastructure Security
- Use HTTPS with valid SSL certificates
- Configure firewall rules (allow only necessary ports)
- Regular OS and dependency updates
- Implement proper logging and monitoring

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check environment variables are properly set
- Verify database connectivity during build
- Review TypeScript compilation errors

**Database Connection Issues**
- Verify DATABASE_URL format and credentials
- Check network connectivity and firewall rules
- Monitor connection pool exhaustion

**Authentication Problems**
- Verify NEXTAUTH_SECRET is set and consistent
- Check NEXTAUTH_URL matches production domain
- Verify cookie security settings

**Performance Issues**
- Monitor database query performance
- Check bundle sizes and optimize if needed
- Review rate limiting configurations

### Support Contacts
- **Development Team**: [team-email]
- **Infrastructure Team**: [infrastructure-email]  
- **Security Team**: [security-email]

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Database migration tested
- [ ] Backup strategy confirmed

### During Deployment
- [ ] Monitor health checks
- [ ] Verify critical functionality
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify security headers

### Post-Deployment
- [ ] Full functionality testing
- [ ] Performance validation
- [ ] Security scan completion
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

**Last Updated**: September 5, 2025
**Version**: 1.0.0
**Environment**: Production Ready

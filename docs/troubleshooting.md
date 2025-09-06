# Production Troubleshooting Guide - CleanFoss Booking Platform

## 🚨 Critical Issue Response Flowchart

### 1. Application Down / Not Responding

```
Application Down
│
├── Check PM2 Status
│   ├── PM2 process stopped → Restart: `pm2 restart cleanfoss-booking-platform`
│   └── PM2 running but not responding → Check logs: `pm2 logs`
│
├── Check Health Endpoint
│   ├── /api/health returns 503 → Database connection issue
│   ├── /api/health timeout → Application overloaded
│   └── /api/health 404 → Routing/build issue
│
└── Check System Resources
    ├── High memory usage → Scale or restart
    ├── High CPU → Check for infinite loops
    └── Disk space full → Clean logs/backups
```

### 2. Database Connection Issues

```
Database Issues
│
├── Test Connection: `psql $DATABASE_URL -c "SELECT 1;"`
│   ├── Connection refused → PostgreSQL service down
│   ├── Authentication failed → Credentials incorrect
│   └── Database does not exist → Database not created
│
├── Check Connection Pool
│   ├── Max connections reached → Increase pool size
│   ├── Long-running queries → Check for query locks
│   └── Connection timeout → Network/performance issue
│
└── Check Database Performance
    ├── Slow queries → Review query optimization
    ├── High CPU → Check indexes
    └── Lock conflicts → Review transaction isolation
```

## 🔧 Common Issues and Solutions

### 1. Build Issues

#### Component Null Reference Errors

**Symptoms**:
```
Error: Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: null.
```

**Affected Pages**: /, /services, /booking, /demo/navigation

**Root Cause**: Circular imports or incorrect export/import statements

**Investigation Steps**:
```bash
# 1. Check component imports
grep -r "import.*from.*components" src/

# 2. Look for circular dependencies
npm install --save-dev madge
npx madge --circular src/

# 3. Check export statements
grep -r "export.*default" src/components/
```

**Resolution**:
```bash
# 1. Fix import paths
# Replace relative imports with absolute imports where needed

# 2. Check component exports
# Ensure all components have proper default exports

# 3. Verify component index files
# Check src/components/index.ts for correct exports
```

#### Next.js Build Errors

**Symptoms**:
```
TypeError: (0 , S.Z) is not a function
```

**Common Causes**:
- Missing dependencies in package.json
- Incorrect import/export syntax
- Version conflicts between packages

**Resolution**:
```bash
# 1. Clean build artifacts
rm -rf .next node_modules
npm install

# 2. Check package versions
npm outdated

# 3. Rebuild
npm run build
```

### 2. Runtime Errors

#### Authentication Issues

**Symptoms**:
- Users can't sign in
- Session expires immediately  
- NextAuth errors in logs

**Investigation**:
```bash
# Check environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET | wc -c  # Should be 32+ characters

# Test authentication endpoint
curl -I https://yourdomain.com/api/auth/session
```

**Common Fixes**:
```env
# Ensure correct domain in production
NEXTAUTH_URL=https://yourdomain.com  # No trailing slash

# Secure secret (32+ characters)
NEXTAUTH_SECRET=your-secure-32-character-secret

# Session configuration
SESSION_MAX_AGE=2592000  # 30 days in seconds
```

#### Payment Processing Issues

**Symptoms**:
- Payment failures
- Webhook not received
- Invalid payment methods

**Investigation**:
```bash
# Check Stripe configuration
curl -u $STRIPE_SECRET_KEY: https://api.stripe.com/v1/payment_intents/limit=1

# Verify webhook endpoint
curl -X POST https://yourdomain.com/api/webhooks/stripe \
     -H "stripe-signature: test"
```

**Common Fixes**:
- Verify live API keys in production
- Ensure webhook URLs match production domain
- Check webhook signature validation

### 3. Performance Issues

#### Slow Response Times

**Symptoms**:
- Pages load slowly (>3 seconds)
- API endpoints timeout
- High memory usage

**Investigation Steps**:
```bash
# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/

# Monitor memory usage
pm2 monit

# Check database performance
psql $DATABASE_URL -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"
```

**Resolution**:
```bash
# 1. Optimize database queries
# Add indexes for slow queries

# 2. Increase resources
# Scale PM2 instances: pm2 scale cleanfoss-booking-platform +2

# 3. Enable caching
# Configure Next.js static generation where possible
```

#### Memory Leaks

**Symptoms**:
- Memory usage continuously increases
- Application becomes unresponsive
- PM2 restarts frequently

**Investigation**:
```bash
# Monitor memory over time
while true; do
  pm2 list | grep cleanfoss-booking-platform
  sleep 30
done

# Check for memory leaks in logs
pm2 logs | grep "memory\|heap\|allocation"
```

**Resolution**:
```javascript
// Add memory monitoring
process.on('warning', (warning) => {
  console.warn(warning.name);    
  console.warn(warning.message); 
  console.warn(warning.stack);   
});

// Monitor heap usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(used.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
  });
}, 30000);
```

### 4. Database Issues

#### Connection Pool Exhaustion

**Symptoms**:
```
Error: remaining connection slots are reserved for non-replication superuser connections
```

**Investigation**:
```sql
-- Check current connections
SELECT count(*) as connection_count FROM pg_stat_activity;

-- Check connection details
SELECT datname, usename, client_addr, state, query_start 
FROM pg_stat_activity 
WHERE state = 'active';
```

**Resolution**:
```env
# Increase connection pool size
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=30

# Optimize connection timeout
DATABASE_TIMEOUT=30000
```

#### Slow Queries

**Symptoms**:
- Database queries taking >1 second
- High database CPU usage
- Connection timeouts

**Investigation**:
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

**Resolution**:
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_bookings_user_id ON "Booking"("userId");
CREATE INDEX CONCURRENTLY idx_bookings_status ON "Booking"("status");
CREATE INDEX CONCURRENTLY idx_services_active ON "Service"("isActive");

-- Analyze tables
ANALYZE;
```

### 5. Security Issues

#### SSL Certificate Issues

**Symptoms**:
- Browser SSL warnings
- HTTPS not working
- Certificate expired

**Investigation**:
```bash
# Check certificate status
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Resolution**:
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Test certificate renewal
sudo certbot renew --dry-run

# Restart nginx
sudo systemctl reload nginx
```

#### CSP Violations

**Symptoms**:
- Content Security Policy violations in browser console
- Resources blocked by CSP
- CSP violation reports

**Investigation**:
```bash
# Check CSP violations endpoint
curl https://yourdomain.com/api/security/csp-violation

# Review browser console for CSP errors
```

**Resolution**:
```javascript
// Update CSP configuration in next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  img-src 'self' data: blob: *.stripe.com;
  font-src 'self' fonts.gstatic.com;
  connect-src 'self' *.stripe.com vitals.vercel-insights.com;
`;
```

## 🔍 Diagnostic Tools and Commands

### 1. System Health Check

```bash
#!/bin/bash
# system-health-check.sh

echo "=== CleanFoss System Health Check ==="

# Application status
echo "1. Application Status:"
pm2 list | grep cleanfoss-booking-platform

# Health endpoint
echo "2. Health Endpoint:"
curl -f -H "x-health-secret: $HEALTH_CHECK_SECRET" \
     $NEXTAUTH_URL/api/health || echo "Health check failed"

# Database connectivity
echo "3. Database Status:"
psql $DATABASE_URL -c "SELECT 1 as db_test;" || echo "Database connection failed"

# Disk space
echo "4. Disk Space:"
df -h

# Memory usage
echo "5. Memory Usage:"
free -m

# System load
echo "6. System Load:"
uptime

echo "=== Health Check Complete ==="
```

### 2. Performance Monitoring Script

```bash
#!/bin/bash
# performance-monitor.sh

echo "=== Performance Monitor ==="

# API response times
echo "1. API Response Times:"
for endpoint in "" "/api/health" "/api/auth/session"; do
  echo "Testing: $NEXTAUTH_URL$endpoint"
  curl -w "Response time: %{time_total}s\n" \
       -o /dev/null -s "$NEXTAUTH_URL$endpoint"
done

# Database performance
echo "2. Database Performance:"
psql $DATABASE_URL -c "
SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
FROM pg_stat_user_tables 
ORDER BY seq_tup_read DESC 
LIMIT 5;"

# Application metrics
echo "3. Application Metrics:"
pm2 monit --no-interaction | head -10

echo "=== Performance Monitor Complete ==="
```

### 3. Log Analysis Tools

```bash
# Find errors in logs
tail -f logs/combined.log | grep -i error

# Count error types
grep -i error logs/combined.log | cut -d'"' -f8 | sort | uniq -c | sort -nr

# Monitor real-time logs
pm2 logs cleanfoss-booking-platform --lines 100

# Search for specific patterns
grep -r "payment.*failed" logs/
grep -r "authentication.*error" logs/
grep -r "database.*timeout" logs/
```

## 📱 Emergency Contacts and Procedures

### 1. Emergency Response Team

```
Primary Contact: DevOps Team
- Email: devops@yourdomain.com
- Phone: +45 XX XX XX XX
- Slack: #alerts-critical

Secondary Contact: Development Team  
- Email: dev@yourdomain.com
- Slack: #development

Business Contact: Product Owner
- Email: product@yourdomain.com
- Phone: +45 XX XX XX XX
```

### 2. Emergency Procedures

#### Critical System Down
```
1. IMMEDIATE (0-5 minutes):
   - Check health endpoint status
   - Verify PM2 process status
   - Check system resources (CPU, memory, disk)
   - Notify emergency contacts

2. SHORT TERM (5-15 minutes):
   - Restart application if needed
   - Check database connectivity
   - Review recent deployment changes
   - Monitor error rates

3. MEDIUM TERM (15-60 minutes):
   - Investigate root cause
   - Apply hotfixes if needed
   - Document incident
   - Communicate with stakeholders
```

#### Database Emergency
```
1. IMMEDIATE:
   - Check database connectivity
   - Verify connection pool status
   - Check for long-running queries
   - Enable read-only mode if needed

2. RECOVERY:
   - Restart database service if needed
   - Kill problematic queries
   - Scale connection pool
   - Restore from backup if necessary
```

## ✅ Troubleshooting Checklist

### Before Deployment
- [ ] Run full test suite
- [ ] Verify environment configuration
- [ ] Test database migrations
- [ ] Check external service connectivity
- [ ] Validate SSL certificates

### During Issues
- [ ] Check health endpoint
- [ ] Review application logs
- [ ] Monitor system resources
- [ ] Test database connectivity
- [ ] Verify external services

### After Resolution
- [ ] Document the issue and solution
- [ ] Update monitoring alerts if needed
- [ ] Review prevention measures
- [ ] Communicate resolution to stakeholders
- [ ] Schedule post-incident review

## 📞 Support Resources

- **Documentation**: `/docs/` directory
- **Health Check**: `https://yourdomain.com/api/health`
- **Monitoring**: `https://yourdomain.com/api/monitoring/database`
- **Logs**: `pm2 logs cleanfoss-booking-platform`
- **Database**: `psql $DATABASE_URL`

Remember: When in doubt, check the health endpoint first, then logs, then system resources!

# Database Troubleshooting Guide

## 🎯 Overview

This guide provides solutions for common database-related issues in the CleanFoss Booking Platform. Use this reference when encountering connection problems, setup issues, or performance concerns.

## 🚨 Quick Diagnostic Commands

### Check PostgreSQL Service Status
```powershell
Get-Service -Name postgresql*
```

### Test Database Connection
```powershell
cd "C:\Program Files\PostgreSQL\17\bin"
.\psql.exe -U cleanfoss_user -h localhost -d cleanfoss_db
```

### Check Prisma Connection
```powershell
npx prisma db push
```

## 🔧 Common Issues and Solutions

### 1. Connection Refused Errors

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
P1001: Can't reach database server at localhost:5432
```

**Diagnosis**:
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Check if port 5432 is listening
netstat -an | findstr :5432
```

**Solutions**:

1. **Start PostgreSQL Service**:
   ```powershell
   Start-Service postgresql-x64-17
   ```

2. **Restart PostgreSQL Service**:
   ```powershell
   Restart-Service postgresql-x64-17
   ```

3. **Check Windows Firewall** (if applicable):
   - Allow PostgreSQL through Windows Firewall
   - Verify port 5432 is not blocked

4. **Verify Installation**:
   - Reinstall PostgreSQL if service won't start
   - Check installation logs for errors

### 2. Authentication Failed

**Symptoms**:
```
password authentication failed for user "cleanfoss_user"
FATAL: role "cleanfoss_user" does not exist
```

**Solutions**:

1. **Recreate Database User**:
   ```sql
   -- Connect as postgres superuser
   psql -U postgres -h localhost
   
   -- Drop existing user if it exists
   DROP USER IF EXISTS cleanfoss_user;
   
   -- Create user with correct password
   CREATE USER cleanfoss_user WITH PASSWORD 'cleanfoss_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;
   ```

2. **Check Environment Variables**:
   ```bash
   # Verify DATABASE_URL in .env.local
   DATABASE_URL="postgresql://cleanfoss_user:cleanfoss_password@localhost:5432/cleanfoss_db"
   ```

3. **Reset User Password**:
   ```sql
   -- Connect as postgres superuser
   ALTER USER cleanfoss_user WITH PASSWORD 'cleanfoss_password';
   ```

### 3. Database Does Not Exist

**Symptoms**:
```
FATAL: database "cleanfoss_db" does not exist
P1003: Database cleanfoss_db does not exist
```

**Solutions**:

1. **Create Missing Database**:
   ```sql
   -- Connect as postgres superuser
   psql -U postgres -h localhost
   
   -- Create database
   CREATE DATABASE cleanfoss_db;
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;
   ```

2. **Verify Database Creation**:
   ```sql
   -- List all databases
   \l
   
   -- Connect to the database
   \c cleanfoss_db
   ```

### 4. Schema Sync Issues

**Symptoms**:
```
Schema drift detected
The database schema is not in sync with your Prisma schema
```

**Solutions**:

1. **Force Schema Sync**:
   ```powershell
   npx prisma db push --force-reset
   ```
   ⚠️ **Warning**: This will delete all data!

2. **Safe Schema Sync**:
   ```powershell
   npx prisma db push
   ```

3. **Check Schema Differences**:
   ```powershell
   npx prisma migrate diff --from-empty --to-schema-datasource
   ```

### 5. Connection Pool Issues

**Symptoms**:
```
Too many clients already
Connection pool timeout
Slow database operations
```

**Solutions**:

1. **Restart Application**:
   ```powershell
   # Stop development server (Ctrl+C)
   npm run dev
   ```

2. **Check Active Connections**:
   ```sql
   -- Connect to database
   SELECT count(*) FROM pg_stat_activity WHERE datname = 'cleanfoss_db';
   ```

3. **Kill Idle Connections** (if necessary):
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE datname = 'cleanfoss_db' AND state = 'idle';
   ```

### 6. Prisma Client Issues

**Symptoms**:
```
PrismaClientInitializationError
Prisma Client could not connect to the database
```

**Solutions**:

1. **Regenerate Prisma Client**:
   ```powershell
   npx prisma generate
   ```

2. **Clear Node Modules and Reinstall**:
   ```powershell
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Check Prisma Version Compatibility**:
   ```powershell
   npx prisma version
   ```

### 7. Permission Denied Errors

**Symptoms**:
```
permission denied for relation
permission denied to create database
```

**Solutions**:

1. **Grant Comprehensive Permissions**:
   ```sql
   -- Connect as postgres superuser
   GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;
   
   -- Connect to cleanfoss_db
   \c cleanfoss_db
   
   -- Grant schema permissions
   GRANT ALL ON SCHEMA public TO cleanfoss_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cleanfoss_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cleanfoss_user;
   
   -- Grant future permissions
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cleanfoss_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cleanfoss_user;
   ```

2. **Make User Superuser** (for development only):
   ```sql
   ALTER USER cleanfoss_user WITH SUPERUSER;
   ```

### 8. Environment Variable Issues

**Symptoms**:
```
Environment variable not found
Invalid connection string
```

**Solutions**:

1. **Verify Environment Files**:
   ```bash
   # Check .env.local exists
   ls -la .env*
   
   # Verify DATABASE_URL format
   cat .env.local
   ```

2. **Check Environment Loading**:
   ```javascript
   // Add to your code temporarily
   console.log('DATABASE_URL:', process.env.DATABASE_URL);
   ```

3. **Environment File Priority**:
   - `.env.local` (highest priority)
   - `.env.development`
   - `.env`

### 9. Windows-Specific Issues

**Symptoms**:
```
Could not find PostgreSQL installation
Command not found: psql
```

**Solutions**:

1. **Add PostgreSQL to PATH**:
   ```
   Add to Windows PATH: C:\Program Files\PostgreSQL\17\bin
   ```

2. **Use Full Path**:
   ```powershell
   cd "C:\Program Files\PostgreSQL\17\bin"
   .\psql.exe -U postgres -h localhost
   ```

3. **Run as Administrator**:
   - Open PowerShell as Administrator
   - Some operations require elevated privileges

## 🔍 Diagnostic Tools

### PostgreSQL Logs

**Location**: `C:\Program Files\PostgreSQL\17\data\log\`

**View Latest Log**:
```powershell
Get-Content "C:\Program Files\PostgreSQL\17\data\log\postgresql-*.log" -Tail 50
```

### Prisma Debug Mode

**Enable Detailed Logging**:
```bash
# Add to .env.local
DEBUG="prisma:client"
```

### Connection Health Check

**Using Built-in Function**:
```javascript
import { checkDatabaseHealth } from '@/lib/prisma';

const isHealthy = await checkDatabaseHealth();
console.log('Database healthy:', isHealthy);
```

## 📊 Performance Monitoring

### Connection Pool Monitoring

**Check Active Connections**:
```sql
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'cleanfoss_db';
```

**View Connection Details**:
```sql
SELECT pid, usename, application_name, state, query_start 
FROM pg_stat_activity 
WHERE datname = 'cleanfoss_db';
```

### Query Performance

**Slow Query Detection**:
```sql
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🆘 Emergency Procedures

### Complete Database Reset

⚠️ **This will delete all data!**

```powershell
# 1. Stop application
# Ctrl+C in terminal running npm run dev

# 2. Reset schema
npx prisma db push --force-reset

# 3. Restart application
npm run dev
```

### PostgreSQL Reinstallation

If PostgreSQL is corrupted:

1. **Uninstall PostgreSQL** via Windows Programs
2. **Delete Data Directory**: `C:\Program Files\PostgreSQL\`
3. **Download and Reinstall** PostgreSQL 17
4. **Reconfigure Database** using setup guide

### Database Connection Factory Reset

```javascript
// Add to your application temporarily
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test basic connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

## 📞 Getting Additional Help

### Self-Diagnosis Checklist

Before seeking help, verify:
- [ ] PostgreSQL service is running
- [ ] Database and user exist
- [ ] Environment variables are correct
- [ ] No firewall blocking port 5432
- [ ] Prisma schema is synced

### Log Collection

When reporting issues, include:
1. **PostgreSQL Service Status**: `Get-Service postgresql*`
2. **Database Connection Test**: Output from psql connection attempt
3. **Application Logs**: Terminal output from `npm run dev`
4. **Environment Variables**: DATABASE_URL (redacted password)
5. **Prisma Status**: Output from `npx prisma db push`

### Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Project Setup Guide**: [database-setup.md](./database-setup.md)

---

*Last Updated: 2025-09-04*  
*For urgent issues, refer to the emergency procedures section above.*

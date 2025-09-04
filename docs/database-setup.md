# Database Setup Guide

## 🎯 Overview

This guide provides complete instructions for setting up the PostgreSQL database infrastructure for the CleanFoss Booking Platform. The setup includes PostgreSQL server installation, database configuration, and enhanced Prisma client integration with connection resilience.

## 📋 Prerequisites

- Windows 10/11 development environment
- Node.js and npm installed
- Administrative privileges for PostgreSQL installation

## 🔧 PostgreSQL Installation

### Step 1: Download PostgreSQL

1. Visit the official PostgreSQL website: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 17 (recommended version for this project)
3. Choose the Windows x86-64 installer

### Step 2: Install PostgreSQL Server

1. **Run the installer as Administrator**
2. **Installation Components**: Select all default components (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
3. **Data Directory**: Use default location (`C:\Program Files\PostgreSQL\17\data`)
4. **Superuser Password**: Set a secure password (remember this - you'll need it!)
   - Recommended: Use a strong password like `CleanFossDB2024!SuperAdmin`
5. **Port**: Use default port `5432`
6. **Locale**: Use default (`[Default locale]`)
7. **Complete Installation**: Let installer finish all components

### Step 3: Verify Installation

Open PowerShell as Administrator and verify PostgreSQL service:

```powershell
Get-Service -Name postgresql*
```

Expected output: `RUNNING` status

## 🗄️ Database Configuration

### Step 1: Connect to PostgreSQL

Open PowerShell as Administrator:

```powershell
cd "C:\Program Files\PostgreSQL\17\bin"
.\psql.exe -U postgres -h localhost
```

Enter your superuser password when prompted.

### Step 2: Create Project Database and User

Execute the following SQL commands:

```sql
-- Create the project database
CREATE DATABASE cleanfoss_db;

-- Create the project user with password
CREATE USER cleanfoss_user WITH PASSWORD 'cleanfoss_password';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;

-- Connect to the project database
\c cleanfoss_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cleanfoss_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cleanfoss_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cleanfoss_user;

-- Exit psql
\q
```

### Step 3: Verify Database Setup

Test the database connection:

```powershell
.\psql.exe -U cleanfoss_user -h localhost -d cleanfoss_db
```

You should be able to connect without errors.

## ⚙️ Environment Configuration

### Environment Variables

The project uses the following environment variable for database connection:

```env
DATABASE_URL="postgresql://cleanfoss_user:cleanfoss_password@localhost:5432/cleanfoss_db"
```

### Environment File Hierarchy

The project supports multiple environment files in this priority order:
1. `.env.local` (highest priority - local development overrides)
2. `.env.development` (development environment)
3. `.env` (default fallback)

**Recommended Setup**: Add the DATABASE_URL to `.env.local` for local development.

## 🚀 Application Setup

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Initialize Database Schema

```powershell
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema`

### Step 3: Start Development Server

```powershell
npm run dev
```

The server will start on `http://localhost:3000` (or `http://localhost:3001` if 3000 is in use).

## 🔧 Enhanced Prisma Configuration

The project includes an enhanced Prisma client configuration in `src/lib/prisma.ts` with the following features:

### Connection Pooling

- **Automatic Management**: Prisma automatically manages a connection pool (typically 21 connections)
- **Efficient Resource Usage**: Connections are reused across requests
- **Logging**: Connection pool startup is logged: `"Starting a postgresql pool with 21 connections"`

### Connection Resilience

#### Retry Logic with Exponential Backoff

```typescript
import { executeWithRetry } from '@/lib/prisma';

// Database operation with automatic retry on connection failures
const result = await executeWithRetry(async () => {
  return await prisma.booking.create({ data: bookingData });
});
```

**Features**:
- **Smart Error Classification**: Only retries connection errors (P1001, P1017, timeout, connect issues)
- **Exponential Backoff**: 500ms * 2^retry (1s, 2s delays)
- **Configurable Retries**: Default 2 retries, customizable per operation

#### Health Monitoring

```typescript
import { checkDatabaseHealth } from '@/lib/prisma';

const isHealthy = await checkDatabaseHealth();
```

#### Graceful Shutdown

```typescript
import { disconnectPrisma } from '@/lib/prisma';

// In application shutdown
await disconnectPrisma();
```

### Query Logging

Enhanced logging captures all database operations:
- **Query Logging**: All SQL queries logged with parameters
- **Connection Events**: Pool startup and connection events
- **Error Details**: Pretty-formatted error messages for debugging

## 🛠️ Development Workflow

### Daily Development Start

1. **Verify PostgreSQL Service**:
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Start Development Server**:
   ```powershell
   npm run dev
   ```

3. **Verify Database Connection** (optional):
   ```powershell
   npx prisma studio
   ```

### Database Schema Updates

When modifying the Prisma schema:

1. **Update Schema**: Edit `prisma/schema.prisma`
2. **Apply Changes**: `npx prisma db push`
3. **Verify**: Check that schema sync completes successfully

### Database Management

#### Useful Commands

- **View Database Schema**: `npx prisma studio`
- **Reset Database**: `npx prisma db push --force-reset` (⚠️ Destroys all data)
- **Check Connection**: `npx prisma db push` (validates connection)

## 🧰 Troubleshooting

### Common Issues and Solutions

#### 1. "Connection refused" or "Server not found"

**Symptoms**: 
- `ECONNREFUSED` errors
- `Server "localhost" not found` messages

**Solutions**:
1. **Verify PostgreSQL Service**:
   ```powershell
   Get-Service -Name postgresql*
   ```
   If not running: `Start-Service postgresql-x64-17`

2. **Check Port Availability**:
   ```powershell
   netstat -an | findstr :5432
   ```

3. **Verify Database User**:
   ```powershell
   cd "C:\Program Files\PostgreSQL\17\bin"
   .\psql.exe -U cleanfoss_user -h localhost -d cleanfoss_db
   ```

#### 2. "Authentication failed" Errors

**Symptoms**:
- `password authentication failed for user`
- `FATAL: role does not exist`

**Solutions**:
1. **Recreate Database User**:
   ```sql
   -- Connect as postgres superuser
   CREATE USER cleanfoss_user WITH PASSWORD 'cleanfoss_password';
   GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;
   ```

2. **Verify Environment Variables**: Check `.env.local` contains correct DATABASE_URL

#### 3. Prisma Schema Sync Issues

**Symptoms**:
- `Schema drift detected`
- `Migration required`

**Solutions**:
1. **Force Schema Sync**:
   ```powershell
   npx prisma db push --force-reset
   ```

2. **Verify Schema**: 
   ```powershell
   npx prisma studio
   ```

#### 4. Connection Pool Issues

**Symptoms**:
- `Too many connections`
- Slow database operations

**Solutions**:
1. **Check Active Connections**: Use pgAdmin or Prisma Studio to monitor connections
2. **Restart Application**: `npm run dev` to reset connection pool
3. **Verify Graceful Shutdown**: Ensure `prisma.$disconnect()` is called properly

## 📊 Performance Monitoring

### Connection Pool Metrics

Monitor connection pool performance through logs:
- **Pool Startup**: `"Starting a postgresql pool with X connections"`
- **Query Execution**: Individual SQL queries with execution time
- **Connection Events**: Connection establishment and cleanup

### Database Health Checks

Use the built-in health check utility:

```typescript
import { checkDatabaseHealth } from '@/lib/prisma';

// In your monitoring or health check endpoint
const isHealthy = await checkDatabaseHealth();
```

## 🎯 Production Considerations

### Environment Variables

For production deployment, ensure:
- **DATABASE_URL**: Points to production PostgreSQL instance
- **Connection Security**: Use SSL in production environments
- **Credentials**: Use secure passwords and proper access controls

### Monitoring

- **Connection Pool**: Monitor pool utilization and performance
- **Query Performance**: Log slow queries for optimization
- **Error Rates**: Track connection failures and retry patterns

## 📚 Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Connection Pooling Best Practices**: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management

---

## ✅ Quick Setup Checklist

For new developers joining the project:

- [ ] Install PostgreSQL 17 with default components
- [ ] Create `cleanfoss_user` and `cleanfoss_db` 
- [ ] Set up environment variables in `.env.local`
- [ ] Run `npx prisma db push` to sync schema
- [ ] Start development server with `npm run dev`
- [ ] Verify setup with `npx prisma studio`

**Setup Time**: ~30 minutes for complete database infrastructure setup

**Result**: Production-ready PostgreSQL database with enhanced connection resilience for reliable booking system operations.

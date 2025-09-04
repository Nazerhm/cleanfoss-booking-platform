# Developer Onboarding Checklist

## 🎯 Welcome to CleanFoss Booking Platform

This checklist ensures new developers can quickly set up their development environment and understand the database infrastructure.

## 📋 Pre-Setup Requirements

- [ ] Windows 10/11 development machine
- [ ] Administrative privileges for software installation
- [ ] Node.js 18+ and npm installed
- [ ] Git installed and configured
- [ ] Code editor (VS Code recommended)

## 🗄️ Database Infrastructure Setup

### PostgreSQL Installation
- [ ] Download PostgreSQL 17 from official website
- [ ] Install with all default components (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
- [ ] Set secure superuser password (save this password securely!)
- [ ] Verify installation: PostgreSQL service running on port 5432
- [ ] Test connection to PostgreSQL using pgAdmin or command line

### Database Configuration
- [ ] Connect to PostgreSQL as superuser
- [ ] Create project database: `cleanfoss_db`
- [ ] Create project user: `cleanfoss_user` with password `cleanfoss_password`
- [ ] Grant all necessary privileges to project user
- [ ] Test connection as project user
- [ ] Verify user can create/read/update/delete data

### Environment Setup
- [ ] Clone project repository
- [ ] Install project dependencies: `npm install`
- [ ] Create `.env.local` file in project root
- [ ] Add `DATABASE_URL="postgresql://cleanfoss_user:cleanfoss_password@localhost:5432/cleanfoss_db"`
- [ ] Initialize database schema: `npx prisma db push`
- [ ] Verify schema sync: "Your database is now in sync with your Prisma schema"

## 🚀 Development Environment

### Application Setup
- [ ] Start development server: `npm run dev`
- [ ] Verify server starts successfully (check for port 3000 or 3001)
- [ ] Open browser and navigate to `http://localhost:3000` (or 3001)
- [ ] Verify application loads without errors
- [ ] Check browser console for any JavaScript errors

### Database Integration Testing
- [ ] Open Prisma Studio: `npx prisma studio`
- [ ] Verify all database tables are visible
- [ ] Navigate to booking page in application
- [ ] Test basic functionality (no need to complete bookings)
- [ ] Check application logs for database queries (should see Prisma query logs)

## 🔧 Development Workflow Understanding

### Database Management
- [ ] Understand Prisma schema location: `prisma/schema.prisma`
- [ ] Know how to sync schema changes: `npx prisma db push`
- [ ] Familiar with Prisma Studio for database inspection
- [ ] Understand enhanced Prisma client configuration in `src/lib/prisma.ts`

### Enhanced Database Features
- [ ] Review connection pooling: Automatic management of database connections
- [ ] Understand retry logic: `executeWithRetry()` function for connection resilience
- [ ] Know health check utility: `checkDatabaseHealth()` function
- [ ] Familiar with graceful shutdown: `disconnectPrisma()` function

### Code Structure
- [ ] Review booking API endpoint: `src/app/api/bookings/route.ts`
- [ ] Understand database models and relationships
- [ ] Know where environment variables are configured
- [ ] Familiar with enhanced error handling and logging

## 📚 Documentation Review

### Required Reading
- [ ] [Database Setup Guide](./database-setup.md) - Complete understanding of PostgreSQL setup
- [ ] [Architecture Overview](./architecture.md) - System architecture and design patterns *(Coming Soon)*
- [ ] Project README.md - Project overview and quick start guide
- [ ] `.memorybank/` directory - Project context and feature documentation

### Code Walkthrough
- [ ] Review `src/lib/prisma.ts` - Enhanced database client configuration
- [ ] Examine `src/app/api/bookings/route.ts` - Booking creation endpoint
- [ ] Study `prisma/schema.prisma` - Database schema and relationships
- [ ] Look at `.env.local` example - Environment variable configuration

## 🛠️ Common Development Tasks

### Daily Workflow
- [ ] Know how to start PostgreSQL service if stopped
- [ ] Understand how to start development server
- [ ] Familiar with checking database connection health
- [ ] Know how to view database content using Prisma Studio

### Troubleshooting Skills
- [ ] Can diagnose "connection refused" errors
- [ ] Know how to restart PostgreSQL service
- [ ] Can verify environment variables are correct
- [ ] Understand how to check database user permissions
- [ ] Know how to force schema reset if needed: `npx prisma db push --force-reset`

## 🎯 Validation Tests

### Setup Verification
- [ ] PostgreSQL service running and accessible
- [ ] Database `cleanfoss_db` exists and is accessible
- [ ] User `cleanfoss_user` can connect and perform operations
- [ ] Prisma schema is synced with database
- [ ] Application starts without database connection errors

### Feature Testing
- [ ] Can access application homepage
- [ ] Booking page loads correctly
- [ ] Database queries appear in application logs
- [ ] No console errors in browser developer tools
- [ ] Prisma Studio shows all expected tables and relationships

## 📞 Getting Help

### Self-Help Resources
1. **Database Setup Issues**: Review [Database Setup Guide](./database-setup.md) troubleshooting section
2. **Connection Problems**: Check PostgreSQL service status and environment variables
3. **Schema Issues**: Use `npx prisma db push` to sync schema
4. **Application Errors**: Check browser console and terminal logs

### Team Resources
- **Database Architecture**: Review `.memorybank/features/008-database-infrastructure-setup/`
- **Feature Documentation**: Check `.memorybank/features/` for current development context
- **Code Comments**: Enhanced Prisma client is well-documented in `src/lib/prisma.ts`

## ✅ Setup Complete!

Once all items are checked:

🎉 **Congratulations!** Your development environment is ready.

**Next Steps**:
- Review current feature development in `.memorybank/features/`
- Familiarize yourself with the booking system workflow
- Understand the enhanced database infrastructure capabilities
- Start contributing to the project!

**Estimated Setup Time**: 45-60 minutes for complete onboarding

**Questions?** Review the documentation or ask team members for assistance.

---

*Last Updated: 2025-09-04*  
*Database Infrastructure: Production Ready ✅*

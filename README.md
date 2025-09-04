# CleanFoss Booking Platform

Professional car cleaning service booking platform for the Danish market.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 17 (see [Database Setup Guide](./docs/database-setup.md))

### Installation

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd cleanfoss-booking-platform
npm install

# 2. Set up database (see docs/database-setup.md for full guide)
# Create PostgreSQL database and user
# Configure environment variables in .env.local

# 3. Initialize database schema
npx prisma db push

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### Database Setup

This project requires PostgreSQL with enhanced connection resilience. For complete setup instructions, see:

� **[Database Setup Guide](./docs/database-setup.md)**

**Quick Setup**:
1. Install PostgreSQL 17
2. Create database: `cleanfoss_db`
3. Create user: `cleanfoss_user`
4. Set `DATABASE_URL` in `.env.local`
5. Run `npx prisma db push`

## �📱 Features

- **Professional Homepage** - Modern landing page with service showcase
- **Booking System** - Multi-step booking wizard with database persistence
- **Danish Localization** - Full Danish language support with proper date formatting
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Service Management** - Comprehensive service and pricing management
- **Vehicle Support** - Extensive car brand and model database
- **Database Resilience** - Enhanced connection pooling and retry logic

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Connection Management**: Enhanced Prisma client with connection pooling
- **Icons**: Heroicons
- **Date Handling**: react-datepicker with Danish locale

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Database Setup Guide](./docs/database-setup.md)** - Complete PostgreSQL setup and configuration
- **[Developer Onboarding](./docs/developer-onboarding.md)** - New developer setup checklist and workflow
- **[Database Troubleshooting](./docs/database-troubleshooting.md)** - Common issues and solutions
- [Architecture Guide](./docs/architecture.md) *(Coming Soon)*
- [API Reference](./docs/api.md) *(Coming Soon)*
- [Deployment Guide](./docs/deployment.md) *(Coming Soon)*

### Development

- **Database Management**: Use `npx prisma studio` for database inspection
- **Schema Updates**: Run `npx prisma db push` after schema changes
- **Health Checks**: Built-in database health monitoring available

## 🎯 Project Status

✅ **Database Infrastructure**: Production-ready PostgreSQL setup with connection resilience  
🔄 **Active Development**: Booking system with full database integration  

See [project context](./.memorybank/_global/project.md) for current status and roadmap.

## 📝 License

This project is proprietary software developed for CleanFoss.

# CleanFoss Booking Platform - Architecture

## System Overview

The CleanFoss Booking Platform is built as a modern Next.js application with the following key architectural decisions:

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Component Structure**: Modular, reusable components in `/src/components/`
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React hooks and context for local state

### Backend Architecture
- **API**: Next.js API routes in `/src/app/api/`
- **Database**: Prisma ORM with multi-tenant support
- **Authentication**: NextAuth.js ready integration

### Key Features
1. **Multi-step Booking Wizard**: Guided booking process
2. **Calendar Integration**: Danish-localized date picker
3. **Service Management**: Flexible service and pricing system
4. **Mobile-first Design**: Responsive across all devices

## Component Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
│   ├── booking/           # Booking-specific components
│   ├── customer/          # Customer-facing components
│   └── [component].tsx    # General components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

## Database Schema

The platform uses a multi-tenant architecture with the following key entities:
- Companies (service providers)
- Services and pricing
- Bookings and schedules
- Customers and vehicles
- Payment processing

*Detailed schema documentation available in Prisma schema file.*

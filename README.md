# University Schedule Allocation Helper App

*Multi-College Scheduling System with Role-Based Access Control*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/daniel-mitikus-projects/v0-allocator)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/alazMx80hSV)

## Overview

A comprehensive university scheduling system that enables multiple colleges to manage their own courses, personnel, rooms, and programs while generating optimized timetables. The system features role-based access control, historical assignment tracking, and multiple allocation algorithms.

## Key Features

- **Multi-College Architecture**: Each college manages its own resources independently
- **Role-Based Access Control**: Super Admin and College Admin roles with appropriate permissions
- **Three Allocation Methods**: Backend Python solver, Google Colab integration, and in-UI manual allocation
- **Timeslot Preference Ranking**: Drag-and-drop interface for ranking preferred time slots
- **Historical Assignment Tracking**: Complete records of personnel-course assignments across scheduling instances
- **Enhanced Allocation Algorithm**: Considers historical data and preferences for optimal assignments

## Development Status: In Progress

**Current Status**: Core architecture implemented, integration and testing phase required.

## TODO List - Path to Production

### 🔧 Critical Setup & Configuration

- [ ] **Database Setup**
  - [ ] Run `npx prisma generate` to generate Prisma client
  - [ ] Set up MongoDB database (local or cloud)
  - [ ] Configure `DATABASE_URL` environment variable
  - [ ] Run database migrations: `npx prisma db push`
  - [ ] Seed initial data (Super Admin user, sample colleges)

- [ ] **Authentication Configuration**
  - [ ] Configure `NEXTAUTH_SECRET` environment variable
  - [ ] Set up `NEXTAUTH_URL` for production deployment
  - [ ] Test authentication flow (login/logout/session management)
  - [ ] Verify role-based access control middleware

- [ ] **Environment Variables Setup**
  - [ ] `DATABASE_URL` - MongoDB connection string
  - [ ] `NEXTAUTH_SECRET` - Authentication secret key
  - [ ] `NEXTAUTH_URL` - Application URL for auth callbacks
  - [ ] `SOLVER_API_URL` - Python solver backend endpoint
  - [ ] `NEXT_PUBLIC_APP_URL` - Public application URL

### 🐛 Bug Fixes & Integration Issues

- [ ] **Navigation & Routing**
  - [ ] Fix admin sidebar navigation links
  - [ ] Implement proper role-based route protection
  - [ ] Test all admin dashboard routes
  - [ ] Verify Super Admin vs College Admin access restrictions

- [ ] **Component Integration**
  - [ ] Fix import/export issues between components
  - [ ] Resolve TypeScript type conflicts
  - [ ] Test all CRUD operations for each resource type
  - [ ] Verify college-specific data filtering

- [ ] **API Endpoints Testing**
  - [ ] Test all `/api/` routes with proper authentication
  - [ ] Verify college-specific data access in APIs
  - [ ] Test assignment history creation and retrieval
  - [ ] Validate timeslot preference saving/loading

### 🧪 Comprehensive Testing

- [ ] **Authentication Testing**
  - [ ] Test Super Admin login and access
  - [ ] Test College Admin login and college-specific access
  - [ ] Test unauthorized access prevention
  - [ ] Test session persistence and logout

- [ ] **Resource Management Testing**
  - [ ] Test college CRUD operations (Super Admin only)
  - [ ] Test personnel management (college-specific)
  - [ ] Test course management (college-specific)
  - [ ] Test room management (college-specific)
  - [ ] Test program management (college-specific)

- [ ] **Scheduling & Allocation Testing**
  - [ ] Test schedule instance creation
  - [ ] Test timeslot preference ranking system
  - [ ] Test manual allocation interface
  - [ ] Test simplified in-UI solver
  - [ ] Test assignment history recording

- [ ] **Data Integrity Testing**
  - [ ] Test college-resource associations
  - [ ] Test historical assignment tracking
  - [ ] Test preference ranking persistence
  - [ ] Test allocation algorithm with historical data

### 🎨 UI/UX Improvements

- [ ] **Dashboard Enhancements**
  - [ ] Improve Super Admin dashboard with system-wide statistics
  - [ ] Enhance College Admin dashboard with college-specific metrics
  - [ ] Add loading states for all async operations
  - [ ] Implement proper error handling and user feedback

- [ ] **Timetable Interface**
  - [ ] Enhance manual allocation sidebar usability
  - [ ] Improve drag-and-drop interactions
  - [ ] Add visual indicators for conflicts and preferences
  - [ ] Implement responsive design for mobile devices

- [ ] **Records & Analytics**
  - [ ] Add data visualization for assignment history
  - [ ] Implement advanced filtering and search
  - [ ] Add export functionality for reports
  - [ ] Create performance analytics dashboard

### 🔄 Algorithm & Solver Integration

- [ ] **Python Solver Backend**
  - [ ] Set up Python solver API endpoint
  - [ ] Test integration with main application
  - [ ] Implement proper error handling for solver failures
  - [ ] Add progress tracking for long-running optimizations

- [ ] **Google Colab Integration**
  - [ ] Create export format for Google Colab
  - [ ] Implement import functionality for solver results
  - [ ] Add validation for imported data
  - [ ] Create user documentation for Colab workflow

- [ ] **Enhanced Algorithm Features**
  - [ ] Fine-tune historical data weighting
  - [ ] Implement conflict detection and resolution
  - [ ] Add preference satisfaction scoring
  - [ ] Test algorithm performance with large datasets

### 📊 Data Management & Migration

- [ ] **Initial Data Setup**
  - [ ] Create seed script for sample colleges
  - [ ] Add sample personnel, courses, and rooms
  - [ ] Create sample availability templates
  - [ ] Generate test scheduling scenarios

- [ ] **Data Validation**
  - [ ] Implement comprehensive input validation
  - [ ] Add data consistency checks
  - [ ] Create backup and restore procedures
  - [ ] Test data migration scenarios

### 🚀 Production Readiness

- [ ] **Performance Optimization**
  - [ ] Optimize database queries with proper indexing
  - [ ] Implement caching for frequently accessed data
  - [ ] Add pagination for large data sets
  - [ ] Optimize bundle size and loading performance

- [ ] **Security Hardening**
  - [ ] Implement rate limiting for API endpoints
  - [ ] Add input sanitization and validation
  - [ ] Secure sensitive environment variables
  - [ ] Implement audit logging for admin actions

- [ ] **Monitoring & Logging**
  - [ ] Set up error tracking (Sentry or similar)
  - [ ] Implement application performance monitoring
  - [ ] Add comprehensive logging for debugging
  - [ ] Create health check endpoints

### 📚 Documentation & Training

- [ ] **User Documentation**
  - [ ] Create Super Admin user guide
  - [ ] Create College Admin user guide
  - [ ] Document allocation algorithm options
  - [ ] Create troubleshooting guide

- [ ] **Technical Documentation**
  - [ ] Document API endpoints and schemas
  - [ ] Create deployment guide
  - [ ] Document database schema and relationships
  - [ ] Create developer setup instructions

- [ ] **Training Materials**
  - [ ] Create video tutorials for key workflows
  - [ ] Develop user onboarding materials
  - [ ] Create FAQ and common issues guide
  - [ ] Prepare admin training sessions

### 🔍 Quality Assurance

- [ ] **End-to-End Testing**
  - [ ] Test complete scheduling workflow
  - [ ] Test multi-college scenarios
  - [ ] Test edge cases and error conditions
  - [ ] Perform load testing with realistic data volumes

- [ ] **User Acceptance Testing**
  - [ ] Conduct testing with actual college administrators
  - [ ] Gather feedback on usability and workflows
  - [ ] Implement requested improvements
  - [ ] Validate system meets requirements

## Quick Start (Development)

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd allocator
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   # Configure all required environment variables
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   npm run seed  # (when seed script is created)
   \`\`\`

4. **Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

Your project is live at: **[https://vercel.com/daniel-mitikus-projects/v0-allocator](https://vercel.com/daniel-mitikus-projects/v0-allocator)**

Continue building on: **[https://v0.app/chat/allocator-rQLhGKnQ6w9](https://v0.app/chat/allocator-rQLhGKnQ6w9)**

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query/SWR
- **Deployment**: Vercel

---

**Note**: This is a comprehensive transformation of a university scheduling system. Follow the TODO list systematically to ensure all components work together seamlessly.

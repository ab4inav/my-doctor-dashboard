# MediPractice - Medical Practice Management System

## Overview

MediPractice is a comprehensive medical practice management system built for healthcare professionals. It provides a secure, user-friendly platform for managing patients, consultations, prescriptions, and medical records. The application follows a modern full-stack architecture with React frontend, Express backend, and Firebase integration for authentication and data storage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **UI Components**: Shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: Firebase Firestore for NoSQL document storage
- **Authentication**: Firebase Authentication
- **Data Storage**: Firestore for real-time data synchronization and offline support
- **API Design**: Direct Firebase SDK integration for optimal performance

### Authentication Strategy
The application uses Firebase Authentication for user management with a hybrid approach:
- Firebase handles user authentication and session management
- Doctor profiles are stored in Firestore with Firebase UID references
- Client-side authentication context manages user state across components

## Key Components

### Data Models
- **Patient**: Core entity with personal information, medical history, and doctor associations
- **Doctor**: Healthcare provider profiles linked to Firebase authentication
- **ConsultationNote**: Clinical notes and observations from patient visits
- **Prescription**: Medication prescriptions with detailed dosage and instructions
- **Invoice**: Billing records for medical services

### Core Features
- **Patient Management**: Add, view, edit, and search patient records
- **Consultation Notes**: Rich text editor for detailed clinical documentation
- **Prescription Management**: Create and manage medication prescriptions with PDF export
- **Dashboard Analytics**: Overview of practice statistics and recent activities
- **PDF Generation**: Export prescriptions and invoices as professional documents

### Security Implementation
- Firebase Authentication with email/password
- Route protection with authentication guards
- Doctor-specific data isolation
- Secure API endpoints with user verification

## Data Flow

1. **Authentication Flow**:
   - User signs in through Firebase Authentication
   - AuthContext retrieves doctor profile from Firestore
   - Protected routes verify authentication status

2. **Patient Management Flow**:
   - Doctors can create and manage their patient roster
   - Patient data is filtered by doctor ID for data isolation
   - Real-time updates through Firestore subscriptions

3. **Clinical Documentation Flow**:
   - Consultation notes use rich text editor with markdown support
   - Prescriptions support multiple medications with detailed instructions
   - PDF generation for professional document export

4. **Data Synchronization**:
   - TanStack Query manages server state with caching
   - Optimistic updates for improved user experience
   - Error handling with user-friendly toast notifications

## External Dependencies

### Core Libraries
- **Firebase SDK**: Authentication and Firestore database
- **Drizzle ORM**: Type-safe database operations
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation
- **jsPDF**: PDF document generation

### UI Dependencies
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast development server and build tool
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing

## Deployment Strategy

### Development Environment
- Replit hosting with Node.js 20 runtime
- PostgreSQL 16 database integration
- Hot reload with Vite development server
- Environment variable management for API keys

### Production Configuration
- Build process: `npm run build` generates optimized client bundle
- Server bundle: ESBuild compiles TypeScript server code
- Static file serving: Express serves built client assets
- Database migrations: Drizzle Kit for schema management

### Environment Setup
- Firebase project configuration for authentication
- Neon PostgreSQL database for data persistence
- Environment variables for secure API key management
- CORS configuration for cross-origin requests

## Changelog

Recent Changes:
- June 15, 2025: Added professional medical logo to application header replacing text-only branding
- June 15, 2025: Completely redesigned PDF documents with professional styling including logo headers, organized layouts, and appealing visual elements
- June 15, 2025: Enhanced prescription PDFs with medication cards, professional color scheme, and structured information boxes
- June 15, 2025: Improved invoice PDFs with alternating row colors, professional totals section, and payment terms
- June 15, 2025: Redesigned consultation note PDFs with clean content areas and proper formatting
- June 15, 2025: Fixed rich text editor formatting display - consultation notes now properly render bold, italic, and underline formatting instead of showing raw markdown/HTML syntax
- June 15, 2025: Improved PDF button placement in consultation notes for better UI layout
- June 15, 2025: Enhanced PDF generation to support formatted text rendering with proper bold text styling
- June 15, 2025: Completed migration from Replit Agent to Replit environment with proper port configuration and Firebase integration
- June 14, 2025: Fixed consultation notes creation - resolved form validation conflicts with rich text editor
- June 14, 2025: Fixed patient list display - removed Firestore orderBy requirements causing failed-precondition errors
- June 14, 2025: Enhanced authentication handling with fallback doctor profiles for immediate functionality
- June 14, 2025: Added comprehensive error handling across all Firestore operations
- June 14, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
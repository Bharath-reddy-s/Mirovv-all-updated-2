# Mystery Box E-Commerce Application

## Overview

This is a Mystery Box e-commerce platform built with React and Express. The application allows users to browse and purchase mystery boxes that contain surprise items, letters, and lucky draw tickets for Instagram giveaways. The platform features a modern, dark-themed UI with product showcases, shopping cart functionality, and a checkout system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 19.1.0 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- Framer Motion for animations and transitions

**UI Component Strategy**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York variant) with Tailwind CSS
- Custom theme system supporting light/dark modes
- Component-based architecture with reusable UI elements in `client/src/components/ui/`

**State Management**
- React Context API for global state (Cart and Developer contexts)
- TanStack React Query for server state management and caching
- Local storage for cart persistence across sessions

**Styling Approach**
- Tailwind CSS with custom configuration
- CSS custom properties for theming
- Design system based on premium product showcases (Apple, Nike inspiration)
- Purple accent color (#270 hsl) for brand identity
- Responsive-first design with mobile breakpoint at 768px

### Backend Architecture

**Server Framework**
- Express.js running on Node.js
- ESM module system throughout the codebase
- Development server runs on port configured in Vite

**API Design**
- RESTful API endpoints under `/api` prefix
- Stock status management endpoints (GET/POST `/api/stock`)
- Request/response logging middleware
- JSON body parsing with raw body capture for webhooks

**Data Storage**
- In-memory storage implementation (`MemStorage` class)
- Interface-based design (`IStorage`) allowing easy swapping to database
- Stock status tracking for products
- Currently configured for PostgreSQL with Drizzle ORM (not yet implemented)

**Development Tools**
- Custom developer mode activated by typing secret phrase
- Stock status toggle panel for testing
- Hot module replacement via Vite
- Error overlay for runtime errors in development

### Data Layer

**Schema Management**
- Shared TypeScript types between client and server (`shared/schema.ts`)
- Zod for runtime validation
- Product data model includes: id, title, label, pricing, images, descriptions, features, specifications
- Stock status model tracks availability per product

**Database Configuration** 
- Drizzle ORM configured with PostgreSQL dialect
- Migration system ready (`drizzle.config.ts`)
- Neon serverless PostgreSQL adapter in dependencies
- Schema defined but migrations not yet run

### Frontend Features

**Shopping Experience**
- Product catalog with image galleries
- Animated product cards with hover effects
- Shopping cart with quantity management
- Cart persistence via localStorage
- Real-time cart count updates
- Checkout form with validation

**Developer Features**
- Hidden developer panel (activated by typing "dormamu is a aunty")
- Stock status toggle for testing out-of-stock scenarios
- Visual indicators for developer mode

**UI Components**
- Custom BackgroundPaths animation component
- CartSheet slide-out panel
- Search dialog with product filtering
- Toast notifications for user feedback
- Responsive navigation bar
- Video canvas component for product showcases

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives (accordion, dialog, dropdown, tooltip, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library
- **Framer Motion**: Animation library for transitions and gestures
- **Spline**: 3D scene integration (@splinetool/react-spline)

### Data & State Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Hookform Resolvers**: Zod integration for form validation
- **Zod**: Schema validation (drizzle-zod for ORM integration)

### Database & ORM
- **Drizzle ORM**: Type-safe SQL ORM
- **Neon Serverless**: PostgreSQL database adapter
- **connect-pg-simple**: PostgreSQL session store (dependency present but sessions not implemented)

### Styling & Utilities
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional className utilities
- **date-fns**: Date manipulation

### Build Tools
- **Vite**: Build tool and dev server
- **esbuild**: JavaScript bundler for production builds
- **tsx**: TypeScript execution for development
- **PostCSS & Autoprefixer**: CSS processing

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay
- **@replit/vite-plugin-cartographer**: Development tools
- **@replit/vite-plugin-dev-banner**: Development banner

### Media & Assets
- Custom video assets stored in `attached_assets/`
- Image hosting via Supabase storage URLs
- Support for remote image patterns in Next.js config (legacy)

### Session Management
- Express-session with PostgreSQL store configured but not active
- Session middleware dependencies present (connect-pg-simple)
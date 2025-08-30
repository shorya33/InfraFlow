# Overview

This is a visual infrastructure builder application that allows users to design AWS infrastructure using a drag-and-drop interface. The application is built with React Flow for the visual canvas, providing a node-based editor similar to n8n or draw.io for creating infrastructure diagrams. Users can create hierarchical infrastructure designs with container nodes (VPCs, Subnets) that can contain other resources, define dependencies between resources, and export their designs as JSON.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Visual Editor**: React Flow for the node-based infrastructure canvas
- **State Management**: Zustand for global application state management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage**: Configurable storage interface with in-memory implementation for development
- **API**: RESTful endpoints for infrastructure graph CRUD operations

## Node and Edge System
- **Node Types**: Supports AWS resources including VPC, Subnet, EC2, RDS, ELB, S3, and IAM roles
- **Hierarchy System**: Container nodes (VPC contains Subnets, Subnets contain services) with validation rules
- **Dependency Management**: Edges represent resource dependencies with validation and ordering
- **Data Structure**: Nodes store configuration parameters, position data, and hierarchical relationships

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for infrastructure graph persistence
- **Schema**: JSON-based storage for complete graph data including nodes, edges, and metadata
- **Development Storage**: In-memory storage implementation for local development
- **Connection**: Neon serverless PostgreSQL driver for production deployment

## Component Architecture
- **Modular UI**: Reusable components for nodes, edges, configuration panels, and modals
- **Custom Nodes**: Specialized React Flow nodes for different AWS resource types
- **Configuration System**: Dynamic form generation based on node types and properties
- **Validation**: Client-side hierarchy and dependency validation with immediate feedback

# External Dependencies

## Core Dependencies
- **React Flow**: Visual node editor framework for the infrastructure canvas
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Drizzle ORM**: TypeScript ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL database hosting
- **Zustand**: Lightweight state management for React

## Development Tools
- **Vite**: Fast build tool with React plugin and runtime error overlay
- **TypeScript**: Type checking and development tooling
- **ESLint/Prettier**: Code formatting and linting (configured via components.json)
- **PostCSS**: CSS processing with autoprefixer

## UI and Interaction
- **Lucide React**: Icon library for AWS service icons and UI elements
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Type-safe CSS class variants
- **CLSX**: Conditional CSS class composition

## Infrastructure Validation
- **Zod**: Runtime type validation for API requests and data schemas
- **Custom Validators**: Hierarchy validation system for container relationships
- **Form Validation**: Real-time validation for node configuration parameters
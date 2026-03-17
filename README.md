# Generic Express MongoDB Backend

A ready-to-use backend template built with Express.js and MongoDB. This repository serves as a starting point for building RESTful APIs for any project, providing a solid foundation with best practices and commonly used features.

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [📂 File Upload & Storage](#-file-upload--storage)
- [🐳 Docker Compose Setup](#-docker-compose-setup)
- [⚙️ Configuration Files](#️-configuration-files)
- [🔧 Utility Functions](#-utility-functions)
- [🛡️ Middlewares](#️-middlewares)
- [🔒 Securing Routes](#-securing-routes)
- [📦 Module Structure (MVC Pattern)](#-module-structure-mvc-pattern)
- [📍 Example Endpoints](#-example-endpoints)
- [🎯 Usage](#-usage)
- [⚠️ Production Deployment](#️-production-deployment)

## ✨ Features

- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB** - Local MongoDB connection with Mongoose ODM
- **TypeScript** - Type-safe code for better development experience
- **Docker Support** - Containerized setup for consistent development environment
- **File Uploads** - Pre-configured file upload handling
- **Environment Configuration** - Easy configuration via environment variables
- **RESTful API Structure** - Organized folder structure following best practices

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Local)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/) and Docker Compose

That's it! Node.js (v20), pnpm, MongoDB, and all other dependencies run inside the containers.

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone git@github.com:eg-delacruz/generic-express-mongo-backend.git
cd generic-express-mongo-backend
```

2. Start the services:
```bash
docker-compose up --build -d
```

The backend will be available at `http://localhost:3000` (or the port specified in your configuration).

To do a quick test, you can access the health check endpoint in your browser or via curl:
```bash
curl http://localhost:3000/api/
```

## 📂 File Upload & Storage

This template includes pre-configured file upload handling with two important directories:

### `uploads/` Directory

Used to store and serve uploaded files during development.

- **Local Access**: Mounted as a bind mount (`./uploads:/app/uploads`), making files directly accessible on your host machine
- **Access**: Files are served at `http://localhost:3000/uploads/filename`
- **API Integration**: Uploaded files through your API endpoints are stored here

**Example**: Place `image.png` in this directory to access it at `http://localhost:3000/uploads/image.png`

### `seed_images/` Directory

Contains example images for testing and documentation purposes.

- **Purpose**: Demonstrates how images are stored and served in the application
- **Usage**: Copy files from here to `./uploads/` to test the image serving endpoint
- **Reference**: Serves as a guide for expected file formats and structure

**How to use**: Copy any file from `seed_images/` to `uploads/`, then access it via `http://localhost:3000/uploads/your-file`

## 🐳 Docker Compose Setup

This project uses `docker-compose.yml` which is configured for **local development only**:

- **MongoDB**: Configured with persistent volume for local database
- **Backend**: Uses bind mounts for all development directories
  - `./backend:/app` - Full access to source code
  - `./uploads:/app/uploads` - Direct access to uploaded files on your host machine
  - Named volumes for `node_modules` and pnpm cache to avoid conflicts

This setup prioritizes **ease of development** by allowing you to directly edit files and access uploads from your host filesystem.

## ⚙️ Configuration Files

The template includes configuration files located in `backend/src/config/`:

### `env.ts`
**Environment Variables Manager**
- Loads and validates environment variables from `.env` file using dotenv
- Provides type-safe access to configuration values throughout the application
- Includes default values for development
- Throws an error on startup if required variables are missing
- **Required variables**: `MONGO_URI`, `SUPER_EMAIL`, `SUPER_PASS`
- **Optional variables**: `PORT` (default: 3000), `JWT_SECRET`, `NODE_ENV`, `VITE_CLIENT_HEADER_KEY`

**Usage**:
```typescript
import env from '@config/env';
console.log(env.PORT); // Type-safe access
```

### `db.ts`
**MongoDB Connection Handler**
- Establishes connection to MongoDB using Mongoose
- Reads connection string from environment variables
- Includes connection event listeners (error, disconnected, reconnected)
- Logs connection status using the custom logger
- Exits the process if initial connection fails
- **Usage**: Called automatically in `index.ts` on server startup

### `logger.ts`
**Custom Console Logger**
- Simple colored console logger for better development experience
- Three log levels: `info` (green), `warn` (yellow), `error` (red)
- Includes timestamps in ISO format
- Lightweight alternative to libraries like Winston or Pino
- **Usage**: Import and use throughout the application

```typescript
import { logger } from '@config/logger';
logger.info('Server started');
logger.warn('Deprecated feature used');
logger.error('Database connection failed');
```

**Note**: For production, consider using more robust logging solutions like Winston, Pino, or cloud logging services.

## � Utility Functions

The template includes helper utilities located in `backend/src/utils/`:

### `response.ts`
**Standardized API Response Handlers**

Provides consistent response formatting across all endpoints with two main functions:

**`successResponse(res, body, message, status)`**
- Sends standardized success responses
- Automatically includes appropriate HTTP status messages
- Logs success messages to console
- Returns JSON in format: `{ error: '', body: {...}, message: '...' }`
- Default status: 200

**`errorResponse(res, message, status, terminalMessage)`**
- Sends standardized error responses  
- Automatically includes appropriate HTTP error messages
- Logs errors to console with optional detailed terminal message
- Returns JSON in format: `{ error: '...', body: '', message: '...' }`
- Default status: 500

**Usage**:
```typescript
import { successResponse, errorResponse } from '@utils/response';

// Success response
return successResponse(res, { user: userData }, 'User created successfully', 201);

// Error response
return errorResponse(res, 'User not found', 404);

// Error with detailed backend logging
return errorResponse(res, 'Database error', 500, error.stack);
```

**Benefits**: Ensures consistent API responses, better client-side error handling, and centralized logging.

### `url.ts`
**Base URL Constructor**

**`getBaseUrl(req)`**
- Constructs the full base URL from Express request object
- Handles proxy headers (`x-forwarded-proto`, `x-forwarded-host`)
- Useful for generating absolute URLs (e.g., for file uploads, email links, redirects)
- Works correctly behind reverse proxies (nginx, load balancers)

**Usage**:
```typescript
import { getBaseUrl } from '@utils/url';

const baseUrl = getBaseUrl(req); // "https://api.example.com"
const fileUrl = `${baseUrl}/uploads/${filename}`;
```

**Note**: The app is configured with `trust proxy: true` in `app.ts`, which is required for this utility to work correctly behind proxies.

## �🛡️ Middlewares

The template includes several pre-configured middlewares located in `backend/src/middlewares/`:

### `auth.middleware.ts`
**JWT Authentication Middleware**
- Verifies JWT tokens from HTTP-only cookies (`access_token`)
- Extracts user information (userId, email, role) and attaches it to the request object
- Returns 401 error if token is missing, invalid, or expired
- **Usage**: Protect routes that require authentication

```typescript
router.get('/protected', authMiddleware, protectedController);
```

### `role.middleware.ts`
**Role-Based Access Control (RBAC)**
- Restricts access to routes based on user roles
- Works in conjunction with `authMiddleware` (must be used after it)
- Accepts multiple roles as parameters
- Returns 403 error if user doesn't have the required role
- **Usage**: Protect routes that require specific roles

```typescript
router.post('/admin', authMiddleware, requireRole('admin', 'super_user'), adminController);
```

### `error.middleware.ts`
**Global Error Handler**
- Catches all errors passed via `next(err)` in routes/controllers
- Standardizes error responses (status code + message)
- Handles both expected errors (with status codes) and unexpected errors
- Must be placed **last** in middleware chain
- **Usage**: Automatically applied in `app.ts`

### `notFound.middleware.ts`
**404 Route Handler**
- Catches requests to undefined routes
- Returns a standardized 404 error response
- Applied after all route definitions
- **Usage**: Automatically applied in `app.ts`

### `upload.middleware.ts`
**File Upload Handler (Multer)**
- Configures file uploads using Multer
- Currently set up for image files only (can be customized)
- Max file size: 5MB (configurable)
- Generates unique filenames to prevent conflicts
- Stores files in `uploads/reports/` directory
- **Usage**: Handle multipart/form-data file uploads

```typescript
router.post('/upload', authMiddleware, uploadReportImages.single('image'), uploadController);
```

**Note**: Customize `upload.middleware.ts` for your specific file upload needs (accepted file types, size limits, storage paths).

## � Securing Routes

The template uses JWT-based authentication and role-based access control (RBAC) to secure routes. Here's how to implement different levels of protection:

### Public Routes (No Protection)

Routes that don't require authentication can be defined without any middleware:

```typescript
router.get('/public-data', publicController);
router.post('/register', registerController);
```

### Authentication-Protected Routes

Use `authMiddleware` to require authentication. Only users with valid JWT tokens can access these routes:

```typescript
import { authMiddleware } from '@middlewares/auth.middleware';

router.get('/profile', authMiddleware, getProfileController);
router.post('/update-profile', authMiddleware, updateProfileController);
```

**What happens:**
- Verifies JWT token from cookies
- Returns 401 if token is missing or invalid
- Adds user info to `req.user` (userId, email, role)

### Role-Protected Routes

Use `requireRole()` to restrict access based on user roles. **Must be used after `authMiddleware`**:

```typescript
import { authMiddleware } from '@middlewares/auth.middleware';
import { requireRole } from '@middlewares/role.middleware';

// Only super_user can access
router.post('/create', authMiddleware, requireRole('super_user'), createUser);

// Multiple roles allowed (super_user OR admin)
router.get('/dashboard', authMiddleware, requireRole('super_user', 'admin'), dashboardController);
```

**What happens:**
- Checks if authenticated user has one of the specified roles
- Returns 403 if user doesn't have the required role
- Proceeds to controller if role matches

### Complete Example from User Routes

```typescript
import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { requireRole } from '@middlewares/role.middleware';
import { createUser, getAllUsers, deleteUserById } from './user.controller';

const router = Router();

// Protected by authentication + super_user role
router.post('/create', authMiddleware, requireRole('super_user'), createUser);
router.get('/all', authMiddleware, requireRole('super_user'), getAllUsers);
router.delete('/delete/:id', authMiddleware, requireRole('super_user'), deleteUserById);

export default router;
```

### Important Notes

⚠️ **Middleware Order Matters**: Always place `authMiddleware` before `requireRole()`, since role checking requires authenticated user information.

```typescript
// ✅ Correct order
router.post('/admin', authMiddleware, requireRole('admin'), controller);

// ❌ Wrong order - will fail
router.post('/admin', requireRole('admin'), authMiddleware, controller);
```

**Available Roles**: Check `backend/src/interfaces/roles.ts` for available user roles in your application.
## 📦 Module Structure (MVC Pattern)

The template follows a modular MVC (Model-View-Controller) pattern. Each module is organized in its own directory under `backend/src/modules/` and consists of three main components:

### Module Anatomy

```
backend/src/modules/user/          # Example: User module
├── user.model.ts                  # Database schema and interface
├── user.controller.ts             # Business logic and request handling
└── user.routes.ts                 # Route definitions and middleware
```

### 1. Model (`*.model.ts`)

**Purpose**: Defines the database schema, data structure, and validation rules using Mongoose.

**Responsibilities**:
- Define TypeScript interfaces for type safety
- Create Mongoose schemas with field types and constraints
- Export the model for use in controllers

**Example from `user.model.ts`**:
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@interfaces/roles';

// TypeScript interface
export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
}

// Mongoose schema
const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_user', 'standard_user', 'service_desk_user'],
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Export model
export const User = mongoose.model<IUser>('User', userSchema);
```

### 2. Controller (`*.controller.ts`)

**Purpose**: Contains the business logic and handles HTTP request/response operations.

**Responsibilities**:
- Process incoming requests and validate input
- Interact with the database through models
- Handle errors and pass them to error middleware
- Return standardized responses using utility functions

**Example from `user.controller.ts`**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { User } from '@modules/user/user.model';
import { successResponse, errorResponse } from '@utils/response';
import { hash } from 'bcrypt';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, role } = req.body;

  // Input validation
  if (!email || !password || !role) {
    return errorResponse(res, 'Email, password, and role are required', 400);
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    const savedUser = await newUser.save();

    // Return success response
    return successResponse(
      res,
      { _id: savedUser._id, email: savedUser.email, role: savedUser.role },
      'User created successfully',
      201
    );
  } catch (error) {
    next(error); // Pass errors to error middleware
  }
};
```

### 3. Routes (`*.routes.ts`)

**Purpose**: Defines API endpoints and applies middleware (authentication, validation, etc.).

**Responsibilities**:
- Define HTTP methods and URL paths
- Apply middleware (authentication, authorization, validation, file uploads)
- Connect routes to controller functions
- Export router to be mounted in main routes file

**Example from `user.routes.ts`**:
```typescript
import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { requireRole } from '@middlewares/role.middleware';
import { createUser, getAllUsers, deleteUserById } from './user.controller';

const router = Router();

// POST /api/users/create - Create new user (super_user only)
router.post('/create', authMiddleware, requireRole('super_user'), createUser);

// GET /api/users/all - Get all users (super_user only)
router.get('/all', authMiddleware, requireRole('super_user'), getAllUsers);

// DELETE /api/users/delete/:id - Delete user by ID (super_user only)
router.delete('/delete/:id', authMiddleware, requireRole('super_user'), deleteUserById);

export default router;
```

### Creating a New Module

To add a new entity (e.g., `products`):

1. **Create the directory**: `backend/src/modules/products/`
2. **Create the model**: `products.model.ts` (define schema and interface)
3. **Create the controller**: `products.controller.ts` (implement business logic)
4. **Create the routes**: `products.routes.ts` (define endpoints and middleware)
5. **Mount the routes**: In `backend/src/routes/index.ts`:
   ```typescript
   import productRoutes from '@modules/products/products.routes';
   router.use('/products', productRoutes);
   ```

This pattern keeps your code organized, maintainable, and follows separation of concerns principles.
## �📍 Example Endpoints

The template includes the following ready-to-use endpoints:

### Authentication (`/api/auth`)
```
POST   /api/auth/login      # User login (returns JWT in cookie)
GET    /api/auth/me         # Get current authenticated user info (protected)
POST   /api/auth/logout     # User logout (protected)
```

### Users (`/api/users`)
```
POST   /api/users/create    # Create new user (protected, super_user only)
GET    /api/users/all       # Get all users (protected, super_user only)
DELETE /api/users/delete/:id # Delete user by ID (protected, super_user only)
```

### Health Check
```
GET    /api/               # API health check
```

**Note**: Protected routes require authentication via JWT token in cookies. Role-restricted routes require specific user roles.

## 🎯 Usage

This template is meant to be **forked or cloned** and customized for your specific project needs:

1. **Clone/Fork** this repository
2. **Customize** the models, routes, and controllers based on your requirements
3. **Add** your business logic and API endpoints
4. **Configure** environment variables for your specific use case
5. **Deploy** to your preferred hosting platform

### Example: Adding a New Module

The template includes example routes for **authentication** and **user management**. Use these as a reference for adding your own entities. Here's the structure:

```
backend/src/modules/users/          # Example module directory
├── user.model.ts                   # Database schema/model
├── user.controller.ts              # Business logic handlers
├── user.routes.ts                  # Route definitions
└── user.validation.ts              # Input validation (optional)
```

To add a new entity (e.g., `products`), create a similar structure in `backend/src/modules/products/` and mount the routes in `backend/src/routes/index.ts`:

```typescript
import productRoutes from '@modules/products/products.routes';
router.use('/products', productRoutes);
```

**Note**: This is a starter template. Customize it according to your project requirements. Remember to update this README as you add new features and endpoints to your API.

## ⚠️ Production Deployment

This template is currently configured for **local development only**. To deploy this project to production, you'll need to make significant changes:

### Docker & Docker Compose

**Development vs Production differences:**
- Remove bind mounts (`./ ` paths) - these are only for local development
- Use Docker named volumes or remove local file storage entirely
- Set `NODE_ENV: production` instead of `development`
- Update `command` to run production build instead of dev server (`pnpm run build && pnpm start`)
- Remove `stdin_open`, `tty`, and `init` flags
- Add proper restart policies and health checks
- Consider multi-stage builds to reduce image size

**Example changes needed in `docker-compose.yml`:**
```yaml
backend:
  # ... other config
  environment:
    NODE_ENV: production  # Change from development
  command: pnpm start     # Use production command, not dev
  # Remove: stdin_open, tty, init
  restart: always         # Add restart policy
  # Remove or change: bind mounts like ./backend:/app
```

### Database Configuration

**Switch from local MongoDB to a remote database:**
- Replace the local MongoDB service with a remote MongoDB instance
- Examples: MongoDB Atlas, AWS DocumentDB, or your own managed MongoDB server
- Update `MONGO_URI` environment variable to point to your remote database
- Ensure proper authentication credentials are set via environment variables
- Consider database encryption, backups, and monitoring

**Update `.env` for production:**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/database-name
# Never commit real credentials - use secret management tools
```

### File Storage

**Switch from local filesystem to cloud storage:**
- **Remove** the local `uploads/` directory approach
- **Implement** cloud storage integration (AWS S3, Google Cloud Storage, Azure Blob, etc.)
- Update your file upload endpoints to upload directly to the cloud service
- Use pre-signed URLs or CDN for serving files securely
- Benefits: scalability, durability, multi-region support, backup management

**Popular choices:**
- **AWS S3** - Industry standard, excellent documentation
- **Google Cloud Storage** - Integration with Google Cloud ecosystem
- **Azure Blob Storage** - Integration with Microsoft Azure
- **Cloudinary** - Specialized for images with built-in optimization

**Example S3 implementation:**
- Install SDK: `pnpm add aws-sdk`
- Update upload routes to use S3 client
- Remove local file serving code
- Use pre-signed URLs for file access

### Environment Variables & Secrets

**Production security:**
- Use a secrets management tool (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never commit `.env` files with production credentials to Git
- Rotate secrets periodically
- Use strong, unique passwords for databases and API keys

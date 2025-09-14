// BookBuddy Express Application Configuration
// Sets up middleware, security, routing, and error handling

// Load environment variables
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

// Configuration and validation
import validateEnv from './config/validateEnv.js';

// Security middleware
import securityHeaders from './middleware/securityHeaders.js';
import corsConfig from './middleware/corsConfig.js';
import sanitize from './middleware/sanitize.js';
import httpsOnly from './middleware/httpsOnly.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiters.js';

// Utility middleware
import requestId from './middleware/requestId.js';
import logRequests from './middleware/logRequests.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

// Error handling
import errorHandler from './middleware/errorHandler.js';

// Validate environment variables on startup
validateEnv();

// Create Express application
const app = express();

// Trust proxy for accurate client IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Request tracking and logging middleware (applied first)
app.use(requestId); // Add unique request ID for tracing
app.use(logRequests); // Log all incoming requests

// Security middleware stack
app.use(securityHeaders()); // Set security headers (Helmet)
app.use(corsConfig); // Configure CORS for cross-origin requests
app.use(httpsOnly); // Enforce HTTPS in production

// Request parsing middleware
app.use(cookieParser()); // Parse cookies from requests
app.use(express.json({ limit: '100kb' })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '100kb' })); // Parse URL-encoded bodies
app.use(sanitize()); // Sanitize input to prevent NoSQL injection

// Rate limiting middleware
app.use(globalLimiter); // Apply global rate limiting to all routes

// API routes with versioning
app.use('/api/v1', healthRoutes); // Health check endpoints
app.use('/api/v1/auth', authLimiter, authRoutes); // Authentication routes with stricter rate limiting
app.use('/api/v1/library', bookRoutes); // Book library management routes

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
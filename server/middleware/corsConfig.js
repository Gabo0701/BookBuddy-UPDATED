// CORS (Cross-Origin Resource Sharing) Configuration
// Allows frontend applications to make requests to the API from different origins

import cors from 'cors';

// Define allowed origins for cross-origin requests
// Includes development ports and environment-specific URLs
const allowedOrigins = [
  process.env.CLIENT_URL,           // Production/configured client URL
  'http://localhost:5173',          // Default Vite development server port
  'http://localhost:5174',          // Alternative Vite port
  'http://localhost:3000'           // Common React development port
].filter(Boolean); // Remove any undefined values

// Export configured CORS middleware
export default cors({
  origin: allowedOrigins,           // Allow requests from specified origins only
  credentials: true,                // Allow cookies and authorization headers
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type','Authorization'] // Allowed request headers
});

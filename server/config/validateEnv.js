// Environment Variables Validation
// Ensures all required environment variables are set before server startup

// List of required environment variables for the application to function
const required = [
  'MONGO_URI',          // MongoDB connection string
  'CLIENT_URL',         // Frontend application URL for CORS
  'JWT_ACCESS_SECRET',  // Secret key for JWT access tokens
  'JWT_REFRESH_SECRET'  // Secret key for JWT refresh tokens
];

/**
 * Validates that all required environment variables are present
 * Exits the process with error code 1 if any variables are missing
 */
export default function validateEnv() {
  // Filter out any missing environment variables
  const missing = required.filter(k => !process.env[k]);
  
  // Exit with error if any required variables are missing
  if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '));
    process.exit(1);
  }
}
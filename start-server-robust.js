#!/usr/bin/env node

// Set environment variables for better MongoDB compatibility
process.env.NODE_OPTIONS = '--openssl-legacy-provider';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only for development

console.log('🚀 Starting BookBuddy server with enhanced MongoDB compatibility...');
console.log('📝 Environment: NODE_OPTIONS =', process.env.NODE_OPTIONS);

// Import the server
import('./server/server-robust.js').catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
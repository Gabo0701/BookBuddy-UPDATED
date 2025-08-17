#!/usr/bin/env node

// Set OpenSSL legacy provider for compatibility with older SSL/TLS implementations
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

// Import and start the server
import('./server/server.js').catch(console.error);
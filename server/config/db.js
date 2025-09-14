// MongoDB Database Connection Configuration
// Handles connection with retry logic, error handling, and graceful shutdown

import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB with retry logic and error handling
 * Includes connection event listeners and graceful shutdown handling
 */
export default async function connectDB() {
  // Validate MongoDB URI from environment variables
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }
   
  /**
   * Connection function with retry logic for handling network issues
   * Attempts connection up to 5 times with 5-second delays
   */
  const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // MongoDB connection options optimized for reliability
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 30000, // 30 second timeout for server selection
          connectTimeoutMS: 30000, // 30 second timeout for initial connection
          socketTimeoutMS: 30000, // 30 second timeout for socket operations
          maxPoolSize: 10, // Maximum number of connections in pool
          bufferCommands: false, // Disable command buffering
        });
        
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return;
        
      } catch (err) {
        retries++;
        console.log(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`);
        console.log(`   Error: ${err.message}`);
        
        // Provide helpful troubleshooting tips based on error type
        if (err.message.includes('IP')) {
          console.log(`💡 Tip: Check if your IP is whitelisted in MongoDB Atlas`);
          console.log(`   Go to: https://cloud.mongodb.com/ → Network Access`);
        }
        
        if (err.message.includes('authentication')) {
          console.log(`💡 Tip: Check your username/password in MONGO_URI`);
        }
        
        // Exit if max retries reached
        if (retries === maxRetries) {
          console.error('❌ Max retries reached. Please check:');
          console.error('   1. MongoDB Atlas IP whitelist');
          console.error('   2. Database user credentials');
          console.error('   3. Internet connection');
          console.error('   4. MongoDB Atlas cluster status');
          process.exit(1);
        }
        
        // Wait before retrying
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  };

  // MongoDB connection event listeners for monitoring
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
  });

  // Graceful shutdown handler for clean database disconnection
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  });

  // Initiate connection with retry logic
  await connectWithRetry();
}
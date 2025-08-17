import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  const connectionStrategies = [
    {
      name: 'Standard Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        bufferCommands: false,
      }
    },
    {
      name: 'IPv4 Only Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        bufferCommands: false,
        family: 4,
      }
    },
    {
      name: 'Legacy SSL Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        bufferCommands: false,
        family: 4,
        ssl: true,
      }
    }
  ];

  const connectWithRetry = async () => {
    const maxRetries = 3;
    
    for (const strategy of connectionStrategies) {
      console.log(`🔄 Trying ${strategy.name}...`);
      
      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const conn = await mongoose.connect(uri, strategy.options);
          console.log(`✅ MongoDB connected using ${strategy.name}: ${conn.connection.host}`);
          console.log(`📊 Database: ${conn.connection.name}`);
          return;
          
        } catch (err) {
          console.log(`❌ ${strategy.name} attempt ${retries + 1}/${maxRetries} failed:`);
          console.log(`   Error: ${err.message}`);
          
          // Provide helpful error messages
          if (err.message.includes('IP')) {
            console.log(`💡 Tip: Check if your IP is whitelisted in MongoDB Atlas`);
            console.log(`   Go to: https://cloud.mongodb.com/ → Network Access`);
          }
          
          if (err.message.includes('authentication')) {
            console.log(`💡 Tip: Check your username/password in MONGO_URI`);
          }
          
          if (err.message.includes('SSL') || err.message.includes('TLS')) {
            console.log(`💡 Tip: SSL/TLS error detected. Trying next strategy...`);
          }
          
          if (retries < maxRetries - 1) {
            console.log(`⏳ Retrying ${strategy.name} in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      console.log(`❌ ${strategy.name} failed after ${maxRetries} attempts`);
    }
    
    console.error('❌ All connection strategies failed. Please check:');
    console.error('   1. MongoDB Atlas IP whitelist');
    console.error('   2. Database user credentials');
    console.error('   3. Internet connection');
    console.error('   4. MongoDB Atlas cluster status');
    console.error('   5. Try running with: NODE_OPTIONS="--openssl-legacy-provider"');
    
    // Don't exit immediately, allow the server to start without DB
    console.log('⚠️  Server will start without database connection');
    console.log('   Database operations will fail until connection is established');
  };

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
    
    // Attempt to reconnect after 10 seconds
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectWithRetry().catch(console.error);
    }, 10000);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
    process.exit(0);
  });

  await connectWithRetry();
}
import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }
   
  const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // Minimal connection options for maximum compatibility
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          maxPoolSize: 10,
          bufferCommands: false,
        });
        
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return;
        
      } catch (err) {
        retries++;
        console.log(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`);
        console.log(`   Error: ${err.message}`);
        
        // Provide helpful error messages
        if (err.message.includes('IP')) {
          console.log(`💡 Tip: Check if your IP is whitelisted in MongoDB Atlas`);
          console.log(`   Go to: https://cloud.mongodb.com/ → Network Access`);
        }
        
        if (err.message.includes('authentication')) {
          console.log(`💡 Tip: Check your username/password in MONGO_URI`);
        }
        
        if (retries === maxRetries) {
          console.error('❌ Max retries reached. Please check:');
          console.error('   1. MongoDB Atlas IP whitelist');
          console.error('   2. Database user credentials');
          console.error('   3. Internet connection');
          console.error('   4. MongoDB Atlas cluster status');
          process.exit(1);
        }
        
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  };

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  });

  await connectWithRetry();
}
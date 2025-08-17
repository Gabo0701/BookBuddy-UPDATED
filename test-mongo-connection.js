import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://bookbuddy_user:bookbuddy12345@cluster0.ufq5pua.mongodb.net/bookbuddy?retryWrites=true&w=majority';

console.log('🔍 Testing MongoDB connection...');
console.log('🌐 Node.js version:', process.version);
console.log('🔐 OpenSSL version:', process.versions.openssl);
console.log('⚙️  NODE_OPTIONS:', process.env.NODE_OPTIONS);

async function testConnection() {
  try {
    console.log('🔄 Attempting connection...');
    
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔗 Connection state:', conn.connection.readyState);
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('📝 Error message:', error.message);
    console.error('🏷️  Error name:', error.name);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 SOLUTION: Add your IP to MongoDB Atlas whitelist');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Select your project');
      console.log('   3. Go to Network Access');
      console.log('   4. Click "Add IP Address"');
      console.log('   5. Add your current IP or use 0.0.0.0/0 for testing');
    }
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n💡 SOLUTION: SSL/TLS compatibility issue');
      console.log('   Try running with: NODE_OPTIONS="--openssl-legacy-provider"');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 SOLUTION: Check database credentials');
      console.log('   Verify username and password in MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();
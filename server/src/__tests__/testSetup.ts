import mongoose from 'mongoose';

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-jwt-validation';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-quickpoll-db';

// Global test setup
beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI!, {
      maxPoolSize: 1, // Limit pool size for tests
    });
    
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
}, 30000);

// Global test cleanup
afterAll(async () => {
  try {
    // Drop the test database
    await mongoose.connection.dropDatabase();
    
    // Close the connection
    await mongoose.disconnect();
    
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Test database cleanup failed:', error);
  }
}, 30000);
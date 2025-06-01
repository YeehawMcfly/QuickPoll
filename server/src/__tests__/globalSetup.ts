import mongoose from 'mongoose';

export default async (): Promise<void> => {
  // Set test environment variables
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-db';
  
  // Connect to test database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
};
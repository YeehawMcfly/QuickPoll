import mongoose from 'mongoose';

export default async (): Promise<void> => {
  // Clean up test database and close connection
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Test database cleanup failed:', error);
  }
};
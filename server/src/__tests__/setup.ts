// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});
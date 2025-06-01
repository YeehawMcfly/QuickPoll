module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'globalSetup.ts',
    'globalTeardown.ts',
    'testSetup.ts'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/testSetup.ts'],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests serially to avoid database conflicts
};
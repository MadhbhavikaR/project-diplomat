// Jest configuration for React ADK Web
// jest.config.cjs

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Preset for TypeScript support
  preset: 'ts-jest/presets/js-with-ts',
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Test file patterns - only look in src directory
  testMatch: ['<rootDir>/src/**/__tests__/**/*.[jt]s?(x)', '<rootDir>/src/**/?(*.)+(spec|test).[tj]s?(x)'],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Module name mapper for CSS and other assets
  moduleNameMapper: {
    '^.+\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Exclude reference implementation directory
  testPathIgnorePatterns: ['<rootDir>/reference_implementation/', '<rootDir>/node_modules/'],
  
  // Transform configuration
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: false
    }]
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Coverage configuration
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true
};

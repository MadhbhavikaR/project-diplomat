// Global test setup for React ADK Web
// src/setupTests.ts

// Import testing library utilities
import '@testing-library/jest-dom';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  })
});

// Global test utilities
beforeEach(() => {
  // Clean up DOM before each test
  document.body.innerHTML = '';
  
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = '';
});

// Export empty object to make this a valid module
export {};

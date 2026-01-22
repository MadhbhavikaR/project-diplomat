/**
 * Test Utilities for React Application
 * 
 * Basic test utilities for testing React components
 * 
 * @file src/test-utils.tsx
 */

import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

// Test Query Client Configuration
export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  }
});

/**
 * Custom Render Function with Providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    routerProps = { initialEntries: ['/'] },
    ...renderOptions
  }: {
    routerProps?: { initialEntries?: string[] };
    renderOptions?: any;
  } = {}
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter {...routerProps}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * User Event Setup
 */
export function setupUserEvent() {
  return userEvent.setup();
}

/**
 * Export utilities for easy import
 */
export {
  renderWithProviders as render,
  setupUserEvent as userEvent,
};

export default {
  renderWithProviders,
  setupUserEvent,
};


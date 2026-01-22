import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { renderWithProviders } from '../test-utils';
import { useAgentStore } from '../store/useAgentStore';

// Mock the agent store
jest.mock('../store/useAgentStore', () => ({
  useAgentStore: jest.fn(),
}));

describe('Layout Component', () => {
  const mockAgent = { id: '1', name: 'Test Agent' };
  const mockSession = { id: 'session-1', name: 'Test Session' };

  beforeEach(() => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      currentAgent: null,
      currentSession: null,
    });
  });

  it('renders layout with header, main content, and footer', () => {
    renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByText('ADK Web - React')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('ADK Web React Migration - Phase 1')).toBeInTheDocument();
  });

  it('displays current agent when available', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      currentAgent: mockAgent,
      currentSession: null,
    });
    
    renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Agent: Test Agent')).toBeInTheDocument();
  });

  it('displays current session when available', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      currentAgent: null,
      currentSession: mockSession,
    });
    
    renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Session: session-1')).toBeInTheDocument();
  });

  it('displays both agent and session when both are available', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      currentAgent: mockAgent,
      currentSession: mockSession,
    });
    
    renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Agent: Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Session: session-1')).toBeInTheDocument();
  });

  it('uses Outlet when no children provided', () => {
    renderWithProviders(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText('ADK Web - React')).toBeInTheDocument();
    expect(screen.getByText('ADK Web React Migration - Phase 1')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    
    expect(screen.getByRole('heading', { name: 'ADK Web - React' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithProviders(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
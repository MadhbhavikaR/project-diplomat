import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentList from '../components/AgentList';
import { renderWithProviders } from '../test-utils';
import { useAgentStore, useAgentActions } from '../store/useAgentStore';

// Mock the agent store
jest.mock('../store/useAgentStore', () => ({
  ...jest.requireActual('../store/useAgentStore'),
  useAgentStore: jest.fn(),
  useAgentActions: jest.fn(),
}));

describe('AgentList Component', () => {
  const mockAgents = [
    { id: '1', name: 'Test Agent', description: 'Test agent for development' },
    { id: '2', name: 'Builder Agent', description: 'Agent for building tools' },
  ];

  beforeEach(() => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: [],
      isLoading: false,
      error: null,
    });
    
    (useAgentActions as unknown as jest.Mock).mockReturnValue({
      loadAgents: jest.fn(),
    });
  });

  it('renders loading state initially', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: [],
      isLoading: true,
      error: null,
    });
    
    renderWithProviders(<AgentList />);
    expect(screen.getByText('Loading agents...')).toBeInTheDocument();
  });

  it('renders error state when error occurs', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: [],
      isLoading: false,
      error: 'Failed to load agents',
    });
    
    renderWithProviders(<AgentList />);
    expect(screen.getByText('Error: Failed to load agents')).toBeInTheDocument();
  });

  it('renders empty state when no agents available', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: [],
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<AgentList />);
    expect(screen.getByText('Available Agents')).toBeInTheDocument();
    expect(screen.getByText('No agents found')).toBeInTheDocument();
  });

  it('renders list of agents when available', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: mockAgents,
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<AgentList />);
    
    expect(screen.getByText('Available Agents')).toBeInTheDocument();
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Builder Agent')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Select' })).toHaveLength(2);
  });

  it('calls loadAgents on mount', () => {
    const mockLoadAgents = jest.fn();
    (useAgentActions as unknown as jest.Mock).mockReturnValue({
      loadAgents: mockLoadAgents,
    });
    
    renderWithProviders(<AgentList />);
    expect(mockLoadAgents).toHaveBeenCalled();
  });

  it('handles agent selection button click', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log');
    
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: mockAgents,
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<AgentList />);
    
    const selectButtons = screen.getAllByRole('button', { name: 'Select' });
    await user.click(selectButtons[0]);
    
    expect(consoleSpy).toHaveBeenCalledWith('Select agent:', '1');
  });

  it('has proper accessibility attributes', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: mockAgents,
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<AgentList />);
    
    expect(screen.getByRole('heading', { name: 'Available Agents' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('matches snapshot', () => {
    (useAgentStore as unknown as jest.Mock).mockReturnValue({
      agents: mockAgents,
      isLoading: false,
      error: null,
    });
    
    const { asFragment } = renderWithProviders(<AgentList />);
    expect(asFragment()).toMatchSnapshot();
  });
});
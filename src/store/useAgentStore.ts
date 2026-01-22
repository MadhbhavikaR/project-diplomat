import { create } from 'zustand';
import type { Agent, Session } from '../types/index';

interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  currentAgent: null,
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  
  setAgents: (agents) => set({ agents }),
  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  setCurrentSession: (session) => set({ currentSession: session }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Custom hooks for specific agent operations
export const useAgentActions = () => {
  const { setAgents, setCurrentAgent, setLoading, setError } = useAgentStore();
  
  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement actual API call
      const mockAgents: Agent[] = [
        { id: '1', name: 'Test Agent', description: 'Test agent for development' },
      ];
      setAgents(mockAgents);
    } catch (error) {
      setError('Failed to load agents');
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const selectAgent = (agentId: string) => {
    // Implementation will be added later
  };
  
  return { loadAgents, selectAgent };
};

// Custom hooks for session management
export const useSessionActions = () => {
  const { addSession, setCurrentSession, setLoading, setError } = useAgentStore();
  
  const createSession = async (agentId: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement actual API call
      const mockSession: Session = {
        id: 'session-1',
        agentId,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      addSession(mockSession);
      setCurrentSession(mockSession);
      return mockSession;
    } catch (error) {
      setError('Failed to create session');
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { createSession };
};
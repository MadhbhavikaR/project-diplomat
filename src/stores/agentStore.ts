import { create } from 'zustand';
import { apiClient } from '../services/apiClient';
import type { Session, Agent } from '../types';

// Add missing API methods to the client
declare module '../services/apiClient' {
  interface ApiClient {
    getSessions(agentId: string): Promise<{ success: boolean; data?: Session[]; error?: string }>;
  }
}

interface AgentStoreState {
  agents: Agent[];
  currentAgent: Agent | null;
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  addSession: (session: Session) => void;
  setCurrentSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Async actions
  loadAgents: () => Promise<void>;
  loadSessions: (agentId: string) => Promise<void>;
}

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  agents: [],
  currentAgent: null,
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  
  // Synchronous actions
  setAgents: (agents) => set({ agents }),
  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  setCurrentSession: (session) => set({ currentSession: session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Asynchronous actions
  loadAgents: async () => {
    try {
      set({ loading: true, error: null });
      const { apiClient } = await import('../services/apiClient');
      const response = await apiClient.getAgents();
      
      if (response.success && response.data) {
        set({ agents: response.data });
      } else {
        set({ error: response.error || 'Failed to load agents' });
      }
    } catch (error) {
      set({ error: 'Failed to load agents' });
      console.error('Error loading agents:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  loadSessions: async (agentId) => {
    try {
      set({ loading: true, error: null });
      // Use the generic request method since getSessions doesn't exist
      const response = await apiClient.request<Session[]>({
        method: 'GET',
        url: `/agents/${agentId}/sessions`,
      });
      
      if (response.success && response.data) {
        set({ sessions: response.data });
      } else {
        set({ error: response.error || 'Failed to load sessions' });
      }
    } catch (error) {
      set({ error: 'Failed to load sessions' });
      console.error('Error loading sessions:', error);
    } finally {
      set({ loading: false });
    }
  },
}));

// Helper hook for easier access
export const useCurrentAgent = () => {
  const currentAgent = useAgentStore((state) => state.currentAgent);
  return currentAgent;
};

export const useCurrentSession = () => {
  const currentSession = useAgentStore((state) => state.currentSession);
  return currentSession;
};

export const useAgentStoreActions = () => {
  const actions = useAgentStore((state) => ({
    setCurrentAgent: state.setCurrentAgent,
    setCurrentSession: state.setCurrentSession,
    loadAgents: state.loadAgents,
    loadSessions: state.loadSessions,
  }));
  return actions;
};
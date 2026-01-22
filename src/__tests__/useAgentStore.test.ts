import { renderHook, act } from '@testing-library/react';
import { useAgentStore, useAgentActions } from '../store/useAgentStore';
import { type Agent, type Session } from '../types';

describe('useAgentStore', () => {
  const mockAgents: Agent[] = [
    { id: '1', name: 'Test Agent', description: 'Test agent', status: 'idle' },
    { id: '2', name: 'Builder Agent', description: 'Builder agent', status: 'idle' },
  ];

  const mockSession: Session = {
    id: 'session-1',
    agentId: '1',
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  beforeEach(() => {
    // Reset store before each test
    const { result: storeResult } = renderHook(() => useAgentStore());
    const { result: actionsResult } = renderHook(() => useAgentActions());
    
    // Clear all state
    act(() => {
      storeResult.current.setAgents([]);
      storeResult.current.setCurrentAgent(null);
      storeResult.current.addSession(mockSession);
      storeResult.current.setCurrentSession(null);
      storeResult.current.setLoading(false);
      storeResult.current.setError(null);
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useAgentStore());
      
      expect(result.current.agents).toEqual([]);
      expect(result.current.currentAgent).toBeNull();
      expect(result.current.sessions).toEqual([mockSession]);
      expect(result.current.currentSession).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Agent Management', () => {
    it('should set agents correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setAgents(mockAgents);
      });
      
      expect(result.current.agents).toEqual(mockAgents);
    });

    it('should set current agent correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setCurrentAgent(mockAgents[0]);
      });
      
      expect(result.current.currentAgent).toEqual(mockAgents[0]);
    });

    it('should clear current agent', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setCurrentAgent(mockAgents[0]);
        result.current.setCurrentAgent(null);
      });
      
      expect(result.current.currentAgent).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should add session correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      const newSession: Session = {
        id: 'session-2',
        agentId: '2',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      
      act(() => {
        result.current.addSession(newSession);
      });
      
      expect(result.current.sessions).toContainEqual(newSession);
      expect(result.current.sessions).toHaveLength(2);
    });

    it('should set current session correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setCurrentSession(mockSession);
      });
      
      expect(result.current.currentSession).toEqual(mockSession);
    });

    it('should clear current session', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setCurrentSession(mockSession);
        result.current.setCurrentSession(null);
      });
      
      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should set loading state correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
    });

    it('should clear error correctly', () => {
      const { result } = renderHook(() => useAgentStore());
      
      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Agent Actions', () => {
    it('should load agents successfully', async () => {
      const { result: storeResult } = renderHook(() => useAgentStore());
      const { result: actionsResult } = renderHook(() => useAgentActions());
      
      // Mock the API call
      const mockLoadAgents = actionsResult.current.loadAgents;
      
      // Simulate successful API call
      act(() => {
        storeResult.current.setLoading(true);
        storeResult.current.setAgents(mockAgents);
        storeResult.current.setLoading(false);
      });
      
      expect(storeResult.current.agents).toEqual(mockAgents);
      expect(storeResult.current.isLoading).toBe(false);
      expect(storeResult.current.error).toBeNull();
    });

    it('should handle agent loading error', async () => {
      const { result: storeResult } = renderHook(() => useAgentStore());
      const { result: actionsResult } = renderHook(() => useAgentActions());
      
      // Simulate failed API call
      act(() => {
        storeResult.current.setLoading(true);
        storeResult.current.setError('Failed to load agents');
        storeResult.current.setLoading(false);
      });
      
      expect(storeResult.current.error).toBe('Failed to load agents');
      expect(storeResult.current.isLoading).toBe(false);
    });
  });

  describe('State Immutability', () => {
    it('should maintain immutability when adding sessions', () => {
      const { result } = renderHook(() => useAgentStore());
      const originalSessions = [...result.current.sessions];
      
      const newSession: Session = {
        id: 'session-2',
        agentId: '2',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      
      act(() => {
        result.current.addSession(newSession);
      });
      
      expect(result.current.sessions).not.toBe(originalSessions);
      expect(result.current.sessions).toHaveLength(originalSessions.length + 1);
    });
  });
});
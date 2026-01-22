/**
 * Zustand Store Configuration
 * 
 * Global state management for the React application
 * 
 * @file src/store.ts
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import React from 'react';
import type { ReactNode } from 'react';

type StoreState = {
  sessions: any[];
  currentSessionId: string | null;
  events: any[];
  artifacts: any[];
  evaluations: any[];
  builderState: any;
  chatMessages: any[];
  traceData: any;
  loading: boolean;
  error: string | null;
  setSessions: (sessions: any[]) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  addSession: (session: any) => void;
  updateSession: (sessionId: string, updates: Partial<any>) => void;
  deleteSession: (sessionId: string) => void;
  setEvents: (events: any[]) => void;
  addEvent: (event: any) => void;
  setArtifacts: (artifacts: any[]) => void;
  addArtifact: (artifact: any) => void;
  setEvaluations: (evaluations: any[]) => void;
  addEvaluation: (evaluation: any) => void;
  setBuilderState: (state: any) => void;
  updateBuilderState: (updates: Partial<any>) => void;
  addChatMessage: (message: any) => void;
  setTraceData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const initialState: StoreState = {
  sessions: [],
  currentSessionId: null,
  events: [],
  artifacts: [],
  evaluations: [],
  builderState: {},
  chatMessages: [],
  traceData: null,
  loading: false,
  error: null,
  setSessions: () => {},
  setCurrentSessionId: () => {},
  addSession: () => {},
  updateSession: () => {},
  deleteSession: () => {},
  setEvents: () => {},
  addEvent: () => {},
  setArtifacts: () => {},
  addArtifact: () => {},
  setEvaluations: () => {},
  addEvaluation: () => {},
  setBuilderState: () => {},
  updateBuilderState: () => {},
  addChatMessage: () => {},
  setTraceData: () => {},
  setLoading: () => {},
  setError: () => {},
  clearError: () => {},
};

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Session management
        setSessions: (sessions) => set({ sessions }),
        setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
        addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
        updateSession: (sessionId, updates) => set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === sessionId ? { ...s, ...updates } : s
          )
        })),
        deleteSession: (sessionId) => set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId)
        })),
        
        // Event management
        setEvents: (events) => set({ events }),
        addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
        
        // Artifact management
        setArtifacts: (artifacts) => set({ artifacts }),
        addArtifact: (artifact) => set((state) => ({ artifacts: [...state.artifacts, artifact] })),
        
        // Evaluation management
        setEvaluations: (evaluations) => set({ evaluations }),
        addEvaluation: (evaluation) => set((state) => ({ evaluations: [...state.evaluations, evaluation] })),
        
        // Builder state management
        setBuilderState: (state) => set({ builderState: state }),
        updateBuilderState: (updates) => set((state) => ({
          builderState: { ...state.builderState, ...updates }
        })),
        
        // Chat management
        addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
        
        // Trace data management
        setTraceData: (data) => set({ traceData: data }),
        
        // Loading and error state
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'adk-web-storage',
        partialize: (state) => ({
          sessions: state.sessions,
          currentSessionId: state.currentSessionId,
          builderState: state.builderState,
        }),
      }
    )
  )
);

export const StoreProvider: React.FC<{ children: React.ReactNode; initialState?: Partial<StoreState> }> = (
  { children }
) => {
  return React.createElement(React.Fragment, null, children);
};

export default useStore;

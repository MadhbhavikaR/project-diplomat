import type { StateCreator } from 'zustand'
import type { Session } from '../types/session'

export interface SessionSlice {
  sessions: Session[]
  activeSessionId: string | null
  setSessions: (sessions: Session[]) => void
  setActiveSessionId: (sessionId: string | null) => void
}

export const createSessionSlice: StateCreator<SessionSlice, [], [], SessionSlice> = (set) => ({
  sessions: [],
  activeSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
})

export type SessionState = 'active' | 'paused' | 'completed' | 'error'

export interface Session {
  id: string
  name: string
  agentId: string
  createdAt: Date
  updatedAt: Date
  state: SessionState
  messageCount: number
}

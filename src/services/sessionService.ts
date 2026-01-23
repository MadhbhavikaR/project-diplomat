import type { Session } from '../types/session'
import { apiClient } from './apiClient'
import { getViteEnv } from '../utils/vite-env'

interface SessionListResponse {
  data: Session[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

class SessionService {
  async createSession(name: string, agentId: string): Promise<Session> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return {
        id: `session_${Math.random().toString(36).slice(2, 9)}`,
        name,
        agentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        state: 'active',
        messageCount: 0,
      }
    }

    return apiClient.post<Session>('/sessions', { name, agentId })
  }

  async listSessions(params?: {
    page?: number
    pageSize?: number
    agentId?: string
    state?: string
  }): Promise<{ items: Session[]; nextPageToken: string } > {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return {
        items: [],
        nextPageToken: '',
      }
    }

    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.agentId) search.set('agentId', params.agentId)
    if (params?.state) search.set('state', params.state)

    try {
      const response = await apiClient.get<SessionListResponse>(`/sessions?${search}`)
      return {
        items: response.data,
        nextPageToken: response.hasMore ? String(response.page + 1) : '',
      }
    } catch (error) {
      return {
        items: [],
        nextPageToken: '',
      }
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return
    }

    await apiClient.delete<void>(`/sessions/${sessionId}`)
  }

  async getSession(sessionId: string): Promise<Session> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return {
        id: sessionId,
        name: 'Local Session',
        agentId: 'agent-local',
        createdAt: new Date(),
        updatedAt: new Date(),
        state: 'active',
        messageCount: 0,
      }
    }

    return apiClient.get<Session>(`/sessions/${sessionId}`)
  }

  async canEdit(): Promise<boolean> {
    return true
  }
}

export const sessionService = new SessionService()
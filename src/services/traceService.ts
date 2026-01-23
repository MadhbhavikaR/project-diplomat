import { apiClient } from './apiClient'
import type { TraceNode } from '../types/trace'
import { getViteEnv } from '../utils/vite-env'

class TraceService {
  async listTraces(sessionId: string): Promise<TraceNode[]> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    return apiClient.get<TraceNode[]>(`/sessions/${sessionId}/traces`)
  }
}

export const traceService = new TraceService()

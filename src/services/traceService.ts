import { apiClient } from './apiClient'
import type { TraceNode } from '../types/trace'
import { getViteEnv } from '../utils/vite-env'
import { getRuntimeConfig } from '../utils/runtime-config-util'
import { loadDemoData } from '../utils/demo-data'

class TraceService {
  async listTraces(sessionId: string): Promise<TraceNode[]> {
    const env = getViteEnv()
    if (getRuntimeConfig().demoMode) {
      const demoTraces = await loadDemoData<Record<string, TraceNode[]>>('traces.json', {})
      return demoTraces[sessionId] ?? []
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    return apiClient.get<TraceNode[]>(`/sessions/${sessionId}/traces`)
  }
}

export const traceService = new TraceService()

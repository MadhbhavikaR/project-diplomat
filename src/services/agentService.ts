import type { Agent } from '../types/agent'
import { apiClient } from './apiClient'
import { getRuntimeConfig } from '../utils/runtime-config-util'
import { getViteEnv } from '../utils/vite-env'
import { loadDemoData } from '../utils/demo-data'

interface AgentListResponse {
  data: Agent[]
}

class AgentService {
  async listAgents(): Promise<Agent[]> {
    const env = getViteEnv()
    if (getRuntimeConfig().demoMode) {
      return loadDemoData<Agent[]>('agents.json', [])
    }

    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return []
    }

    const response = await apiClient.get<AgentListResponse>('/agents')
    return response.data
  }
}

export const agentService = new AgentService()

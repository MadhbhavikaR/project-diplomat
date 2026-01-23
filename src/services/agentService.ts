import type { Agent } from '../types/agent'
import { apiClient } from './apiClient'

interface AgentListResponse {
  data: Agent[]
}

class AgentService {
  async listAgents(): Promise<Agent[]> {
    const response = await apiClient.get<AgentListResponse>('/agents')
    return response.data
  }
}

export const agentService = new AgentService()

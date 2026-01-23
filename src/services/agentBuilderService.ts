import { apiClient } from './apiClient'
import type { AgentNode } from '../types/agentBuilder'
import { getViteEnv } from '../utils/vite-env'
import { getRuntimeConfig } from '../utils/runtime-config-util'

class AgentBuilderService {
  async loadConfig(agentId: string): Promise<AgentNode> {
    const env = getViteEnv()
    const { agentConfigApiBase } = getRuntimeConfig()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return {
        isRoot: true,
        name: agentId,
        agent_class: 'LlmAgent',
        instruction: '',
        sub_agents: [],
        tools: [],
        callbacks: [],
      }
    }

    return apiClient.get<AgentNode>(`${agentConfigApiBase}/${agentId}/config`)
  }

  async saveConfig(agentId: string, config: AgentNode): Promise<void> {
    const { agentConfigApiBase } = getRuntimeConfig()
    await apiClient.post(`${agentConfigApiBase}/${agentId}/config`, config)
  }
}

export const agentBuilderService = new AgentBuilderService()

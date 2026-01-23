import type { Tool } from './tool'

export type AgentType = 'chat' | 'code' | 'search' | 'custom'
export type AgentState = 'ready' | 'busy' | 'error' | 'disabled'

export interface AgentConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  streamingEnabled: boolean
}

export interface Agent {
  id: string
  name: string
  description: string
  icon: string
  type: AgentType
  tools: Tool[]
  systemPrompt?: string
  config: AgentConfig
  state: AgentState
}

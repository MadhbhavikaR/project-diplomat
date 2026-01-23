import type { StateCreator } from 'zustand'
import type { AgentNode, CallbackNode, ToolNode } from '../types/agentBuilder'

export interface BuilderSlice {
  agentConfig: AgentNode
  setAgentConfig: (config: AgentNode) => void
  addTool: (tool: ToolNode) => void
  removeTool: (name: string) => void
  renameTool: (oldName: string, newName: string) => void
  addCallback: (callback: CallbackNode) => void
  removeCallback: (name: string) => void
  renameCallback: (oldName: string, newName: string) => void
  addSubAgent: (agentClass: string, name?: string) => void
  removeSubAgent: (name: string) => void
  renameSubAgent: (oldName: string, newName: string) => void
}

const createDefaultConfig = (): AgentNode => ({
  isRoot: false,
  name: 'My Agent',
  agent_class: 'LlmAgent',
  model: 'gemini-2.5-flash',
  instruction: 'You are a helpful assistant.',
  description: 'A helpful AI agent',
  sub_agents: [],
  tools: [],
  callbacks: [],
})

export const createBuilderSlice: StateCreator<BuilderSlice, [], [], BuilderSlice> = (set) => ({
  agentConfig: createDefaultConfig(),
  setAgentConfig: (config) => set({ agentConfig: config }),
  addTool: (tool) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        tools: [...(state.agentConfig.tools || []), tool],
      },
    })),
  removeTool: (name) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        tools: (state.agentConfig.tools || []).filter((tool) => tool.name !== name),
      },
    })),
  renameTool: (oldName, newName) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        tools: (state.agentConfig.tools || []).map((tool) =>
          tool.name === oldName ? { ...tool, name: newName } : tool
        ),
      },
    })),
  addCallback: (callback) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        callbacks: [...(state.agentConfig.callbacks || []), callback],
      },
    })),
  removeCallback: (name) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        callbacks: (state.agentConfig.callbacks || []).filter((cb) => cb.name !== name),
      },
    })),
  renameCallback: (oldName, newName) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        callbacks: (state.agentConfig.callbacks || []).map((cb) =>
          cb.name === oldName ? { ...cb, name: newName } : cb
        ),
      },
    })),
  addSubAgent: (agentClass, name) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        sub_agents: [
          ...(state.agentConfig.sub_agents || []),
          {
            isRoot: false,
            name: name || `${agentClass}_${Date.now()}`,
            agent_class: agentClass,
            model: '',
            instruction: '',
            sub_agents: [],
            tools: [],
            callbacks: [],
          },
        ],
      },
    })),
  removeSubAgent: (name) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        sub_agents: (state.agentConfig.sub_agents || []).filter((agent) => agent.name !== name),
      },
    })),
  renameSubAgent: (oldName, newName) =>
    set((state) => ({
      agentConfig: {
        ...state.agentConfig,
        sub_agents: (state.agentConfig.sub_agents || []).map((agent) =>
          agent.name === oldName ? { ...agent, name: newName } : agent
        ),
      },
    })),
})

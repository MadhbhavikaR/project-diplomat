import { getViteEnv } from './vite-env'

export interface RuntimeConfig {
  apiUrl: string
  wsUrl: string
  repoApiBase: string
  agentConfigApiBase: string
  demoMode: boolean
}

export const getRuntimeConfig = (): RuntimeConfig => {
  const env = getViteEnv()
  return {
    apiUrl: (env.VITE_API_URL as string) || '/api/v1',
    wsUrl: (env.VITE_WS_URL as string) || 'ws://localhost:8080/ws',
    repoApiBase: (env.VITE_REPO_API_BASE as string) || '/repo',
    agentConfigApiBase: (env.VITE_AGENT_CONFIG_API_BASE as string) || '/agents',
    demoMode: env.VITE_DEMO_MODE === 'true',
  }
}

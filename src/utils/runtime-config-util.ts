import { getViteEnv } from './vite-env'

export interface RuntimeConfig {
  apiUrl: string
  wsUrl: string
}

export const getRuntimeConfig = (): RuntimeConfig => {
  const env = getViteEnv()
  return {
    apiUrl: (env.VITE_API_URL as string) || '/api/v1',
    wsUrl: (env.VITE_WS_URL as string) || 'ws://localhost:8080/ws',
  }
}

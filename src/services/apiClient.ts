import { getViteEnv } from '../utils/vite-env'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiClientConfig {
  baseUrl: string
  timeoutMs?: number
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.timeoutMs = config.timeoutMs ?? 30000
  }

  async request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed with status ${response.status}`)
      }

      if (response.status === 204) {
        return undefined as T
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeout)
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, 'GET')
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, 'POST', body)
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, 'DELETE')
  }
}

const env = getViteEnv()

export const apiClient = new ApiClient({
  baseUrl:
    (env.VITE_API_URL as string) ||
    (env.VITE_API_SERVER_DOMAIN as string) ||
    '/api/v1',
  timeoutMs: 30000,
})

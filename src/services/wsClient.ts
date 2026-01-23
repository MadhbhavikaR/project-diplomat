import { getViteEnv } from '../utils/vite-env'

export interface WsClientConfig {
  baseUrl: string
}

export class WsClient {
  private readonly baseUrl: string

  constructor(config: WsClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
  }

  connect(path: string): WebSocket {
    if (!this.baseUrl) {
      const noopSocket: WebSocket = {
        readyState: WebSocket.CLOSED,
        url: '',
        protocol: '',
        extensions: '',
        bufferedAmount: 0,
        binaryType: 'blob',
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
        close: () => undefined,
        send: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }
      return noopSocket
    }

    return new WebSocket(`${this.baseUrl}${path}`)
  }
}

const env = getViteEnv()

export const wsClient = new WsClient({
  baseUrl: (env.VITE_WS_URL as string) || '',
})

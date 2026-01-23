import { wsClient } from './wsClient'

export type MessageHandler = (message: MessageEvent) => void

class WebsocketService {
  connectToSession(sessionId: string, onMessage: MessageHandler): WebSocket {
    const socket = wsClient.connect(`/sessions/${sessionId}`)
    socket.onmessage = onMessage
    return socket
  }
}

export const websocketService = new WebsocketService()

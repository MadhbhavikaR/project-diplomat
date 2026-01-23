import { wsClient } from './wsClient'

export interface StreamMessagePayload {
  content: string
  role: 'user' | 'agent'
  sessionId: string
}

class StreamChatService {
  connect(sessionId: string, onMessage: (event: MessageEvent) => void): WebSocket {
    const socket = wsClient.connect(`/sessions/${sessionId}`)
    socket.onmessage = onMessage
    return socket
  }

  sendMessage(socket: WebSocket, payload: StreamMessagePayload): void {
    if (socket.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify(payload))
  }
}

export const streamChatService = new StreamChatService()

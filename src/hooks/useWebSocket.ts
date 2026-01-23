import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!url) {
      return
    }

    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      options.onOpen?.()
    }

    socket.onclose = () => {
      setIsConnected(false)
      options.onClose?.()
    }

    socket.onerror = (event) => {
      options.onError?.(event)
    }

    socket.onmessage = (event) => {
      options.onMessage?.(event)
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [url, options])

  const send = (payload: unknown) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false
    }

    socketRef.current.send(JSON.stringify(payload))
    return true
  }

  return { isConnected, send, socket: socketRef.current }
}

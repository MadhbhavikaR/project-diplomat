export type MessageRole = 'user' | 'agent' | 'system' | 'tool'

export interface MessagePart {
  type: 'text' | 'code' | 'image' | 'audio' | 'file'
  content: string
  metadata?: Record<string, unknown>
}

export interface MessageError {
  code: string
  message: string
  retryable: boolean
}

export interface Message {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  parts?: MessagePart[]
  timestamp: Date
  isStreaming: boolean
  error?: MessageError
}

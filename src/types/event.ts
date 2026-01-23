export type EventType =
  | 'message_sent'
  | 'message_received'
  | 'tool_call_start'
  | 'tool_call_end'
  | 'error'
  | 'state_change'

export type EventSeverity = 'debug' | 'info' | 'warning' | 'error'

export interface AgentEvent {
  id: string
  sessionId: string
  type: EventType
  severity: EventSeverity
  timestamp: Date
  summary: string
  payload: Record<string, unknown>
  durationMs?: number
}

export interface TraceNode {
  id: string
  name: string
  durationMs: number
  startTime: Date
  endTime: Date
  children?: TraceNode[]
  metadata?: Record<string, unknown>
}

export type ToolCategory = 'filesystem' | 'git' | 'web' | 'code' | 'data' | 'custom'

export type JsonSchema = Record<string, unknown>

export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  inputSchema: JsonSchema
  outputSchema?: JsonSchema
  requiresConfirmation: boolean
}

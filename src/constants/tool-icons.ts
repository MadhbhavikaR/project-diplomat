export const getToolIcon = (tool: any): string => {
  const type = tool?.toolType || tool?.type || ''
  const name = tool?.name || ''

  if (type === 'Built-in tool') return 'build'
  if (type === 'Function tool') return 'code'
  if (type === 'Agent tool') return 'hub'

  if (type === 'LlmAgent') return 'smart_toy'
  if (type === 'LoopAgent') return 'loop'
  if (type === 'ParallelAgent') return 'device_hub'
  if (type === 'SequentialAgent') return 'linear_scale'

  if (name.toLowerCase().includes('search')) return 'search'
  if (name.toLowerCase().includes('file')) return 'folder'

  return 'build'
}
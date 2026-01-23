import { useEffect, useMemo, useState } from 'react'
import type { TraceNode } from '../../types/trace'
import { traceService } from '../../services/traceService'
import './TraceTabComponent.css'

interface TraceTabProps {
  traceData: TraceNode[]
  sessionId?: string
}

const TraceTabComponent = ({ traceData, sessionId }: TraceTabProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [localTrace, setLocalTrace] = useState<TraceNode[]>(traceData)

  useEffect(() => {
    setLocalTrace(traceData)
  }, [traceData])

  useEffect(() => {
    const loadTrace = async () => {
      if (!sessionId || traceData.length > 0) {
        return
      }

      try {
        const response = await traceService.listTraces(sessionId)
        setLocalTrace(response)
      } catch (error) {
        console.error('Failed to load trace data', error)
      }
    }

    loadTrace()
  }, [sessionId, traceData.length])

  const maxDuration = useMemo(() => {
    const collectDurations = (nodes: TraceNode[]): number[] =>
      nodes.flatMap((node) => [node.durationMs, ...(node.children ? collectDurations(node.children) : [])])

    const durations = collectDurations(localTrace)
    return durations.length ? Math.max(...durations) : 0
  }, [localTrace])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const current = prev[nodeId] ?? true
      return { ...prev, [nodeId]: !current }
    })
  }

  const renderNode = (node: TraceNode, depth: number) => {
    const isExpanded = expandedNodes[node.id] ?? true
    const hasChildren = Boolean(node.children && node.children.length)
    const widthPercent = maxDuration ? Math.max(4, (node.durationMs / maxDuration) * 100) : 0

    return (
      <div key={node.id} className="trace-node" style={{ paddingLeft: depth * 16 }}>
        <div className="trace-node-row">
          {hasChildren && (
            <button
              className="trace-toggle"
              onClick={() => toggleNode(node.id)}
              aria-label={isExpanded ? 'Collapse trace node' : 'Expand trace node'}
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          )}
          {!hasChildren && <span className="trace-toggle-placeholder" />}
          <span
            className="trace-node-name"
            title={`Duration: ${node.durationMs}ms\n${JSON.stringify(node.metadata ?? {}, null, 2)}`}
          >
            {node.name}
          </span>
          <span className="trace-node-duration">{node.durationMs}ms</span>
        </div>
        <div className="trace-bar" title={`Duration: ${node.durationMs}ms`}>
          <div className="trace-bar-fill" style={{ width: `${widthPercent}%` }} />
        </div>
        {hasChildren && isExpanded && (
          <div className="trace-children">
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!localTrace.length) {
    return <div className="trace-empty">No trace data available.</div>
  }

  return <div className="trace-tab">{localTrace.map((node) => renderNode(node, 0))}</div>
}

export default TraceTabComponent

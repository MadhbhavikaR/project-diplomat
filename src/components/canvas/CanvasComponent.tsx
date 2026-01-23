import { useEffect, useMemo, useRef, useState } from 'react'
import './CanvasComponent.css'
import { useStore } from '../../store/store'

interface CanvasNode {
  id: string
  label: string
  type: 'agent' | 'tool' | 'callback'
  subtype?: string
  x: number
  y: number
  description: string
}

interface CanvasEdge {
  id: string
  from: string
  to: string
}

const CanvasComponent = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [edges, setEdges] = useState<CanvasEdge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [previewEdge, setPreviewEdge] = useState<{ x: number; y: number } | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [showToolTypeMenu, setShowToolTypeMenu] = useState(false)
  const [showCallbackMenu, setShowCallbackMenu] = useState(false)
  const [callbackPhase, setCallbackPhase] = useState<'before' | 'after'>('before')
  const [callbackScope, setCallbackScope] = useState<'agent' | 'model'>('agent')
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  const addToolToConfig = useStore(state => state.addTool)
  const addCallbackToConfig = useStore(state => state.addCallback)
  const addSubAgentToConfig = useStore(state => state.addSubAgent)
  const removeToolFromConfig = useStore(state => state.removeTool)
  const removeCallbackFromConfig = useStore(state => state.removeCallback)
  const removeSubAgentFromConfig = useStore(state => state.removeSubAgent)
  const renameToolInConfig = useStore(state => state.renameTool)
  const renameCallbackInConfig = useStore(state => state.renameCallback)
  const renameSubAgentInConfig = useStore(state => state.renameSubAgent)
  const selectedBuilderItem = useStore(state => state.selectedBuilderItem)
  const setSelectedBuilderItem = useStore(state => state.setSelectedBuilderItem)
  const isAssistantOpen = useStore(state => state.isAssistantOpen)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  const NODE_WIDTH = 190
  const NODE_HEIGHT = 84
  const GRID_SIZE = 16

  const toolTypeOptions = [
    {
      label: 'Function tool',
      description: 'Custom function tool with JSON schema inputs.',
    },
    {
      label: 'Built-in tool',
      description: 'Prebuilt tool provided by the platform.',
    },
    {
      label: 'Agent tool',
      description: 'Wrap another agent as a callable tool.',
    },
  ]

  const addNode = (type: CanvasNode['type'], subtype?: string, description?: string) => {
    const nextIndex = nodes.length + 1
    const id = `node-${nextIndex}`
    const labelBase = type === 'agent' ? 'Agent' : type === 'tool' ? 'Tool' : 'Callback'
    const label = subtype ? `${subtype} ${nextIndex}` : `${labelBase} ${nextIndex}`
    setNodes((prev) => [
      ...prev,
      {
        id,
        label,
        type,
        subtype,
        x: 40 + prev.length * 20,
        y: 40 + prev.length * 20,
        description: description || '',
      },
    ])

    if (type === 'tool') {
      addToolToConfig({ toolType: subtype || 'Built-in tool', name: label })
    }
    if (type === 'callback') {
      addCallbackToConfig({ type: subtype || 'before_agent', name: label })
    }
    if (type === 'agent') {
      addSubAgentToConfig('LlmAgent', label)
    }
  }

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    const node = nodes.find((item) => item.id === nodeId)
    if (node) {
      setSelectedBuilderItem({ type: node.type, name: node.label })
    }
    if (connectingFrom && connectingFrom !== nodeId) {
      connectNodes(connectingFrom, nodeId)
    }
  }

  const startEditing = (node: CanvasNode) => {
    setEditingNodeId(node.id)
    setEditingLabel(node.label)
    setEditingDescription(node.description)
  }

  const cancelEditing = () => {
    setEditingNodeId(null)
    setEditingLabel('')
    setEditingDescription('')
  }

  const saveEditing = () => {
    if (!editingNodeId) return
    let previousLabel = ''
    let nodeType: CanvasNode['type'] | null = null
    setNodes((prev) => {
      const target = prev.find((node) => node.id === editingNodeId)
      if (target) {
        previousLabel = target.label
        nodeType = target.type
      }
      return prev.map((node) =>
        node.id === editingNodeId
          ? { ...node, label: editingLabel.trim() || node.label, description: editingDescription }
          : node
      )
    })

    const nextLabel = editingLabel.trim()
    if (nodeType && previousLabel && nextLabel && previousLabel !== nextLabel) {
      if (nodeType === 'tool') {
        renameToolInConfig(previousLabel, nextLabel)
      }
      if (nodeType === 'callback') {
        renameCallbackInConfig(previousLabel, nextLabel)
      }
      if (nodeType === 'agent') {
        renameSubAgentInConfig(previousLabel, nextLabel)
      }
    }
    cancelEditing()
  }

  const canConnect = (fromType: CanvasNode['type'], toType: CanvasNode['type']) => {
    if (fromType === 'agent') {
      return true
    }

    if (fromType === 'tool') {
      return toType === 'callback'
    }

    if (fromType === 'callback') {
      return toType === 'agent'
    }

    return false
  }

  const connectNodes = (fromId: string, toId: string) => {
    const fromNode = nodes.find((node) => node.id === fromId)
    const toNode = nodes.find((node) => node.id === toId)
    if (!fromNode || !toNode) {
      setConnectingFrom(null)
      return
    }

    if (!canConnect(fromNode.type, toNode.type)) {
      setConnectingFrom(null)
      return
    }

    const id = `edge-${fromId}-${toId}-${Date.now()}`
    setEdges((prev) => [...prev, { id, from: fromId, to: toId }])
    setConnectingFrom(null)
  }

  const handleNodeLabelChange = (value: string) => {
    if (!selectedNodeId) return
    setNodes((prev) => prev.map((node) => (node.id === selectedNodeId ? { ...node, label: value } : node)))
  }

  const handleDeleteSelected = () => {
    if (!selectedNodeId) return
    const node = nodes.find((item) => item.id === selectedNodeId)
    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId))
    setEdges((prev) => prev.filter((edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId))
    setSelectedNodeId(null)
    setConnectingFrom(null)
    setSelectedBuilderItem(null)

    if (node) {
      if (node.type === 'tool') {
        removeToolFromConfig(node.label)
      }
      if (node.type === 'callback') {
        removeCallbackFromConfig(node.label)
      }
      if (node.type === 'agent') {
        removeSubAgentFromConfig(node.label)
      }
    }
  }

  const handleMouseDown = (event: React.MouseEvent, nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId)
    if (!node || !surfaceRef.current) return
    const rect = surfaceRef.current.getBoundingClientRect()
    const worldX = (event.clientX - rect.left - pan.x) / zoom
    const worldY = (event.clientY - rect.top - pan.y) / zoom
    dragRef.current = {
      id: nodeId,
      offsetX: worldX - node.x,
      offsetY: worldY - node.y,
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragRef.current || !surfaceRef.current) return
    const rect = surfaceRef.current.getBoundingClientRect()
    const { id, offsetX, offsetY } = dragRef.current
    const worldX = (event.clientX - rect.left - pan.x) / zoom
    const worldY = (event.clientY - rect.top - pan.y) / zoom
    const snappedX = Math.round((worldX - offsetX) / GRID_SIZE) * GRID_SIZE
    const snappedY = Math.round((worldY - offsetY) / GRID_SIZE) * GRID_SIZE
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, x: snappedX, y: snappedY } : node))
    )
  }

  const handleSurfaceMouseMove = (event: React.MouseEvent) => {
    if (!connectingFrom || !surfaceRef.current) {
      setPreviewEdge(null)
      return
    }

    const rect = surfaceRef.current.getBoundingClientRect()
    const worldX = (event.clientX - rect.left - pan.x) / zoom
    const worldY = (event.clientY - rect.top - pan.y) / zoom
    setPreviewEdge({
      x: worldX,
      y: worldY,
    })
  }

  const handleSurfaceMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 1 || !surfaceRef.current) {
      return
    }

    event.preventDefault()
    const rect = surfaceRef.current.getBoundingClientRect()
    panRef.current = {
      startX: event.clientX - rect.left,
      startY: event.clientY - rect.top,
      originX: pan.x,
      originY: pan.y,
    }
    setIsPanning(true)
  }

  const handleSurfacePanMove = (event: React.MouseEvent) => {
    if (!panRef.current || !surfaceRef.current) return
    const rect = surfaceRef.current.getBoundingClientRect()
    const currentX = event.clientX - rect.left
    const currentY = event.clientY - rect.top
    setPan({
      x: panRef.current.originX + (currentX - panRef.current.startX),
      y: panRef.current.originY + (currentY - panRef.current.startY),
    })
  }

  const handleSurfacePanEnd = () => {
    panRef.current = null
    setIsPanning(false)
  }
  const duplicateNode = (node: CanvasNode) => {
    const nextIndex = nodes.length + 1
    const id = `node-${nextIndex}`
    setNodes((prev) => [
      ...prev,
      {
        ...node,
        id,
        label: `${node.label} Copy`,
        x: node.x + 24,
        y: node.y + 24,
      },
    ])
  }


  const handleWheel = (event: React.WheelEvent) => {
    if (!surfaceRef.current) return
    event.preventDefault()
    const rect = surfaceRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const zoomDelta = event.deltaY > 0 ? -0.05 : 0.05
    const nextZoom = Math.min(1.6, Math.max(0.6, zoom + zoomDelta))
    const scale = nextZoom / zoom
    setZoom(nextZoom)
    setPan((prev) => ({
      x: mouseX - (mouseX - prev.x) * scale,
      y: mouseY - (mouseY - prev.y) * scale,
    }))
  }

  const handleSurfaceClick = () => {
    if (connectingFrom) {
      setConnectingFrom(null)
      setPreviewEdge(null)
    }
  }

  const handleMouseUp = () => {
    dragRef.current = null
  }

  const handleSelectToolType = (option: { label: string; description: string }) => {
    addNode('tool', option.label, option.description)
    setShowToolTypeMenu(false)
  }

  const callbackSubtype = `${callbackPhase}_${callbackScope}`
  const callbackDescription = `${callbackPhase === 'before' ? 'Before' : 'After'} ${callbackScope === 'agent' ? 'Agent' : 'Model'} callback.`

  const handleAddCallback = () => {
    addNode('callback', callbackSubtype, callbackDescription)
    setShowCallbackMenu(false)
  }

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  useEffect(() => {
    if (!selectedBuilderItem) return
    const match = nodes.find(
      (node) => node.type === selectedBuilderItem.type && node.label === selectedBuilderItem.name
    )
    if (match && match.id !== selectedNodeId) {
      setSelectedNodeId(match.id)
    }
  }, [nodes, selectedBuilderItem, selectedNodeId])

  const selectedNodeConnections = useMemo(() => {
    if (!selectedNodeId) {
      return { incoming: 0, outgoing: 0 }
    }

    const incoming = edges.filter((edge) => edge.to === selectedNodeId).length
    const outgoing = edges.filter((edge) => edge.from === selectedNodeId).length
    return { incoming, outgoing }
  }, [edges, selectedNodeId])

  const edgesWithCoords = useMemo(() => {
    const lookup = new Map(nodes.map((node) => [node.id, node]))
    return edges
      .map((edge) => {
        const from = lookup.get(edge.from)
        const to = lookup.get(edge.to)
        if (!from || !to) return null
        return {
          id: edge.id,
          fromId: edge.from,
          toId: edge.to,
          x1: from.x + NODE_WIDTH,
          y1: from.y + NODE_HEIGHT / 2,
          x2: to.x,
          y2: to.y + NODE_HEIGHT / 2,
        }
      })
      .filter((edge): edge is { id: string; fromId: string; toId: string; x1: number; y1: number; x2: number; y2: number } => Boolean(edge))
  }, [edges, nodes])

  const buildEdgePath = (edge: { x1: number; y1: number; x2: number; y2: number }) => {
    const delta = Math.max(40, Math.abs(edge.x2 - edge.x1) / 2)
    const cx1 = edge.x1 + delta
    const cy1 = edge.y1
    const cx2 = edge.x2 - delta
    const cy2 = edge.y2
    return `M ${edge.x1} ${edge.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.x2} ${edge.y2}`
  }

  const getEdgeLabel = (fromId: string, toId: string) => {
    const fromNode = nodes.find((node) => node.id === fromId)
    const toNode = nodes.find((node) => node.id === toId)
    if (!fromNode || !toNode) return ''
    return `${fromNode.type} → ${toNode.type}`
  }

  const handleEdgeContextMenu = (event: React.MouseEvent, edgeId: string) => {
    event.preventDefault()
    setSelectedEdgeId(edgeId)
    setEdgeContextMenu({ x: event.clientX, y: event.clientY })
  }

  const closeEdgeMenu = () => {
    setEdgeContextMenu(null)
  }

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return
    setEdges((prev) => prev.filter((edge) => edge.id !== selectedEdgeId))
    setSelectedEdgeId(null)
    closeEdgeMenu()
  }

  const getNodeIcon = (type: CanvasNode['type']) => {
    if (type === 'agent') return 'smart_toy'
    if (type === 'tool') return 'build'
    return 'bolt'
  }

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-actions">
          <button type="button" className="icon-button icon-only" onClick={() => addNode('agent')} aria-label="Add agent node" title="Add Agent">
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="sr-only">Add Agent</span>
          </button>
          <div className="canvas-toolbar-tool">
            <button
              type="button"
              className="icon-button icon-only"
              onClick={() => setShowToolTypeMenu((prev) => !prev)}
              aria-label="Add tool node"
              title="Add Tool"
            >
              <span className="material-symbols-outlined">build</span>
              <span className="sr-only">Add Tool</span>
            </button>
            {showToolTypeMenu && (
              <div className="canvas-tooltype-menu" role="menu">
                {toolTypeOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className="canvas-tooltype-option"
                    onClick={() => handleSelectToolType(option)}
                  >
                    <div className="canvas-tooltype-title">{option.label}</div>
                    <div className="canvas-tooltype-help">{option.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="canvas-toolbar-callback">
            <button
              type="button"
              className="icon-button icon-only"
              onClick={() => setShowCallbackMenu((prev) => !prev)}
              aria-label="Add callback node"
              title="Add Callback"
            >
              <span className="material-symbols-outlined">bolt</span>
              <span className="sr-only">Add Callback</span>
            </button>
            {showCallbackMenu && (
              <div className="canvas-callback-menu" role="menu">
                <div className="canvas-callback-row">
                  <label>
                    Phase
                    <select
                      value={callbackPhase}
                      onChange={(event) => setCallbackPhase(event.target.value as 'before' | 'after')}
                    >
                      <option value="before">Before</option>
                      <option value="after">After</option>
                    </select>
                  </label>
                  <label>
                    Scope
                    <select
                      value={callbackScope}
                      onChange={(event) => setCallbackScope(event.target.value as 'agent' | 'model')}
                    >
                      <option value="agent">Agent</option>
                      <option value="model">Model</option>
                    </select>
                  </label>
                </div>
                <div className="canvas-callback-preview">
                  {callbackPhase === 'before' ? 'Before' : 'After'} {callbackScope === 'agent' ? 'Agent' : 'Model'} Callback
                </div>
                <button
                  type="button"
                  className="canvas-callback-add"
                  onClick={handleAddCallback}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    add
                  </span>
                  Add callback
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="canvas-toolbar-edit">
          <span className="canvas-connection-hint">
            {connectingFrom ? 'Select a node to connect.' : 'Click a node to start connecting.'}
          </span>
          <button type="button" className="icon-button icon-only" onClick={handleDeleteSelected} disabled={!selectedNodeId} aria-label="Delete selected node" title="Delete Selected">
            <span className="material-symbols-outlined">delete</span>
            <span className="sr-only">Delete Selected</span>
          </button>
        </div>
      </div>
      <div className="canvas-hints">
        Tip: Drag nodes, use handles to connect, double-click to edit. Scroll to zoom, middle-mouse drag to pan.
      </div>

      <div
        className={`canvas-surface ${isPanning ? 'panning' : ''}`}
        ref={surfaceRef}
        onMouseMove={(event) => {
          handleMouseMove(event)
          handleSurfaceMouseMove(event)
          handleSurfacePanMove(event)
        }}
        onMouseDown={handleSurfaceMouseDown}
        onMouseUp={() => {
          handleMouseUp()
          handleSurfacePanEnd()
        }}
        onMouseLeave={() => {
          handleMouseUp()
          handleSurfacePanEnd()
        }}
        onClick={handleSurfaceClick}
        onWheel={handleWheel}
      >
        {nodes.length === 0 ? (
          <div className="canvas-empty">Add nodes to start building.</div>
        ) : (
          <div
            className="canvas-nodes"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <svg className="canvas-edges" aria-hidden>
              {connectingFrom && previewEdge && (() => {
                const fromNode = nodes.find((node) => node.id === connectingFrom)
                if (!fromNode) return null
                const previewPath = buildEdgePath({
                  x1: fromNode.x + NODE_WIDTH,
                  y1: fromNode.y + NODE_HEIGHT / 2,
                  x2: previewEdge.x,
                  y2: previewEdge.y,
                })
                return <path key="preview" d={previewPath} className="preview" />
              })()}
              {edgesWithCoords.map((edge) => (
                <g key={edge.id}>
                  <path
                    d={buildEdgePath(edge)}
                    className={selectedEdgeId === edge.id ? 'selected' : ''}
                    onClick={() => setSelectedEdgeId(edge.id)}
                    onContextMenu={(event) => handleEdgeContextMenu(event, edge.id)}
                  />
                  <text
                    className="canvas-edge-label"
                    x={(edge.x1 + edge.x2) / 2}
                    y={(edge.y1 + edge.y2) / 2 - 6}
                  >
                    {getEdgeLabel(edge.fromId, edge.toId)}
                  </text>
                </g>
              ))}
            </svg>
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`canvas-node ${node.type} ${selectedNodeId === node.id ? 'selected' : ''} ${connectingFrom ? 'connecting-active' : ''} ${connectingFrom === node.id ? 'connecting' : ''} ${connectingFrom && !canConnect(nodes.find((n) => n.id === connectingFrom)?.type || 'agent', node.type) ? 'disabled-connect' : ''}`}
                style={{ left: node.x, top: node.y }}
                onClick={() => handleNodeClick(node.id)}
                onMouseDown={(event) => handleMouseDown(event, node.id)}
                onDoubleClick={() => startEditing(node)}
                role="button"
              >
                <div
                  className="connection-handle incoming"
                  onClick={() => connectingFrom && connectNodes(connectingFrom, node.id)}
                />
                <div
                  className="connection-handle outgoing"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (selectedNodeId !== node.id) {
                      setSelectedNodeId(node.id)
                      return
                    }
                    setConnectingFrom(node.id)
                  }}
                />
                {editingNodeId === node.id ? (
                  <div className="canvas-node-editor" onClick={(event) => event.stopPropagation()}>
                    <input
                      value={editingLabel}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      placeholder="Name"
                    />
                    <textarea
                      rows={2}
                      value={editingDescription}
                      onChange={(event) => setEditingDescription(event.target.value)}
                      placeholder="Description"
                    />
                    <div className="canvas-node-editor-actions">
                      <button type="button" onClick={saveEditing}>Save</button>
                      <button type="button" onClick={cancelEditing}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="canvas-node-header">
                      <span className={`canvas-node-icon material-symbols-outlined ${node.type}`}>
                        {getNodeIcon(node.type)}
                      </span>
                      <div className="canvas-node-title">{node.label}</div>
                    </div>
                    {node.description && (
                      <div className="canvas-node-description">{node.description}</div>
                    )}
                    <div className="canvas-node-meta">{node.type}</div>
                    {node.subtype && (
                      <div className="canvas-node-subtype">{node.subtype}</div>
                    )}
                    <div className="canvas-node-actions">
                      <button
                        type="button"
                        className="canvas-node-action icon-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          duplicateNode(node)
                        }}
                        title="Duplicate"
                      >
                        <span className="material-symbols-outlined">content_copy</span>
                        <span className="sr-only">Duplicate</span>
                      </button>
                      <button
                        type="button"
                        className="canvas-node-action icon-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedNodeId(node.id)
                          handleDeleteSelected()
                        }}
                        title="Delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {selectedNode && (
          <div className={`canvas-inspector ${isAssistantOpen ? 'assistant-open' : ''}`}>
            <div className="canvas-inspector-title">Selected Node</div>
            <label>
              Name
              <input
                value={selectedNode.label}
                onChange={(event) => handleNodeLabelChange(event.target.value)}
              />
            </label>
            <div className="canvas-inspector-metrics">
              <div><strong>Type:</strong> {selectedNode.type}</div>
              {selectedNode.subtype && (
                <div><strong>Subtype:</strong> {selectedNode.subtype}</div>
              )}
              {selectedNode.description && (
                <div><strong>Description:</strong> {selectedNode.description}</div>
              )}
              <div><strong>Incoming:</strong> {selectedNodeConnections.incoming}</div>
              <div><strong>Outgoing:</strong> {selectedNodeConnections.outgoing}</div>
              <div><strong>Position:</strong> {Math.round(selectedNode.x)}, {Math.round(selectedNode.y)}</div>
            </div>
            <div className="canvas-inspector-meta">Type: {selectedNode.type}{selectedNode.subtype ? ` • ${selectedNode.subtype}` : ''}</div>
          </div>
        )}
      </div>
      {edgeContextMenu && (
        <div
          className="canvas-context-menu"
          style={{ top: edgeContextMenu.y, left: edgeContextMenu.x }}
          onMouseLeave={closeEdgeMenu}
          role="menu"
        >
          <button type="button" onClick={deleteSelectedEdge}>
            Delete link
          </button>
        </div>
      )}
    </div>
  )
}

export default CanvasComponent

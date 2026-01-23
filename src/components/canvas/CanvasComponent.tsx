import { useMemo, useState } from 'react'
import './CanvasComponent.css'

interface CanvasNode {
  id: string
  label: string
}

interface CanvasEdge {
  id: string
  from: string
  to: string
}

const CanvasComponent = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [edges, setEdges] = useState<CanvasEdge[]>([])
  const [selectedFrom, setSelectedFrom] = useState<string>('')
  const [selectedTo, setSelectedTo] = useState<string>('')

  const addNode = () => {
    const nextIndex = nodes.length + 1
    const id = `node-${nextIndex}`
    setNodes((prev) => [...prev, { id, label: `Node ${nextIndex}` }])
  }

  const connectNodes = () => {
    if (!selectedFrom || !selectedTo || selectedFrom === selectedTo) {
      return
    }

    const id = `edge-${selectedFrom}-${selectedTo}`
    setEdges((prev) => [...prev, { id, from: selectedFrom, to: selectedTo }])
    setSelectedFrom('')
    setSelectedTo('')
  }

  const nodeOptions = useMemo(
    () => nodes.map((node) => ({ value: node.id, label: node.label })),
    [nodes]
  )

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <button type="button" onClick={addNode} aria-label="Add node">
          Add Node
        </button>
        <div className="canvas-connector">
          <select
            aria-label="Select source node"
            value={selectedFrom}
            onChange={(event) => setSelectedFrom(event.target.value)}
          >
            <option value="">From</option>
            {nodeOptions.map((node) => (
              <option key={node.value} value={node.value}>{node.label}</option>
            ))}
          </select>
          <select
            aria-label="Select target node"
            value={selectedTo}
            onChange={(event) => setSelectedTo(event.target.value)}
          >
            <option value="">To</option>
            {nodeOptions.map((node) => (
              <option key={node.value} value={node.value}>{node.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={connectNodes}
            disabled={!selectedFrom || !selectedTo}
            aria-label="Connect nodes"
          >
            Connect
          </button>
        </div>
      </div>

      <div className="canvas-surface">
        {nodes.length === 0 ? (
          <div className="canvas-empty">Add nodes to start building.</div>
        ) : (
          <div className="canvas-nodes">
            {nodes.map((node) => (
              <div key={node.id} className="canvas-node">
                {node.label}
              </div>
            ))}
          </div>
        )}
        {edges.length > 0 && (
          <div className="canvas-edges">
            <h4>Connections</h4>
            {edges.map((edge) => (
              <div key={edge.id} className="canvas-edge">
                {edge.from} → {edge.to}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasComponent

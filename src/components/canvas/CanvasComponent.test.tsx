import { fireEvent, render, screen } from '@testing-library/react'
import CanvasComponent from './CanvasComponent'

describe('CanvasComponent', () => {
  it('adds a node when clicking Add Node', () => {
    render(<CanvasComponent />)

    fireEvent.click(screen.getByLabelText('Add node'))
    expect(screen.getByText('Node 1', { selector: '.canvas-node' })).toBeInTheDocument()
  })

  it('creates a connection between nodes', () => {
    render(<CanvasComponent />)

    fireEvent.click(screen.getByLabelText('Add node'))
    fireEvent.click(screen.getByLabelText('Add node'))

    fireEvent.change(screen.getByLabelText('Select source node'), { target: { value: 'node-1' } })
    fireEvent.change(screen.getByLabelText('Select target node'), { target: { value: 'node-2' } })

    fireEvent.click(screen.getByRole('button', { name: 'Connect nodes' }))

    expect(screen.getByText('node-1 → node-2', { selector: '.canvas-edge' })).toBeInTheDocument()
  })
})

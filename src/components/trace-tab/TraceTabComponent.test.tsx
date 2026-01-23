import { render, screen, fireEvent } from '@testing-library/react'
import TraceTabComponent from './TraceTabComponent'

const traceData = [
  {
    id: 'root',
    name: 'Root',
    durationMs: 120,
    startTime: new Date(),
    endTime: new Date(),
    children: [
      {
        id: 'child-1',
        name: 'Child',
        durationMs: 60,
        startTime: new Date(),
        endTime: new Date(),
        metadata: { step: 'child' },
      },
    ],
  },
]

describe('TraceTabComponent', () => {
  it('renders trace nodes', () => {
    render(<TraceTabComponent traceData={traceData} />)

    expect(screen.getByText('Root')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('collapses and expands child nodes', () => {
    render(<TraceTabComponent traceData={traceData} />)

    const toggle = screen.getByLabelText('Collapse trace node')
    fireEvent.click(toggle)

    expect(screen.queryByText('Child')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Expand trace node'))
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('shows empty state when no trace data', () => {
    render(<TraceTabComponent traceData={[]} />)

    expect(screen.getByText('No trace data available.')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import EventTabComponent from './EventTabComponent'
import { useStore } from '../../store/store'

// Mock the Zustand store
jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

describe('EventTabComponent', () => {
  const mockEvents = new Map([
    ['event1', { title: 'Event 1', payload: { key: 'value1' } }],
    ['event2', { title: 'Event 2', payload: { key: 'value2' }, graphSvg: '<svg><text>Graph</text></svg>' }],
  ])

  const mockTraceData = [
    {
      trace_id: 'trace1',
      start_time: 1000,
      end_time: 2000,
      attributes: {
        'gcp.vertex.agent.invocation_id': 'invoc1'
      }
    },
    {
      trace_id: 'trace2',
      start_time: 3000,
      end_time: 4000,
      attributes: {
        'gcp.vertex.agent.invocation_id': 'invoc2'
      }
    }
  ]

  const mockProps = {
    eventsMap: mockEvents,
    traceData: mockTraceData,
    onSelectedEvent: jest.fn(),
  }

  beforeEach(() => {
    // Mock the Zustand store
    ;(useStore as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        isSessionLoading: false,
        isEventRequestResponseLoading: false,
        isMessagesLoading: false,
        isLoadingAgentResponse: false,
        isUserFeedbackEnabled: true,
        isMessageFileUploadEnabled: true,
        isManualStateUpdateEnabled: true,
        isBidiStreamingEnabled: false,
        canEditSession: true,
        isTraceEnabled: true,
        currentSession: null,
        selectedEvent: null,
        uiState: {},
        setSessionLoading: jest.fn(),
        setEventRequestResponseLoading: jest.fn(),
        setMessagesLoading: jest.fn(),
        setLoadingAgentResponse: jest.fn(),
        setUserFeedbackEnabled: jest.fn(),
        setMessageFileUploadEnabled: jest.fn(),
        setManualStateUpdateEnabled: jest.fn(),
        setBidiStreamingEnabled: jest.fn(),
        setCanEditSession: jest.fn(),
        setTraceEnabled: jest.fn(),
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render events view by default', () => {
    render(<EventTabComponent {...mockProps} />)

    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
  })

  it('should render empty state when no events', () => {
    render(<EventTabComponent {...mockProps} eventsMap={new Map()} />)

    expect(screen.getByText('No conversations available')).toBeInTheDocument()
  })

  it('should switch to trace view when trace button is clicked', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))
    expect(screen.getByRole('button', { name: 'Trace' })).toHaveClass('active')
    expect(screen.getByText('Invocation: invoc1')).toBeInTheDocument()
  })

  it('should call onSelectedEvent when event is clicked', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByText('Event 1'))
    expect(mockProps.onSelectedEvent).toHaveBeenCalledWith('event1')
  })

  it('should toggle JSON view for an event', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getAllByText('View JSON')[0])
    expect(screen.getByText((content) => content.includes('"key": "value1"'))).toBeInTheDocument()
  })

  it('should render event graph when available', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByText('Event 2'))
    expect(screen.getByText('Event Graph')).toBeInTheDocument()
    expect(screen.getByText('Graph')).toBeInTheDocument()
  })

  it('should show event indices', () => {
    render(<EventTabComponent {...mockProps} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show trace indices in trace view', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show invocation IDs in trace view', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))
    expect(screen.getByText('Invocation: invoc1')).toBeInTheDocument()
    expect(screen.getByText('Invocation: invoc2')).toBeInTheDocument()
  })

  it('should not show trace toggle when isTraceEnabled is false', () => {
    ;(useStore as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        isSessionLoading: false,
        isEventRequestResponseLoading: false,
        isMessagesLoading: false,
        isLoadingAgentResponse: false,
        isUserFeedbackEnabled: true,
        isMessageFileUploadEnabled: true,
        isManualStateUpdateEnabled: true,
        isBidiStreamingEnabled: false,
        canEditSession: true,
        isTraceEnabled: false,
        currentSession: null,
        selectedEvent: null,
        uiState: {},
        setSessionLoading: jest.fn(),
        setEventRequestResponseLoading: jest.fn(),
        setMessagesLoading: jest.fn(),
        setLoadingAgentResponse: jest.fn(),
        setUserFeedbackEnabled: jest.fn(),
        setMessageFileUploadEnabled: jest.fn(),
        setManualStateUpdateEnabled: jest.fn(),
        setBidiStreamingEnabled: jest.fn(),
        setCanEditSession: jest.fn(),
        setTraceEnabled: jest.fn(),
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })

    render(<EventTabComponent {...mockProps} />)

    expect(screen.queryByRole('button', { name: 'Trace' })).not.toBeInTheDocument()
  })

  it('should not show trace view toggle when no trace data', () => {
    render(<EventTabComponent {...mockProps} traceData={[]} />)

    expect(screen.queryByRole('button', { name: 'Trace' })).not.toBeInTheDocument()
  })

  it('should group trace data by trace_id', () => {
    render(<EventTabComponent {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))

    // Should show 2 trace groups (trace1 and trace2)
    expect(screen.getByText('Invocation: invoc1')).toBeInTheDocument()
    expect(screen.getByText('Invocation: invoc2')).toBeInTheDocument()
  })

  it('should handle trace data without invocation_id', () => {
    const traceDataWithoutInvoc = [
      {
        trace_id: 'trace3',
        start_time: 5000,
        end_time: 6000,
        attributes: {}
      }
    ]

    render(<EventTabComponent {...mockProps} traceData={traceDataWithoutInvoc} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))
    expect(screen.getByText('Invocation: Unknown')).toBeInTheDocument()
  })

  it('should sort trace spans by start_time', () => {
    const unsortedTraceData = [
      {
        trace_id: 'trace1',
        start_time: 3000,
        end_time: 4000,
        attributes: { 'gcp.vertex.agent.invocation_id': 'invoc2' }
      },
      {
        trace_id: 'trace1',
        start_time: 1000,
        end_time: 2000,
        attributes: { 'gcp.vertex.agent.invocation_id': 'invoc1' }
      }
    ]

    render(<EventTabComponent {...mockProps} traceData={unsortedTraceData} />)

    fireEvent.click(screen.getByRole('button', { name: 'Trace' }))
    // Should show the earliest span's invocation_id
    expect(screen.getByText('Invocation: invoc1')).toBeInTheDocument()
  })
})
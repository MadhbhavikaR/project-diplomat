import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SidePanelComponent from './SidePanelComponent'
import { useStore } from '../../store/store'

// Mock the Zustand store
jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

describe('SidePanelComponent', () => {
  const mockProps = {
    appName: 'Test App',
    userId: 'user123',
    sessionId: 'session456',
    traceData: [],
    eventData: new Map(),
    currentSessionState: null,
    artifacts: [],
    selectedEventIndex: 0,
    renderedEventGraph: undefined,
    rawSvgString: null,
    llmRequest: null,
    llmResponse: null,
    showSidePanel: true,
    isApplicationSelectorEnabled: true,
    apps: ['App 1', 'App 2', 'App 3'],
    isLoadingApps: false,
    selectedApp: 'App 1',
    isBuilderMode: false,
    disableBuilderIcon: false,
    onClosePanel: jest.fn(),
    onAppSelectionChange: jest.fn(),
    onTabChange: jest.fn(),
    onEventSelected: jest.fn(),
    onSessionSelected: jest.fn(),
    onSessionReloaded: jest.fn(),
    onEvalCaseSelected: jest.fn(),
    onEvalSetIdSelected: jest.fn(),
    onReturnToSession: jest.fn(),
    onEvalNotInstalled: jest.fn(),
    onPageChange: jest.fn(),
    onCloseSelectedEvent: jest.fn(),
    onOpenImageDialog: jest.fn(),
    onOpenAddItemDialog: jest.fn(),
    onEnterBuilderMode: jest.fn(),
  }

  beforeEach(() => {
    // Mock the Zustand store
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        currentSession: null,
        selectedEvent: null,
        uiState: {},
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

  it('should render the side panel when showSidePanel is true', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Agent Development Kit')).toBeInTheDocument()
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Trace')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('State')).toBeInTheDocument()
    expect(screen.getByText('Artifacts')).toBeInTheDocument()
  })

  it('should not render the side panel when showSidePanel is false', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} showSidePanel={false} />
      </MemoryRouter>
    )

    expect(screen.queryByText('Agent Development Kit')).not.toBeInTheDocument()
  })

  it('should show loading spinner when session is loading', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: true,
        currentSession: null,
        selectedEvent: null,
        uiState: {},
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })

    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading session...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render app selector when isApplicationSelectorEnabled is true', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('Search agents...')).toBeInTheDocument()
    expect(screen.getByText('Select an agent')).toBeInTheDocument()
  })

  it('should not render app selector when isApplicationSelectorEnabled is false', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} isApplicationSelectorEnabled={false} />
      </MemoryRouter>
    )

    expect(screen.queryByPlaceholderText('Search agents...')).not.toBeInTheDocument()
  })

  it('should call onClosePanel when close button is clicked', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByTitle('Collapse panel'))
    expect(mockProps.onClosePanel).toHaveBeenCalledTimes(1)
  })

  it('should call onOpenAddItemDialog when add button is clicked', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByTitle('Create new agent'))
    expect(mockProps.onOpenAddItemDialog).toHaveBeenCalledWith(true)
  })

  it('should call onEnterBuilderMode when edit button is clicked and not disabled', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByTitle('Edit in Builder Mode'))
    expect(mockProps.onEnterBuilderMode).toHaveBeenCalledWith(true)
  })

  it('should not call onEnterBuilderMode when edit button is disabled', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} disableBuilderIcon={true} />
      </MemoryRouter>
    )

    const editButton = screen.getByTitle('This agent was not built by builder')
    expect(editButton).toHaveClass('disabled')
  })

  it('should render sessions tab content when activeTab is 0', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.getByText('App 2')).toBeInTheDocument()
  })

  it('should render empty state for trace tab when no trace data', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Trace'))
    expect(screen.getByText('No trace data available')).toBeInTheDocument()
  })

  it('should render empty state for events tab when no events', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Events'))
    expect(screen.getByText('No events available')).toBeInTheDocument()
  })

  it('should render empty state for state tab when no session state', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('State'))
    expect(screen.getByText('No state data available')).toBeInTheDocument()
  })

  it('should render empty state for artifacts tab when no artifacts', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Artifacts'))
    expect(screen.getByText('No artifacts available')).toBeInTheDocument()
  })

  it('should call onTabChange with correct index when tab is clicked', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Trace'))
    expect(mockProps.onTabChange).toHaveBeenCalledWith({ index: 1 })

    fireEvent.click(screen.getByText('Events'))
    expect(mockProps.onTabChange).toHaveBeenCalledWith({ index: 2 })
  })

  it('should filter apps based on search term', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText('Search agents...')
    fireEvent.change(searchInput, { target: { value: 'App 1' } })

    expect(screen.getByText('App 1')).toBeInTheDocument()
    expect(screen.queryByText('App 2')).not.toBeInTheDocument()
    expect(screen.queryByText('App 3')).not.toBeInTheDocument()
  })

  it('should show loading state for apps when isLoadingApps is true', () => {
    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} isLoadingApps={true} />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render event details panel when selectedEvent is provided', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        currentSession: null,
        selectedEvent: { id: 'event1', name: 'Test Event', data: { key: 'value' } },
        uiState: {},
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })

    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Event Details')).toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('should call onCloseSelectedEvent when event details close button is clicked', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        currentSession: null,
        selectedEvent: { id: 'event1', name: 'Test Event' },
        uiState: {},
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })

    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('×'))
    expect(mockProps.onCloseSelectedEvent).toHaveBeenCalledTimes(1)
  })

  it('should render state data when currentSessionState is provided', () => {
    const mockSessionState = { test: 'data', value: 123 }

    render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} currentSessionState={mockSessionState} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('State'))
    expect(screen.getByText(JSON.stringify(mockSessionState, null, 2))).toBeInTheDocument()
  })

  it('should navigate to correct routes when tabs are clicked', () => {
    const { container } = render(
      <MemoryRouter>
        <SidePanelComponent {...mockProps} />
      </MemoryRouter>
    )

    // Check initial route
    expect(container.innerHTML).toContain('/sessions')

    // Click different tabs and check navigation
    fireEvent.click(screen.getByText('Trace'))
    expect(container.innerHTML).toContain('/trace')

    fireEvent.click(screen.getByText('Events'))
    expect(container.innerHTML).toContain('/events')
  })
})
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SessionTabComponent from './SessionTabComponent'
import { useStore } from '../../store/store'

// Mock the Zustand store
function createMockStore() {
  return {
    sessions: [
      {
        id: 'session1',
        name: 'Test Session 1',
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        appName: 'ADK Demo',
        userId: 'user123'
      },
      {
        id: 'session2',
        name: 'Test Session 2',
        status: 'inactive',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        appName: 'ADK Demo',
        userId: 'user123'
      }
    ],
    activeSessionId: 'session1',
    setActiveSessionId: jest.fn(),
    reloadSession: jest.fn(),
    deleteSession: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn()
  }
}

// Mock the store hook
jest.mock('../../store/store', () => ({
  useStore: jest.fn()
}))

describe('SessionTabComponent', () => {
  const mockStore = createMockStore()
  const mockOnSessionSelected = jest.fn()
  const mockOnSessionReloaded = jest.fn()

  beforeEach(() => {
    (useStore as any).mockReturnValue(mockStore)
    mockOnSessionSelected.mockClear()
    mockOnSessionReloaded.mockClear()
    mockStore.setActiveSessionId.mockClear()
    mockStore.reloadSession.mockClear()
  })

  const renderComponent = () => {
    return render(
      <SessionTabComponent
        userId="user123"
        appName="ADK Demo"
        sessionId="session1"
        onSessionSelected={mockOnSessionSelected}
        onSessionReloaded={mockOnSessionReloaded}
      />
    )
  }

  it('renders session tab with sessions list', () => {
    renderComponent()

    // Check if the component renders
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Test Session 1')).toBeInTheDocument()
    expect(screen.getByText('Test Session 2')).toBeInTheDocument()
  })

  it('shows active session indicator', () => {
    renderComponent()

    // Check if active session is indicated
    const activeSession = screen.getByText('Test Session 1')
    expect(activeSession).toHaveClass('active')
  })

  it('calls onSessionSelected when session is clicked', () => {
    renderComponent()

    // Click on a session
    fireEvent.click(screen.getByText('Test Session 2'))

    // Verify callback is called
    expect(mockOnSessionSelected).toHaveBeenCalledWith(mockStore.sessions[1])
    expect(mockStore.setActiveSessionId).toHaveBeenCalledWith('session2')
  })

  it('calls reloadSession when reload button is clicked', () => {
    renderComponent()

    // Find and click reload button
    const reloadButtons = screen.getAllByText('Reload')
    fireEvent.click(reloadButtons[0])

    // Verify reload is called
    expect(mockStore.reloadSession).toHaveBeenCalledWith('session1')
    expect(mockOnSessionReloaded).toHaveBeenCalledWith(mockStore.sessions[0])
  })

  it('shows session details when session is selected', () => {
    renderComponent()

    // Click on a session to show details
    fireEvent.click(screen.getByText('Test Session 1'))

    // Check if session details are displayed
    expect(screen.getByText('Session ID:')).toBeInTheDocument()
    expect(screen.getByText('session1')).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('filters sessions by status', async () => {
    renderComponent()

    // Find and click filter button
    const filterButton = screen.getByText('Filter')
    fireEvent.click(filterButton)

    // Wait for filter menu to appear and select active status
    await waitFor(() => {
      const activeFilter = screen.getByText('Active')
      fireEvent.click(activeFilter)
    })

    // Check if only active sessions are shown
    expect(screen.getByText('Test Session 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Session 2')).not.toBeInTheDocument()
  })

  it('handles empty sessions list', () => {
    // Mock empty sessions
    (useStore as any).mockReturnValue({
      ...mockStore,
      sessions: []
    })

    renderComponent()

    // Check if empty state is shown
    expect(screen.getByText('No sessions found')).toBeInTheDocument()
    expect(screen.getByText('Create a new session to get started')).toBeInTheDocument()
  })

  it('shows loading state during session reload', async () => {
    // Mock reload to be async
    mockStore.reloadSession.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderComponent()

    // Click reload button
    const reloadButtons = screen.getAllByText('Reload')
    fireEvent.click(reloadButtons[0])

    // Check if loading indicator appears
    expect(screen.getByText('Reloading...')).toBeInTheDocument()

    // Wait for reload to complete
    await waitFor(() => {
      expect(screen.queryByText('Reloading...')).not.toBeInTheDocument()
    })
  })

  it('handles session selection errors', async () => {
    // Mock error in session selection
    mockStore.setActiveSessionId.mockImplementation(() => {
      throw new Error('Session selection failed')
    })

    renderComponent()

    // Click on a session
    fireEvent.click(screen.getByText('Test Session 2'))

    // Check if error is handled gracefully
    await waitFor(() => {
      expect(screen.getByText('Error selecting session')).toBeInTheDocument()
    })
  })
});
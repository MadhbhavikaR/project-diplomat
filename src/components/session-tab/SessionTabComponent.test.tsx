import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SessionTabComponent from './SessionTabComponent'
import { useStore } from '../../store/store'
import { sessionService } from '../../services/sessionService'

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

jest.mock('../../services/sessionService', () => ({
  sessionService: {
    listSessions: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
  },
}))

describe('SessionTabComponent', () => {
  const mockOnSessionSelected = jest.fn()
  const mockOnSessionReloaded = jest.fn()

  beforeEach(() => {
    ;(useStore as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        isSessionFilteringEnabled: true,
        isSessionListLoading: false,
        canEditSession: true,
        setSessionListLoading: jest.fn(),
        setSessions: jest.fn(),
        setActiveSessionId: jest.fn(),
      }

      return selector ? selector(state) : state
    })

    ;(sessionService.listSessions as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'session1',
          name: 'Test Session 1',
          agentId: 'agent-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          state: 'active',
          messageCount: 1,
        },
        {
          id: 'session2',
          name: 'Test Session 2',
          agentId: 'agent-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          state: 'active',
          messageCount: 2,
        },
      ],
      nextPageToken: '',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = () =>
    render(
      <SessionTabComponent
        userId="user123"
        appName="ADK Demo"
        sessionId="session1"
        onSessionSelected={mockOnSessionSelected}
        onSessionReloaded={mockOnSessionReloaded}
      />
    )

  it('renders sessions after loading', async () => {
    renderComponent()

    expect(await screen.findByText('Test Session 1')).toBeInTheDocument()
    expect(screen.getByText('Test Session 2')).toBeInTheDocument()
  })

  it('calls onSessionSelected when session is clicked', async () => {
    renderComponent()

    const sessionRow = await screen.findByText('Test Session 2')
    fireEvent.click(sessionRow)

    expect(mockOnSessionSelected).toHaveBeenCalled()
  })

  it('shows empty state when no sessions are returned', async () => {
    ;(sessionService.listSessions as jest.Mock).mockResolvedValueOnce({
      items: [],
      nextPageToken: '',
    })

    renderComponent()

    expect(await screen.findByText('No sessions found')).toBeInTheDocument()
  })

  it('creates a new session when create button is clicked', async () => {
    ;(sessionService.createSession as jest.Mock).mockResolvedValue({
      id: 'new-session',
      name: 'New Session',
      agentId: 'agent-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      state: 'active',
      messageCount: 0,
    })

    renderComponent()

    fireEvent.change(screen.getByPlaceholderText('New session name'), {
      target: { value: 'New Session' },
    })
    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(sessionService.createSession).toHaveBeenCalled()
    })
  })

  it('deletes a session after confirmation', async () => {
    renderComponent()

    const deleteButtons = await screen.findAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    const confirmButtons = await screen.findAllByText('Delete')
    fireEvent.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => {
      expect(sessionService.deleteSession).toHaveBeenCalled()
    })
  })
})
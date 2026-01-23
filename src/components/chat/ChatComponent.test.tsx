import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import ChatComponent from './ChatComponent'
import { streamChatService } from '../../services/streamChatService'
import { useStore } from '../../store/store'

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

jest.mock('../../services/streamChatService', () => ({
  streamChatService: {
    connect: jest.fn(() => ({
      readyState: 1,
      send: jest.fn(),
      close: jest.fn(),
      onmessage: null,
    })),
    sendMessage: jest.fn(),
  },
}))

describe('ChatComponent', () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <ChatComponent />
      </MemoryRouter>
    )

  beforeEach(() => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        isMessagesLoading: false,
        isLoadingAgentResponse: false,
        isUserFeedbackEnabled: true,
        isMessageFileUploadEnabled: true,
        isManualStateUpdateEnabled: true,
        isBidiStreamingEnabled: false,
        canEditSession: true,
        currentSession: null,
        selectedEvent: null,
        uiState: {},
        setSessionLoading: jest.fn(),
        setMessagesLoading: jest.fn(),
        setLoadingAgentResponse: jest.fn(),
        setUserFeedbackEnabled: jest.fn(),
        setMessageFileUploadEnabled: jest.fn(),
        setManualStateUpdateEnabled: jest.fn(),
        setBidiStreamingEnabled: jest.fn(),
        setCanEditSession: jest.fn(),
        setCurrentSession: jest.fn(),
        setSelectedEvent: jest.fn(),
        setUiState: jest.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  it('renders chat component with input and send button', () => {
    renderWithRouter()
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('allows typing in the input field', () => {
    renderWithRouter()
    const input = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement
    
    fireEvent.change(input, { target: { value: 'Hello, world!' } })
    expect(input.value).toBe('Hello, world!')
  })

  it('sends message through stream service when available', () => {
    renderWithRouter()
    const input = screen.getByPlaceholderText('Type your message...')
    const button = screen.getByText('Send')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(button)
    
    expect(streamChatService.sendMessage).toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    renderWithRouter()
    const button = screen.getByText('Send')
    
    expect(button).toBeDisabled()
  })
})
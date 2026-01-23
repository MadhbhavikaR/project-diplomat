import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatPanelComponent from './ChatPanelComponent'
import { useStore } from '../../store/store'

// Mock the Zustand store
jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

describe('ChatPanelComponent', () => {
  const mockProps = {
    appName: 'Test App',
    sessionName: 'Test Session',
    messages: [
      { role: 'user', content: 'Hello', id: '1' },
      { role: 'bot', content: 'Hi there!', id: '2', eventId: 'event1' },
    ],
    isChatMode: true,
    evalCase: null,
    isEvalEditMode: false,
    isEvalCaseEditing: false,
    isEditFunctionArgsEnabled: false,
    userInput: '',
    userEditEvalCaseMessage: '',
    selectedFiles: [],
    updatedSessionState: null,
    eventData: new Map([['event1', { agentName: 'TestAgent' }]]),
    isAudioRecording: false,
    isVideoRecording: false,
    hoveredEventMessageIndices: [],
    
    onUserInputChange: jest.fn(),
    onUserEditEvalCaseMessageChange: jest.fn(),
    onClickEvent: jest.fn(),
    onHandleKeydown: jest.fn(),
    onCancelEditMessage: jest.fn(),
    onSaveEditMessage: jest.fn(),
    onOpenViewImageDialog: jest.fn(),
    onOpenBase64InNewTab: jest.fn(),
    onEditEvalCaseMessage: jest.fn(),
    onDeleteEvalCaseMessage: jest.fn(),
    onEditFunctionArgs: jest.fn(),
    onFileSelect: jest.fn(),
    onRemoveFile: jest.fn(),
    onRemoveStateUpdate: jest.fn(),
    onSendMessage: jest.fn(),
    onUpdateState: jest.fn(),
    onToggleAudioRecording: jest.fn(),
    onToggleVideoRecording: jest.fn(),
    onFeedback: jest.fn(),
  }

  beforeEach(() => {
    // Mock the Zustand store
    ;(useStore as jest.Mock).mockImplementation((selector: any) => {
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the chat panel when appName is provided', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('should not render the chat panel when appName is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} appName="" />
      </MemoryRouter>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should show loading spinner when session is loading', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: true,
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

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading session...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render user and bot messages with correct styling', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const userMessage = screen.getByText('Hello').closest('.user-message')
    const botMessage = screen.getByText('Hi there!').closest('.bot-message')

    expect(userMessage).toBeInTheDocument()
    expect(botMessage).toBeInTheDocument()
  })

  it('should render agent icon for bot messages with event data', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const agentIcon = screen.getByText('🤖')
    expect(agentIcon).toBeInTheDocument()
    expect(agentIcon).toHaveAttribute('title', 'TestAgent')
  })

  it('should call onClickEvent when agent icon is clicked', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('🤖'))
    expect(mockProps.onClickEvent).toHaveBeenCalledWith(1)
  })

  it('should call onUserInputChange when textarea value changes', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(textarea, { target: { value: 'New message' } })

    expect(mockProps.onUserInputChange).toHaveBeenCalledWith('New message')
  })

  it('should show read-only banner and disable input when cannot edit session', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        isMessagesLoading: false,
        isLoadingAgentResponse: false,
        isUserFeedbackEnabled: true,
        isMessageFileUploadEnabled: true,
        isManualStateUpdateEnabled: true,
        isBidiStreamingEnabled: false,
        canEditSession: false,
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

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} userInput="Test" />
      </MemoryRouter>
    )

    expect(screen.getByText('Read-only session')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled()
    expect(screen.getByText('Send')).toBeDisabled()
  })

  it('should call onSendMessage when send button is clicked', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} userInput="Test message" />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Send'))
    expect(mockProps.onSendMessage).toHaveBeenCalled()
  })

  it('should disable send button when input is empty', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} userInput="" />
      </MemoryRouter>
    )

    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  it('should disable send button when isLoadingAgentResponse is true', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        isMessagesLoading: false,
        isLoadingAgentResponse: true,
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

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} userInput="Test message" />
      </MemoryRouter>
    )

    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  it('should render feedback buttons when isUserFeedbackEnabled is true', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('👎')).toBeInTheDocument()
  })

  it('should call onFeedback when feedback buttons are clicked', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('👍'))
    expect(mockProps.onFeedback).toHaveBeenCalledWith('up')

    fireEvent.click(screen.getByText('👎'))
    expect(mockProps.onFeedback).toHaveBeenCalledWith('down')
  })

  it('should render file upload section when isMessageFileUploadEnabled is true', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Upload files')).toBeInTheDocument()
  })

  it('should call onFileSelect when file input changes', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const fileInput = screen.getByLabelText('Upload files')
    const mockEvent = { target: { files: ['file1.txt', 'file2.txt'] } }
    fireEvent.change(fileInput, mockEvent)

    expect(mockProps.onFileSelect).toHaveBeenCalled()
  })

  it('should render selected files', () => {
    const mockFiles = [
      { file: { name: 'file1.txt' } as unknown as File, url: 'url1' },
      { file: { name: 'file2.txt' } as unknown as File, url: 'url2' },
    ]

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} selectedFiles={mockFiles} />
      </MemoryRouter>
    )

    expect(screen.getByText('file1.txt')).toBeInTheDocument()
    expect(screen.getByText('file2.txt')).toBeInTheDocument()
  })

  it('should call onRemoveFile when remove file button is clicked', () => {
    const mockFiles = [
      { file: { name: 'file1.txt' } as unknown as File, url: 'url1' },
    ]

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} selectedFiles={mockFiles} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByLabelText('Remove file'))
    expect(mockProps.onRemoveFile).toHaveBeenCalledWith(0)
  })

  it('should render state update section when updatedSessionState is provided', () => {
    const mockState = { test: 'data', value: 123 }

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} updatedSessionState={mockState} />
      </MemoryRouter>
    )

    expect(screen.getByText('Session State Update')).toBeInTheDocument()
    expect(screen.getByText('Update State')).toBeInTheDocument()
  })

  it('should call onRemoveStateUpdate when close button is clicked', () => {
    const mockState = { test: 'data' }

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} updatedSessionState={mockState} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByLabelText('Close state update'))
    expect(mockProps.onRemoveStateUpdate).toHaveBeenCalled()
  })

  it('should call onUpdateState when update state button is clicked', () => {
    const mockState = { test: 'data' }

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} updatedSessionState={mockState} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Update State'))
    expect(mockProps.onUpdateState).toHaveBeenCalled()
  })

  it('should show messages loading indicator when isMessagesLoading is true', () => {
    ;(useStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        isSessionLoading: false,
        isMessagesLoading: true,
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

    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByTestId('messages-loading')).toBeInTheDocument()
  })

  it('should handle Enter key press for sending messages', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(mockProps.onHandleKeydown).toHaveBeenCalled()
  })

  it('should not send message on Shift+Enter', () => {
    render(
      <MemoryRouter>
        <ChatPanelComponent {...mockProps} />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true })

    expect(mockProps.onHandleKeydown).not.toHaveBeenCalled()
  })
})
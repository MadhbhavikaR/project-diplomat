import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import './ChatPanelComponent.css'

// Define TypeScript interfaces for component props
interface ChatPanelProps {
  appName: string
  sessionName: string
  messages: any[]
  isChatMode: boolean
  evalCase: any | null
  isEvalEditMode: boolean
  isEvalCaseEditing: boolean
  isEditFunctionArgsEnabled: boolean
  userInput: string
  userEditEvalCaseMessage: string
  selectedFiles: {file: File; url: string}[]
  updatedSessionState: any | null
  eventData: Map<string, any>
  isAudioRecording: boolean
  isVideoRecording: boolean
  hoveredEventMessageIndices: number[]
  
  onUserInputChange: (input: string) => void
  onUserEditEvalCaseMessageChange: (message: string) => void
  onClickEvent: (index: number) => void
  onHandleKeydown: (event: {event: KeyboardEvent, message: any}) => void
  onCancelEditMessage: (message: any) => void
  onSaveEditMessage: (message: any) => void
  onOpenViewImageDialog: (imageUrl: string) => void
  onOpenBase64InNewTab: (data: {data: string, mimeType: string}) => void
  onEditEvalCaseMessage: (message: any) => void
  onDeleteEvalCaseMessage: (params: {message: any, index: number}) => void
  onEditFunctionArgs: (args: any) => void
  onFileSelect: (event: Event) => void
  onRemoveFile: (index: number) => void
  onRemoveStateUpdate: () => void
  onSendMessage: (event: Event) => void
  onUpdateState: () => void
  onToggleAudioRecording: () => void
  onToggleVideoRecording: () => void
  onFeedback: (direction: 'up' | 'down') => void
}

const ChatPanelComponent: React.FC<ChatPanelProps> = ({
  appName,
  sessionName,
  messages,
  isChatMode,
  evalCase,
  isEvalEditMode,
  isEvalCaseEditing,
  isEditFunctionArgsEnabled,
  userInput,
  userEditEvalCaseMessage,
  selectedFiles,
  updatedSessionState,
  eventData,
  isAudioRecording,
  isVideoRecording,
  hoveredEventMessageIndices,
  
  onUserInputChange,
  onUserEditEvalCaseMessageChange,
  onClickEvent,
  onHandleKeydown,
  onCancelEditMessage,
  onSaveEditMessage,
  onOpenViewImageDialog,
  onOpenBase64InNewTab,
  onEditEvalCaseMessage,
  onDeleteEvalCaseMessage,
  onEditFunctionArgs,
  onFileSelect,
  onRemoveFile,
  onRemoveStateUpdate,
  onSendMessage,
  onUpdateState,
  onToggleAudioRecording,
  onToggleVideoRecording,
  onFeedback,
}) => {
  const [scrollInterrupted, setScrollInterrupted] = useState(false)
  const [previousMessageCount, setPreviousMessageCount] = useState(0)
  const [nextPageToken, setNextPageToken] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Access Zustand store
  const isSessionLoading = useStore(state => state.isSessionLoading)
  const isMessagesLoading = useStore(state => state.isMessagesLoading)
  const isLoadingAgentResponse = useStore(state => state.isLoadingAgentResponse)
  const isUserFeedbackEnabled = useStore(state => state.isUserFeedbackEnabled)
  const isMessageFileUploadEnabled = useStore(state => state.isMessageFileUploadEnabled)
  const isManualStateUpdateEnabled = useStore(state => state.isManualStateUpdateEnabled)
  const isBidiStreamingEnabled = useStore(state => state.isBidiStreamingEnabled)
  const canEditSession = useStore(state => state.canEditSession)

  const navigate = useNavigate()

  // Handle scroll behavior
  useEffect(() => {
    if (!scrollInterrupted && messages.length > previousMessageCount) {
      scrollToBottom()
    }
    setPreviousMessageCount(messages.length)
  }, [messages, scrollInterrupted])

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight
    setScrollInterrupted(!isAtBottom)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUserInputChange(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onHandleKeydown({event: event.nativeEvent, message: null})
    }
  }

  const getAgentNameFromEvent = (index: number): string => {
    const message = messages[index]
    if (message?.eventId && eventData.has(message.eventId)) {
      const event = eventData.get(message.eventId)
      return event?.agentName || 'Agent'
    }
    return ''
  }

  const customIconColorClass = (index: number): string => {
    const agentName = getAgentNameFromEvent(index)
    if (!agentName) return ''
    
    // Simple hash-based color generation
    let hash = 0
    for (let i = 0; i < agentName.length; i++) {
      hash = agentName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const colors = ['agent-icon-red', 'agent-icon-blue', 'agent-icon-green', 'agent-icon-yellow', 'agent-icon-purple']
    return colors[Math.abs(hash) % colors.length]
  }

  const shouldMessageHighlighted = (index: number): boolean => {
    return hoveredEventMessageIndices.includes(index)
  }

  if (isSessionLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    )
  }

  if (!appName) {
    return null
  }

  return (
    <div className="chat-panel">
      <div
        ref={scrollContainerRef}
        className="chat-messages"
        onScroll={handleScroll}
      >
        {isMessagesLoading && (
          <div className="messages-loading-container">
            <div className="progress-bar"></div>
          </div>
        )}
        
        <div ref={videoContainerRef} className="video-container"></div>

        {messages.map((message, index) => (
          <div key={index} className="message-column-container">
            <div
              className={
                message.role === 'user' ? 'user-message' : 'bot-message'
              }
            >
              {message.role === 'bot' && (
                <button
                  className={
                    `agent-icon-button ${customIconColorClass(index)}` +
                    (getAgentNameFromEvent(index) ? '' : ' hidden')
                  }
                  onClick={() => onClickEvent(index)}
                  disabled={!message.eventId}
                  title={getAgentNameFromEvent(index)}
                >
                  🤖
                </button>
              )}

              {!message.functionCall && !message.functionResponse && (
                <div
                  className={
                    `message-card` +
                    (message.evalStatus === 2 ? ' eval-fail' : '') +
                    (shouldMessageHighlighted(index) ? ' message-card--highlighted' : '')
                  }
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  
                  {message.role === 'bot' && isUserFeedbackEnabled && (
                    <div className="feedback-buttons">
                      <button
                        className="feedback-button up"
                        onClick={() => onFeedback('up')}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        className="feedback-button down"
                        onClick={() => onFeedback('down')}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="chat-input-container">
        {isMessageFileUploadEnabled && (
          <div className="file-upload-section">
            <input
              type="file"
              onChange={(e) => onFileSelect(e.nativeEvent)}
              multiple
              className="file-input"
            />
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.file.name}</span>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="remove-file-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="input-area">
          <textarea
            ref={textareaRef}
            className="message-textarea"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoadingAgentResponse}
          />
          
          <button
            className="send-button"
            onClick={(e) => onSendMessage(e.nativeEvent)}
            disabled={isLoadingAgentResponse || !userInput.trim()}
          >
            Send
          </button>
        </div>

        {isManualStateUpdateEnabled && updatedSessionState && (
          <div className="state-update-section">
            <div className="state-update-header">
              <h4>Session State Update</h4>
              <button
                onClick={onRemoveStateUpdate}
                className="close-state-update"
              >
                ×
              </button>
            </div>
            <div className="state-update-content">
              <pre>{JSON.stringify(updatedSessionState, null, 2)}</pre>
            </div>
            <button
              onClick={onUpdateState}
              className="update-state-button"
            >
              Update State
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPanelComponent
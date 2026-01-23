import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../store/store'
import { streamChatService } from '../../services/streamChatService'
import ChatPanelComponent from '../chat-panel/ChatPanelComponent'

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [sessionId] = useState('session_' + Math.random().toString(36).substr(2, 9))
  const [appName] = useState('ADK Demo')
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 6))

  const setSessionLoading = useStore(state => state.setSessionLoading)
  const setMessagesLoading = useStore(state => state.setMessagesLoading)
  const setLoadingAgentResponse = useStore(state => state.setLoadingAgentResponse)

  useEffect(() => {
    // Initialize session
    setSessionLoading(true)
    // Simulate session loading
    setTimeout(() => {
      setSessionLoading(false)
      setMessages([
        {role: 'bot', content: 'Welcome to ADK Demo! How can I help you today?'}
      ])
    }, 500)
  }, [setSessionLoading])

  useEffect(() => {
    const ws = streamChatService.connect(sessionId, (event) => {
      try {
        const payload = JSON.parse(event.data) as { role?: string; content?: string }
        if (payload.content) {
          setMessages(prev => [...prev, { role: (payload.role as 'user' | 'bot') || 'bot', content: payload.content }])
        }
      } catch {
        // Ignore malformed payloads
      }
    })

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [sessionId])

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return

    // Add user message
    setMessages(prev => [...prev, {role: 'user', content: inputValue}])
    setInputValue('')
    setIsLoading(true)
    setMessagesLoading(true)
    setLoadingAgentResponse(true)

    if (socket && socket.readyState === WebSocket.OPEN) {
      streamChatService.sendMessage(socket, {
        content: inputValue,
        role: 'user',
        sessionId,
      })
      setIsLoading(false)
      setMessagesLoading(false)
      setLoadingAgentResponse(false)
      return
    }

    // Fallback: simulate API call with session context
    setTimeout(() => {
      const botResponse = `Response to: ${inputValue}\n\nSession: ${sessionId}\nApp: ${appName}\nUser: ${userId}`
      setMessages(prev => [...prev, {role: 'bot', content: botResponse}])
      setIsLoading(false)
      setMessagesLoading(false)
      setLoadingAgentResponse(false)
    }, 1000)
  }

  const eventData = useMemo(() => new Map(), [])

  return (
    <ChatPanelComponent
      appName={appName}
      sessionName={sessionId}
      messages={messages}
      isChatMode={true}
      evalCase={null}
      isEvalEditMode={false}
      isEvalCaseEditing={false}
      isEditFunctionArgsEnabled={false}
      userInput={inputValue}
      userEditEvalCaseMessage=""
      selectedFiles={[]}
      updatedSessionState={null}
      eventData={eventData}
      isAudioRecording={false}
      isVideoRecording={false}
      hoveredEventMessageIndices={[]}
      onUserInputChange={setInputValue}
      onUserEditEvalCaseMessageChange={() => undefined}
      onClickEvent={() => undefined}
      onHandleKeydown={(payload) => handleSendMessage()}
      onCancelEditMessage={() => undefined}
      onSaveEditMessage={() => undefined}
      onOpenViewImageDialog={() => undefined}
      onOpenBase64InNewTab={() => undefined}
      onEditEvalCaseMessage={() => undefined}
      onDeleteEvalCaseMessage={() => undefined}
      onEditFunctionArgs={() => undefined}
      onFileSelect={() => undefined}
      onRemoveFile={() => undefined}
      onRemoveStateUpdate={() => undefined}
      onSendMessage={(event) => {
        event?.preventDefault?.()
        handleSendMessage()
      }}
      onUpdateState={() => undefined}
      onToggleAudioRecording={() => undefined}
      onToggleVideoRecording={() => undefined}
      onFeedback={() => undefined}
    />
  )
}

export default ChatComponent
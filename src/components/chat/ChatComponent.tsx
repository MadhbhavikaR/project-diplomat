import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from '../../store/store'
import { streamChatService } from '../../services/streamChatService'
import { getRuntimeConfig } from '../../utils/runtime-config-util'
import { loadDemoComponentData, loadDemoComponentSequence } from '../../utils/demo-data'
import ChatPanelComponent from '../chat-panel/ChatPanelComponent'

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [demoResponses, setDemoResponses] = useState<{ role: 'user' | 'bot'; content: string }[]>([])
  const [demoResponseIndex, setDemoResponseIndex] = useState(0)
  const [sessionId] = useState('session_' + Math.random().toString(36).substr(2, 9))
  const [appName] = useState('ADK Demo')
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 6))

  const setSessionLoading = useStore(state => state.setSessionLoading)
  const setMessagesLoading = useStore(state => state.setMessagesLoading)
  const setLoadingAgentResponse = useStore(state => state.setLoadingAgentResponse)

  const toDemoMessages = useCallback((payload: unknown): { role: 'user' | 'bot'; content: string }[] => {
    if (!payload) return []

    const normalizeRole = (role?: string) => (role === 'user' ? 'user' : 'bot')
    const extractContent = (value: unknown): string => {
      if (!value) return ''
      if (typeof value === 'string') return value
      if (Array.isArray(value)) {
        return value.map(extractContent).filter(Boolean).join('\n')
      }
      if (typeof value === 'object') {
        const record = value as Record<string, unknown>
        if (typeof record.content === 'string') return record.content
        if (record.content && typeof record.content === 'object') {
          const contentRecord = record.content as Record<string, unknown>
          if (Array.isArray(contentRecord.parts)) {
            const partsText = contentRecord.parts
              .map((part) => (part && typeof part === 'object' ? (part as { text?: string }).text : undefined))
              .filter((part) => typeof part === 'string')
              .join('')
            if (partsText) return partsText
          }
        }
        if (typeof record.text === 'string') return record.text
      }
      return JSON.stringify(value)
    }

    if (Array.isArray(payload)) {
      return payload.flatMap((entry) => toDemoMessages(entry))
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      if (Array.isArray(record.messages)) {
        return (record.messages as unknown[]).flatMap((entry) => toDemoMessages(entry))
      }

      const contentRecord = record.content as Record<string, unknown> | undefined
      if (contentRecord && Array.isArray(contentRecord.parts)) {
        const content = extractContent(record)
        return content ? [{ role: normalizeRole(contentRecord.role as string), content }] : []
      }

      if (typeof record.role === 'string' && record.content) {
        const content = extractContent(record.content)
        return content ? [{ role: normalizeRole(record.role), content }] : []
      }

      const content = extractContent(record)
      return content ? [{ role: 'bot', content }] : []
    }

    return []
  }, [])

  useEffect(() => {
    // Initialize session
    setSessionLoading(true)
    if (getRuntimeConfig().demoMode) {
      loadDemoComponentSequence('chat', 50).then((sequence) => {
        if (sequence.length > 0) {
          setSessionLoading(false)
          setMessages([
            { role: 'bot', content: 'Welcome to the demo! How can I help you today?' },
          ])
          setDemoResponses(sequence.flatMap((entry) => toDemoMessages(entry)))
          return
        }

        loadDemoComponentData<{ welcome?: string; responses?: string[] }>('chat', {}).then((data) => {
          setSessionLoading(false)
          setMessages([
            { role: 'bot', content: data.welcome || 'Welcome to the demo! How can I help you today?' },
          ])
          setDemoResponses((data.responses || []).map((content) => ({ role: 'bot', content })))
        })
      })
      return
    }

    // Simulate session loading
    setTimeout(() => {
      setSessionLoading(false)
      setMessages([
        {role: 'bot', content: 'Welcome to ADK Demo! How can I help you today?'}
      ])
    }, 500)
  }, [setSessionLoading, toDemoMessages])

  useEffect(() => {
    if (getRuntimeConfig().demoMode) {
      return
    }

    const ws = streamChatService.connect(sessionId, (event) => {
      try {
        const payload = JSON.parse(event.data) as { role?: string; content?: string }
        const content = typeof payload.content === 'string' ? payload.content : ''
        if (content) {
          setMessages(prev => [...prev, { role: (payload.role as 'user' | 'bot') || 'bot', content }])
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

    if (getRuntimeConfig().demoMode) {
      const response = demoResponses.length > 0
        ? demoResponses[demoResponseIndex % demoResponses.length]
        : { role: 'bot' as const, content: `Demo response for: ${inputValue}` }
      setTimeout(() => {
        setMessages(prev => [...prev, response])
        setIsLoading(false)
        setMessagesLoading(false)
        setLoadingAgentResponse(false)
        setDemoResponseIndex((prev) => prev + 1)
      }, 600)
      return
    }

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
      onHandleKeydown={() => handleSendMessage()}
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
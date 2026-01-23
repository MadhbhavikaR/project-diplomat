import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import './ChatComponent.css'

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState('session_' + Math.random().toString(36).substr(2, 9))
  const [appName] = useState('ADK Demo')
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 6))

  const navigate = useNavigate()
  const setSessionLoading = useStore(state => state.setSessionLoading)
  const setMessagesLoading = useStore(state => state.setMessagesLoading)

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add user message
    setMessages(prev => [...prev, {role: 'user', content: inputValue}])
    setInputValue('')
    setIsLoading(true)
    setMessagesLoading(true)

    // Simulate API call with session context
    setTimeout(() => {
      const botResponse = `Response to: ${inputValue}\n\nSession: ${sessionId}\nApp: ${appName}\nUser: ${userId}`
      setMessages(prev => [...prev, {role: 'bot', content: botResponse}])
      setIsLoading(false)
      setMessagesLoading(false)
    }, 1000)
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="session-info">
          <span className="session-label">Session:</span>
          <span className="session-id">{sessionId}</span>
        </div>
        <div className="app-info">
          <span className="app-label">App:</span>
          <span className="app-name">{appName}</span>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()} className="send-button">
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatComponent
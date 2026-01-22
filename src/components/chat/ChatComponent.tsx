import React, { useState } from 'react'
import './ChatComponent.css'

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add user message
    setMessages(prev => [...prev, {role: 'user', content: inputValue}])
    setInputValue('')
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => [...prev, {role: 'bot', content: `Response to: ${inputValue}`}])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="chat-container">
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
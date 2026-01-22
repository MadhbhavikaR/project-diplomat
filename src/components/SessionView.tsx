import { useState } from 'react';
import { useSessionActions } from '../store/useAgentStore';

const SessionView = () => {
  const [message, setMessage] = useState('');
  const { createSession } = useSessionActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      // TODO: Implement actual session creation and message sending
      console.log('Sending message:', message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="session-view">
      <h2>Session</h2>
      <div className="message-timeline">
        {/* TODO: Implement message timeline */}
        <div className="message-system">Session started</div>
      </div>
      
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default SessionView;
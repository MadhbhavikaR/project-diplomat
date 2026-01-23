/**
 * Builder Assistant Component
 * 
 * A chat-based assistant component for helping users build agents.
 * This component provides a conversational interface with the AI assistant
 * that can help with agent creation and configuration.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/store';
import { streamChatService } from '../../services/streamChatService';
import { getRuntimeConfig } from '../../utils/runtime-config-util';
import './BuilderAssistantComponent.css';

// Define TypeScript interfaces
interface Message {
  role: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
}

interface BuilderAssistantComponentProps {
  isVisible: boolean;
  appName: string;
  onClosePanel: () => void;
  onReloadCanvas: () => void;
}

const BuilderAssistantComponent: React.FC<BuilderAssistantComponentProps> = ({
  isVisible,
  appName,
  onClosePanel,
  onReloadCanvas
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'help'>('chat');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const tabRailRef = useRef<HTMLDivElement>(null);
  const [canScrollTabRailUp, setCanScrollTabRailUp] = useState(false);
  const [canScrollTabRailDown, setCanScrollTabRailDown] = useState(false);
  const [isTabRailCollapsed, setIsTabRailCollapsed] = useState(false);
  const assistantMode = useStore(state => state.assistantMode);
  const setAssistantMode = useStore(state => state.setAssistantMode);

  const assistantAppName = "__adk_agent_builder_assistant";
  const userId = "user";
  const assistantSessionId = `${assistantAppName}-${appName}`;

  // Initialize assistant when component mounts
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      initializeAssistant();
    }
  }, [isVisible, appName]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (getRuntimeConfig().demoMode) {
      return;
    }

    const ws = streamChatService.connect(assistantSessionId, (event) => {
      try {
        const payload = JSON.parse(event.data) as { role?: 'user' | 'bot'; content?: string };
        if (payload?.content) {
          setMessages(prev => [...prev, { role: payload.role || 'bot', text: payload.content }]);
          setShouldAutoScroll(true);
          setIsGenerating(false);
        }
      } catch {
        // Ignore malformed payloads
      }
    });

    setSocket(ws);

    return () => {
      ws.close();
      setSocket(null);
    };
  }, [assistantSessionId, isVisible]);

  // Auto-scroll when shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll && chatMessagesRef.current) {
      scrollToBottom();
      setShouldAutoScroll(false);
    }
  }, [shouldAutoScroll]);

  const initializeAssistant = () => {
    // In a real implementation, this would create a session and send initial message
    // For now, we'll simulate the initial assistant greeting
    
    // Add loading message for bot response
    const loadingMessage: Message = { role: 'bot', text: '', isLoading: true };
    setMessages([loadingMessage]);
    setShouldAutoScroll(true);
    setIsGenerating(true);

    // Simulate assistant response
    setTimeout(() => {
      const welcomeMessage: Message = {
        role: 'bot',
        text: `Hello! I'm your ADK Agent Builder Assistant. I can help you build and configure agents for your application.\n\nYou're currently working on the **${appName}** application. I'm in **${assistantMode.toUpperCase()}** mode. How can I assist you today?`
      };
      setMessages([welcomeMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  const sendMessage = (msg: string) => {
    if (!msg.trim() || isGenerating) return;

    // Add user message
    const userMsg: Message = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setShouldAutoScroll(true);

    // Clear input
    setUserMessage('');

    // Add loading message for bot response
    const loadingMessage: Message = { role: 'bot', text: '', isLoading: true };
    setMessages(prev => [...prev, loadingMessage]);
    setShouldAutoScroll(true);
    setIsGenerating(true);

    if (socket && socket.readyState === WebSocket.OPEN) {
      streamChatService.sendMessage(socket, {
        content: `[${assistantMode.toUpperCase()}] ${msg}`,
        role: 'user',
        sessionId: assistantSessionId,
      });
      setIsGenerating(false);
      return;
    }

    // Fallback: simulate a response
    simulateAssistantResponse(msg);
  };

  const simulateAssistantResponse = (userMsg: string) => {
    // Simulate different types of responses based on user input
    setTimeout(() => {
      let responseText = '';

      if (userMsg.toLowerCase().includes('help')) {
        responseText = `Sure, I can help with that! Here are some things I can assist with:\n\n1. **Agent Configuration**: Help you set up and configure agents\n2. **Tool Integration**: Assist with adding and configuring tools\n3. **Workflow Design**: Help design agent workflows and interactions\n4. **Troubleshooting**: Assist with debugging and issue resolution\n\nWhat specifically would you like help with?`;
      } else if (userMsg.toLowerCase().includes('tool')) {
        responseText = `For adding tools to your agent, you can:\n\n1. Use the "Add Tool" button in the builder interface\n2. Specify the tool type (Function tool or Built-in tool)\n3. Configure the tool parameters\n4. Test the tool integration\n\nWould you like me to guide you through adding a specific tool?`;
      } else if (userMsg.toLowerCase().includes('thank')) {
        responseText = `You're welcome! I'm here to help anytime you need assistance with building your agents. Just let me know what you need. 😊`;
      } else {
        responseText = `(${assistantMode.toUpperCase()} MODE) I understand you'd like help with: "${userMsg}".\n\nHere's what I can do:\n\n1. Provide step-by-step guidance for implementing this feature\n2. Suggest best practices and patterns\n3. Help troubleshoot any issues you encounter\n\nWould you like me to provide detailed instructions or are you looking for something specific?`;
      }

      // Update the loading message with the response
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        if (updatedMessages[lastIndex].isLoading) {
          updatedMessages[lastIndex] = {
            role: 'bot',
            text: responseText
          };
        }
        return updatedMessages;
      });

      setShouldAutoScroll(true);
      setIsGenerating(false);
      onReloadCanvas();
    }, 1500);
  };

  const scrollToBottom = () => {
    try {
      if (chatMessagesRef.current) {
        // Use setTimeout to ensure content is fully rendered
        setTimeout(() => {
          chatMessagesRef.current!.scrollTop = chatMessagesRef.current!.scrollHeight;
        }, 50);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.shiftKey) {
        // Shift+Enter: Allow new line (default behavior)
        return;
      } else {
        // Enter only: Send message
        if (userMessage.trim() && !isGenerating) {
          e.preventDefault();
          sendMessage(userMessage);
        }
      }
    }
  };

  const handleClosePanel = () => {
    onClosePanel();
  };

  const toggleMode = () => {
    setAssistantMode(assistantMode === 'plan' ? 'act' : 'plan');
  };

  const updateTabRailScroll = () => {
    const rail = tabRailRef.current;
    if (!rail) return;
    setCanScrollTabRailUp(rail.scrollTop > 0);
    setCanScrollTabRailDown(rail.scrollTop + rail.clientHeight < rail.scrollHeight - 1);
  };

  const scrollTabRailBy = (delta: number) => {
    const rail = tabRailRef.current;
    if (!rail) return;
    rail.scrollBy({ top: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    updateTabRailScroll();
    const rail = tabRailRef.current;
    if (!rail) return;
    const handleScroll = () => updateTabRailScroll();
    rail.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      rail.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeTab, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="builder-assistant-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="assistant-icon">✨</span>
          <span>Assistant</span>
        </div>
        <button
          className="close-btn"
          onClick={handleClosePanel}
          title="Close assistant panel"
          aria-label="Close assistant panel"
        >
          <span className="material-symbols-outlined" aria-hidden>
            close
          </span>
        </button>
      </div>

      <div className="panel-content">
        <div className="assistant-tab-layout">
          <div className={`assistant-tab-rail ${isTabRailCollapsed ? 'collapsed' : ''}`} role="tablist" aria-orientation="vertical">
            <button
              type="button"
              className="assistant-tab-scroll"
              onClick={() => scrollTabRailBy(-80)}
              disabled={!canScrollTabRailUp}
              aria-label="Scroll tabs up"
            >
              <span className="material-symbols-outlined" aria-hidden>
                expand_less
              </span>
            </button>
            <div className="assistant-tab-scroll-area" ref={tabRailRef}>
              <button
                className={`assistant-tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
                aria-label="Chat"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  chat
                </span>
                <span className="tab-label">Chat</span>
              </button>
              <button
                className={`assistant-tab-button ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => setActiveTab('help')}
                aria-label="Help"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  help
                </span>
                <span className="tab-label">Help</span>
              </button>
            </div>
            <button
              type="button"
              className="assistant-tab-scroll"
              onClick={() => scrollTabRailBy(80)}
              disabled={!canScrollTabRailDown}
              aria-label="Scroll tabs down"
            >
              <span className="material-symbols-outlined" aria-hidden>
                expand_more
              </span>
            </button>
            <button
              type="button"
              className="assistant-tab-collapse"
              onClick={() => setIsTabRailCollapsed((prev) => !prev)}
              aria-label={isTabRailCollapsed ? 'Expand tabs' : 'Collapse tabs'}
            >
              <span className="material-symbols-outlined" aria-hidden>
                {isTabRailCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
          <div className="assistant-tab-body">
            {activeTab === 'chat' && (
              <>
                <div className="chat-messages" ref={chatMessagesRef}>
                  {messages.length === 0 ? (
                    <div className="assistant-placeholder">
                      <div className="large-icon">🤖</div>
                      <h3>Assistant Ready</h3>
                      <p>Your builder assistant is ready to help you build agents.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={message.role === 'user' ? 'user-message' : 'bot-message'}
                      >
                        <div className="message-card">
                          {message.isLoading ? (
                            <div className="loading-message">
                              <span className="material-symbols-outlined dots" aria-hidden>
                                more_horiz
                              </span>
                            </div>
                          ) : (
                            <>
                              {message.role === 'bot' && (
                                <div className="bot-label">Assistant</div>
                              )}
                              <div className="message-text">
                                {message.text.split('\n').map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line}
                                    <br />
                                  </React.Fragment>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input-container">
                  <div className="input-wrapper">
                    <button
                      type="button"
                      className={`mode-toggle-button ${assistantMode}`}
                      onClick={toggleMode}
                      aria-pressed={assistantMode === 'act'}
                    >
                      {assistantMode === 'plan' ? 'Plan' : 'Act'}
                    </button>
                    <textarea
                      className="assistant-input-box"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Ask Gemini to build your agent"
                      onKeyDown={handleKeyDown}
                      disabled={isGenerating}
                      rows={1}
                    />
                    <button
                      className="send-button"
                      onClick={() => sendMessage(userMessage)}
                      disabled={!userMessage.trim() || isGenerating}
                      title="Send message"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        send
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'help' && (
              <div className="assistant-help">
                <h3>How to use the Assistant</h3>
                <ul>
                  <li>Use Plan mode for guidance and steps.</li>
                  <li>Use Act mode to execute specific changes.</li>
                  <li>Ask for tools, agents, and workflow scaffolds.</li>
                  <li>Double‑click nodes in the canvas to edit.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderAssistantComponent;
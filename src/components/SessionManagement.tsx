import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { apiClient } from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import type { Session } from '../types';

// Extend Session type to include name and timestamp for UI display
interface UISession extends Session {
  name: string;
  timestamp: string;
}

/**
 * SessionManagement component handles session creation, management, and display
 */
export const SessionManagement: React.FC = () => {
  const { currentAgent, currentSession, setCurrentSession, addSession } = useAgentStore();
  const [sessionName, setSessionName] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load sessions when component mounts or agent changes
  useEffect(() => {
    if (currentAgent) {
      loadSessions();
    }
  }, [currentAgent]);

  /**
   * Load sessions for current agent
   */
  const loadSessions = async () => {
    if (!currentAgent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getSessions(currentAgent.id);
      setSessions(response.data);
      
      // Set current session if available
      if (response.data.length > 0 && !currentSession) {
        setCurrentSession(response.data[0]);
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new session
   */
  const createSession = async () => {
    if (!currentAgent || !sessionName.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newSession = await apiClient.createSession({
        agentId: currentAgent.id,
        name: sessionName.trim(),
        timestamp: new Date().toISOString()
      });
      
      // Add to store and local state
      addSession(newSession);
      setCurrentSession(newSession);
      setSessions([newSession, ...sessions]);
      setSessionName('');
      
      // Navigate to session view
      navigate(`/sessions/${newSession.id}`);
    } catch (err) {
      setError('Failed to create session');
      console.error('Error creating session:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select existing session
   */
  const selectSession = (session: Session) => {
    setCurrentSession(session);
    navigate(`/sessions/${session.id}`);
  };

  /**
   * Delete session
   */
  const deleteSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await apiClient.deleteSession(sessionId);
      
      // Update local state
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // Clear current session if it was deleted
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      setError('Failed to delete session');
      console.error('Error deleting session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-management">
      <h2>Session Management</h2>
      
      {currentAgent && (
        <div className="session-creation">
          <h3>Create New Session</h3>
          <div className="form-group">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name"
              disabled={loading}
              className="session-input"
            />
            <button
              onClick={createSession}
              disabled={loading || !sessionName.trim()}
              className="create-button"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
      
      <div className="sessions-list">
        <h3>Existing Sessions</h3>
        {loading ? (
          <div className="loading-spinner">Loading sessions...</div>
        ) : sessions.length > 0 ? (
          <ul className="session-items">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => selectSession(session)}
              >
                <div className="session-info">
                  <span className="session-name">{session.name}</span>
                  <span className="session-time">
                    {new Date(session.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="delete-button"
                  aria-label={`Delete session ${session.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-sessions">No sessions available</div>
        )}
      </div>
    </div>
  );
};

/**
 * SessionDetail component displays detailed information about a specific session
 */
export const SessionDetail: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getSession(sessionId);
        setSessionData(response.data);
      } catch (err) {
        setError('Failed to load session data');
        console.error('Error loading session data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [sessionId]);

  if (loading) {
    return <div className="loading-spinner">Loading session...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!sessionData) {
    return <div className="no-data">Session not found</div>;
  }

  return (
    <div className="session-detail">
      <h2>{sessionData.name}</h2>
      <div className="session-meta">
        <span>Created: {new Date(sessionData.timestamp).toLocaleString()}</span>
        <span>ID: {sessionData.id}</span>
      </div>
      <div className="session-content">
        <div className="placeholder">Session content will be displayed here</div>
      </div>
    </div>
  );
};

/**
 * SessionHeader component displays current session information in header
 */
export const SessionHeader: React.FC = () => {
  const { currentSession } = useAgentStore();

  if (!currentSession) {
    return null;
  }

  return (
    <div className="session-header">
      <span className="session-indicator">📋</span>
      <span className="session-name">{currentSession.name}</span>
      <span className="session-time">
        {new Date(currentSession.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
};
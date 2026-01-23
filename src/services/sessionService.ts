/**
 * Session Service for React ADK-WEB
 * Provides session management functionality equivalent to Angular implementation
 */

import type { Session } from '../types/agentBuilder';

class SessionService {
  private apiServerDomain: string = ''; // Would be set from runtime config

  constructor() {
    // Initialize with default or runtime configuration
    this.apiServerDomain = import.meta.env.VITE_API_SERVER_DOMAIN || '';
  }

  async createSession(userId: string, appName: string): Promise<Session> {
    if (!this.apiServerDomain) {
      // Mock response for development
      return {
        id: `session_${Math.random().toString(36).substr(2, 9)}`,
        appName,
        userId,
        state: {},
        events: [],
        lastUpdateTime: Date.now()
      };
    }

    try {
      const url = `${this.apiServerDomain}/apps/${appName}/users/${userId}/sessions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async listSessions(userId: string, appName: string): Promise<{items: Session[], nextPageToken: string}> {
    if (!this.apiServerDomain) {
      // Mock response for development
      return {
        items: [
          {
            id: `session_${Math.random().toString(36).substr(2, 9)}`,
            appName,
            userId,
            state: {},
            events: [],
            lastUpdateTime: Date.now()
          }
        ],
        nextPageToken: ''
      };
    }

    try {
      const url = `${this.apiServerDomain}/apps/${appName}/users/${userId}/sessions`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to list sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        items: data as Session[],
        nextPageToken: ''
      };
    } catch (error) {
      console.error('Error listing sessions:', error);
      return {
        items: [],
        nextPageToken: ''
      };
    }
  }

  async deleteSession(userId: string, appName: string, sessionId: string): Promise<void> {
    if (!this.apiServerDomain) {
      console.log('Mock: Session deleted', sessionId);
      return;
    }

    try {
      const url = `${this.apiServerDomain}/apps/${appName}/users/${userId}/sessions/${sessionId}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async getSession(userId: string, appName: string, sessionId: string): Promise<Session> {
    if (!this.apiServerDomain) {
      // Mock response for development
      return {
        id: sessionId,
        appName,
        userId,
        state: {},
        events: [],
        lastUpdateTime: Date.now()
      };
    }

    try {
      const url = `${this.apiServerDomain}/apps/${appName}/users/${userId}/sessions/${sessionId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async importSession(userId: string, appName: string, events: any[]): Promise<Session> {
    if (!this.apiServerDomain) {
      // Mock response for development
      return {
        id: `session_${Math.random().toString(36).substr(2, 9)}`,
        appName,
        userId,
        state: {},
        events,
        lastUpdateTime: Date.now()
      };
    }

    try {
      const url = `${this.apiServerDomain}/apps/${appName}/users/${userId}/sessions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appName,
          userId,
          events
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to import session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing session:', error);
      throw error;
    }
  }

  async canEdit(): Promise<boolean> {
    // For now, always return true (matches Angular implementation)
    return true;
  }
}

export const sessionService = new SessionService();
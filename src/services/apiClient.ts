import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, Agent, Session, Event, Artifact, Evaluation } from '../types';

class ApiClient {
  private instance: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    
    this.instance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access, redirecting to login...');
          // TODO: Implement proper redirect
        }
        return Promise.reject(error);
      }
    );
  }

  // Agent endpoints
  async getAgents(): Promise<ApiResponse<Agent[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Agent[]>> = await this.instance.get('/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      return {
        success: false,
        error: 'Failed to fetch agents',
      };
    }
  }

  async getAgent(agentId: string): Promise<ApiResponse<Agent>> {
    try {
      const response: AxiosResponse<ApiResponse<Agent>> = await this.instance.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error);
      return {
        success: false,
        error: `Failed to fetch agent ${agentId}`,
      };
    }
  }

  // Session endpoints
  async createSession(agentId: string): Promise<ApiResponse<Session>> {
    try {
      const response: AxiosResponse<ApiResponse<Session>> = await this.instance.post('/sessions', {
        agentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        error: 'Failed to create session',
      };
    }
  }

  async getSession(sessionId: string): Promise<ApiResponse<Session>> {
    try {
      const response: AxiosResponse<ApiResponse<Session>> = await this.instance.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      return {
        success: false,
        error: `Failed to fetch session ${sessionId}`,
      };
    }
  }

  // Event endpoints
  async getEvents(sessionId: string): Promise<ApiResponse<Event[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Event[]>> = await this.instance.get(`/sessions/${sessionId}/events`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for session ${sessionId}:`, error);
      return {
        success: false,
        error: `Failed to fetch events for session ${sessionId}`,
      };
    }
  }

  // Artifact endpoints
  async getArtifacts(sessionId: string): Promise<ApiResponse<Artifact[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Artifact[]>> = await this.instance.get(`/sessions/${sessionId}/artifacts`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching artifacts for session ${sessionId}:`, error);
      return {
        success: false,
        error: `Failed to fetch artifacts for session ${sessionId}`,
      };
    }
  }

  // Evaluation endpoints
  async getEvaluations(): Promise<ApiResponse<Evaluation[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Evaluation[]>> = await this.instance.get('/evaluations');
      return response.data;
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return {
        success: false,
        error: 'Failed to fetch evaluations',
      };
    }
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: string }>> = await this.instance.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return {
        success: false,
        error: 'Failed to check health',
      };
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.request(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'API request failed',
      };
    }
  }

  // Set base URL
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.instance.defaults.baseURL = url;
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Custom hook for using the API client
export const useApiClient = () => {
  return apiClient;
};

export default ApiClient;
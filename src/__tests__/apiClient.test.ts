import axios from 'axios';
import ApiClient from '../services/apiClient';
import { type Agent, type Session, type Event, type Artifact, type Evaluation, type ApiResponse } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient('http://localhost:8000');
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create axios instance with correct base URL', () => {
      expect(apiClient).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    });

    it('should use default URL when VITE_API_BASE_URL is not available', () => {
      const testClient = new ApiClient();
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8000',
        })
      );
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization token to requests when available', async () => {
      // Mock localStorage
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockReturnValue('test-token');

      // Mock axios request
      mockedAxios.request.mockResolvedValue({ data: {} });

      await apiClient.getAgents();

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );

      getItemSpy.mockRestore();
    });

    it('should not add authorization token when not available', async () => {
      // Mock localStorage
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockReturnValue(null);

      // Mock axios request
      mockedAxios.request.mockResolvedValue({ data: {} });

      await apiClient.getAgents();

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );

      getItemSpy.mockRestore();
    });
  });

  describe('Response Interceptor', () => {
    it('should handle 401 errors and log unauthorized access', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Mock axios request to reject with 401 error
      mockedAxios.request.mockRejectedValue({
        response: {
          status: 401,
        },
      });

      await expect(apiClient.getAgents()).rejects.toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unauthorized access, redirecting to login...');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Agent Endpoints', () => {
    it('getAgents should make GET request to /agents', async () => {
      const mockAgents: Agent[] = [
        { id: '1', name: 'Test Agent', description: 'Test agent', status: 'idle' },
      ];

      const mockResponse: ApiResponse<Agent[]> = {
        success: true,
        data: mockAgents,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getAgents();

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/agents',
      });
      expect(result).toEqual(mockResponse);
    });

    it('getAgent should make GET request to /agents/:id', async () => {
      const mockAgent: Agent = { id: '1', name: 'Test Agent', description: 'Test agent', status: 'idle' };

      const mockResponse: ApiResponse<Agent> = {
        success: true,
        data: mockAgent,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getAgent('1');

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/agents/1',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Session Endpoints', () => {
    it('createSession should make POST request to /sessions', async () => {
      const mockSession: Session = { 
        id: 'session-1', 
        agentId: '1', 
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const mockResponse: ApiResponse<Session> = {
        success: true,
        data: mockSession,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.createSession('1');

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'post',
        url: '/sessions',
        data: { agentId: '1' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('getSession should make GET request to /sessions/:id', async () => {
      const mockSession: Session = { 
        id: 'session-1', 
        agentId: '1', 
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const mockResponse: ApiResponse<Session> = {
        success: true,
        data: mockSession,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getSession('session-1');

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/sessions/session-1',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Event Endpoints', () => {
    it('getEvents should make GET request to /sessions/:sessionId/events', async () => {
      const mockEvents: Event[] = [
        { 
          id: '1', 
          sessionId: 'session-1', 
          type: 'input', 
          timestamp: new Date().toISOString(),
          payload: { content: 'Hello' }
        },
      ];

      const mockResponse: ApiResponse<Event[]> = {
        success: true,
        data: mockEvents,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getEvents('session-1');

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/sessions/session-1/events',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Artifact Endpoints', () => {
    it('getArtifacts should make GET request to /sessions/:sessionId/artifacts', async () => {
      const mockArtifacts: Artifact[] = [
        { 
          id: '1', 
          sessionId: 'session-1', 
          name: 'test.txt', 
          type: 'text', 
          size: 100,
          createdAt: new Date().toISOString()
        },
      ];

      const mockResponse: ApiResponse<Artifact[]> = {
        success: true,
        data: mockArtifacts,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getArtifacts('session-1');

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/sessions/session-1/artifacts',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Evaluation Endpoints', () => {
    it('getEvaluations should make GET request to /evaluations', async () => {
      const mockEvaluations: Evaluation[] = [
        { 
          id: '1', 
          name: 'Test Evaluation', 
          description: 'Test evaluation',
          createdAt: new Date().toISOString(),
          sessions: []
        },
      ];

      const mockResponse: ApiResponse<Evaluation[]> = {
        success: true,
        data: mockEvaluations,
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getEvaluations();

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/evaluations',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Health Check', () => {
    it('checkHealth should make GET request to /health', async () => {
      const mockResponse: ApiResponse<{ status: string }> = {
        success: true,
        data: { status: 'healthy' },
      };

      mockedAxios.request.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.checkHealth();

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/health',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Utility Methods', () => {
    it('setBaseUrl should update the base URL', () => {
      apiClient.setBaseUrl('http://new-api.example.com');
      expect(apiClient.getBaseUrl()).toBe('http://new-api.example.com');
    });

    it('getBaseUrl should return the current base URL', () => {
      expect(apiClient.getBaseUrl()).toBe('http://localhost:8000');
    });
  });
});
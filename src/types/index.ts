// Base types for the ADK Web application
export interface Agent {
  id: string;
  name: string;
  description: string;
  status?: 'idle' | 'running' | 'error';
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  agentId: string;
  createdAt: string;
  status: 'active' | 'completed' | 'error';
  messages?: Message[];
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'agent' | 'system';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'error';
}

export interface Event {
  id: string;
  sessionId: string;
  type: 'input' | 'reasoning' | 'tool_call' | 'output' | 'error';
  timestamp: string;
  payload: any;
  metadata?: Record<string, any>;
}

export interface Artifact {
  id: string;
  sessionId: string;
  name: string;
  type: 'json' | 'image' | 'text' | 'log' | 'other';
  size: number;
  createdAt: string;
  content?: string | Blob;
}

export interface Evaluation {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  sessions: string[];
  metrics?: Record<string, number>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'testing';
  featureFlags: {
    builder: boolean;
    evaluations: boolean;
    tracing: boolean;
  };
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
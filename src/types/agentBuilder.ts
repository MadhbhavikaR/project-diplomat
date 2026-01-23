export interface AgentNode {
  isRoot: boolean;
  name: string;
  agent_class: string;
  model?: string;
  instruction?: string;
  description?: string;
  sub_agents?: AgentNode[];
  tools?: ToolNode[];
  callbacks?: CallbackNode[];
  max_iterations?: number;
  skip_summarization?: boolean;
  isAgentTool?: boolean;
}

export interface ToolNode {
  toolType: string;
  name: string;
  args?: any;
}

export interface CallbackNode {
  type: string;
  name: string;
  args?: any;
}

export type SessionState = {
  [key: string]: unknown;
};

export interface Session {
  id?: string;
  appName?: string;
  userId?: string;
  state?: SessionState;
  events?: any[];
  lastUpdateTime?: number;
}
import { useEffect } from 'react';
import { useAgentStore, useAgentActions } from '../store/useAgentStore';
import { useApiClient } from '../services/apiClient';

const AgentList = () => {
  const { agents, isLoading, error } = useAgentStore();
  const { loadAgents } = useAgentActions();
  const apiClient = useApiClient();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="agent-list">
      <h2>Available Agents</h2>
      {agents.length === 0 ? (
        <div>No agents found</div>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} className="agent-item">
              <div className="agent-name">{agent.name}</div>
              <div className="agent-description">{agent.description}</div>
              <button onClick={() => console.log('Select agent:', agent.id)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgentList;
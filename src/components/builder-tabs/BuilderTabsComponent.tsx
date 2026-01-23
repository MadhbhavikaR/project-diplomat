import React, { useState } from 'react';
import type { AgentNode, ToolNode, CallbackNode } from '../../types/agentBuilder';
import { getToolIcon } from '../../constants/tool-icons';
import AddToolDialogComponent from '../add-tool-dialog/AddToolDialogComponent';
import { useStore } from '../../store/store';
import './BuilderTabsComponent.scss';

export const BuilderTabsComponent: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [header, setHeader] = useState('Agent configuration');
  const [showToolTypeMenu, setShowToolTypeMenu] = useState(false);
  const [toolDialogType, setToolDialogType] = useState<string>('Built-in tool');
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  const agentConfig = useStore(state => state.agentConfig);
  const setAgentConfig = useStore(state => state.setAgentConfig);
  const addToolToConfig = useStore(state => state.addTool);
  const removeToolFromConfig = useStore(state => state.removeTool);
  const addCallbackToConfig = useStore(state => state.addCallback);
  const removeCallbackFromConfig = useStore(state => state.removeCallback);
  const addSubAgentToConfig = useStore(state => state.addSubAgent);
  const removeSubAgentFromConfig = useStore(state => state.removeSubAgent);

  // Agent configuration options
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro"
  ];

  const agentTypes = [
    'LlmAgent',
    'LoopAgent',
    'ParallelAgent',
    'SequentialAgent'
  ];

  const toolTypes = [
    'Custom tool',
    'Function tool',
    'Built-in tool',
    'Agent Tool'
  ];

  const callbackTypes = [
    'before_agent',
    'before_model',
    'before_tool',
    'after_tool',
    'after_model',
    'after_agent',
  ];

  const builtInTools = [
    'EnterpriseWebSearchTool',
    'exit_loop',
    'FilesRetrieval',
    'get_user_choice',
    'google_search',
    'load_artifacts',
    'load_memory',
    'LongRunningFunctionTool',
    'preload_memory',
    'url_context',
    'VertexAiRagRetrieval',
    'VertexAiSearchTool',
  ];

  // Tab indices
  const CALLBACKS_TAB_INDEX = 3;

  const handleAgentConfigChange = (field: string, value: string | number | boolean) => {
    setAgentConfig({ ...agentConfig, [field]: value });
  };

  const addTool = (toolData: { toolType: string; name: string }) => {
    addToolToConfig({ toolType: toolData.toolType, name: toolData.name });
    setSelectedTabIndex(2);
  };

  const addCallback = (callbackType: string) => {
    const newCallback: CallbackNode = {
      type: callbackType,
      name: `${callbackType}_${Date.now()}`
    };
    
    addCallbackToConfig(newCallback);
    setSelectedTabIndex(CALLBACKS_TAB_INDEX);
  };

  const openToolDialog = (toolType: string) => {
    setToolDialogType(toolType);
    setIsToolDialogOpen(true);
    setShowToolTypeMenu(false);
  };

  const closeToolDialog = () => {
    setIsToolDialogOpen(false);
  };

  const deleteTool = (toolName: string) => {
    removeToolFromConfig(toolName);
  };

  const deleteCallback = (callbackName: string) => {
    removeCallbackFromConfig(callbackName);
  };

  const deleteSubAgent = (subAgentName: string) => {
    removeSubAgentFromConfig(subAgentName);
  };

  const addSubAgentWithType = (agentType: string) => {
    addSubAgentToConfig(agentType);
  };

  const saveChanges = () => {
    console.log('Saving changes for agent:', agentConfig.name);
    // In a real implementation, this would save to the backend
  };

  const cancelChanges = () => {
    console.log('Cancelling changes');
    // In a real implementation, this would revert changes
  };

  const getCallbacksByType = (): Map<string, CallbackNode[]> => {
    const callbackGroups = new Map<string, CallbackNode[]>();

    // Initialize groups for all callback types with empty arrays
    callbackTypes.forEach(type => {
      callbackGroups.set(type, []);
    });

    // Group callbacks by type if they exist
    if (agentConfig?.callbacks) {
      agentConfig.callbacks.forEach(callback => {
        const group = callbackGroups.get(callback.type);
        if (group) {
          group.push(callback);
        }
      });
    }

    return callbackGroups;
  };

  const callbackMenuTooltips = (callbackType: string): string => {
    switch(callbackType) {
      case 'before_agent': return 'Callback before agent execution';
      case 'after_agent': return 'Callback after agent execution';
      case 'before_model': return 'Callback before model execution';
      case 'after_model': return 'Callback after model execution';
      case 'before_tool': return 'Callback before tool execution';
      case 'after_tool': return 'Callback after tool execution';
      default: return 'Callback';
    }
  };

  const toolMenuTooltips = (toolType: string): string => {
    switch(toolType) {
      case 'Function tool': return 'Add a function tool';
      case 'Built-in tool': return 'Add a built-in tool';
      case 'Agent tool': return 'Add an agent tool';
      default: return 'Add tool';
    }
  };

  // Tab content management
  const renderTabContent = () => {
    switch(selectedTabIndex) {
      case 0:
        return (
          <div className="builder-panel-wrapper">
            <div className="panel-title">Configuration</div>
            <div>
              <div className="config-form">
                <div className="form-row">
                  <div className="agent-name-field">
                    <label>Agent Name</label>
                    <input
                      type="text"
                      value={agentConfig.name}
                      disabled={agentConfig.isRoot}
                      onChange={(e) => handleAgentConfigChange('name', e.target.value)}
                    />
                  </div>
                  <div className="agent-type-field">
                    <label>Agent Type</label>
                    <select
                      value={agentConfig.agent_class}
                      disabled
                      onChange={(e) => handleAgentConfigChange('agent_class', e.target.value)}
                    >
                      {agentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Model</label>
                    <select
                      value={agentConfig.model}
                      onChange={(e) => handleAgentConfigChange('model', e.target.value)}
                    >
                      {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Instructions</label>
                    <textarea
                      rows={5}
                      value={agentConfig.instruction}
                      onChange={(e) => handleAgentConfigChange('instruction', e.target.value)}
                    ></textarea>
                  </div>
                )}

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Description (optional)</label>
                    <textarea
                      rows={3}
                      value={agentConfig.description || ''}
                      onChange={(e) => handleAgentConfigChange('description', e.target.value)}
                    ></textarea>
                  </div>
                )}

                {agentConfig.agent_class === 'LoopAgent' && (
                  <div className="form-field">
                    <label>Max Iteration</label>
                    <input
                      type="number"
                      value={agentConfig.max_iterations || ''}
                      min={1}
                      onChange={(e) => handleAgentConfigChange('max_iterations', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}

                {agentConfig.isAgentTool && (
                  <div className="form-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={agentConfig.skip_summarization || false}
                        onChange={(e) => handleAgentConfigChange('skip_summarization', e.target.checked)}
                      />
                      Skip summarization
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return null; // Sub-agents tab (handled separately)
      case 2:
        return (
          <div className="builder-panel-wrapper">
            <div className="panel-title">
              <div>Tools</div>
              <div>
                <button 
                  className="panel-action-button"
                  onClick={() => setShowToolTypeMenu((prev) => !prev)}
                >
                  <span>add</span>
                </button>
              </div>
            </div>
            {showToolTypeMenu && (
              <div className="tool-type-menu">
                <button type="button" onClick={() => openToolDialog('Function tool')}>
                  Function tool
                </button>
                <button type="button" onClick={() => openToolDialog('Built-in tool')}>
                  Built-in tool
                </button>
                <button type="button" onClick={() => openToolDialog('Agent tool')}>
                  Agent tool
                </button>
              </div>
            )}
            <div className="tools-chips-container">
              {agentConfig.tools && agentConfig.tools.length > 0 ? (
                <div className="tools-list">
                  {agentConfig.tools.map(tool => (
                    <div key={tool.name} className="tool-chip">
                      <span className="tool-icon material-symbols-outlined">{getToolIcon(tool)}</span>
                      <span className="tool-chip-name">{tool.name}</span>
                      <button 
                        className="tool-remove"
                        onClick={() => deleteTool(tool.name)}
                      >
                        <span>cancel</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tools-message">No tools added yet</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="builder-panel-wrapper">
            <div className="panel-title">
              <div>Callbacks</div>
              <div>
                <button 
                  className="panel-action-button"
                  onClick={() => {
                    const menu = document.createElement('div');
                    menu.className = 'callbacks-menu';
                    menu.innerHTML = `
                      <div>
                        <div className="menu-header">Agent Lifecycle</div>
                        <button onClick="addCallback('before_agent')">Before Agent</button>
                        <button onClick="addCallback('after_agent')">After Agent</button>
                        ${agentConfig.agent_class === 'LlmAgent' ? `
                          <div className="menu-header">Model (LLM) Interaction</div>
                          <button onClick="addCallback('before_model')">Before Model</button>
                          <button onClick="addCallback('after_model')">After Model</button>
                          <div className="menu-header">Tool Execution</div>
                          <button onClick="addCallback('before_tool')">Before Tool</button>
                          <button onClick="addCallback('after_tool')">After Tool</button>
                        ` : ''}
                      </div>
                    `;
                    document.body.appendChild(menu);
                  }}
                >
                  <span>add</span>
                </button>
              </div>
            </div>
            <div className="tools-chips-container callbacks-list">
              {agentConfig.callbacks && agentConfig.callbacks.length > 0 ? (
                <div className="callbacks-list">
                  {agentConfig.callbacks.map(callback => (
                    <div key={callback.name} className="callback-row">
                      <div className="callback-chip">
                        <span className="chip-content">
                          <span className="chip-type">{callback.type}</span>
                          <span className="chip-name">{callback.name}</span>
                        </span>
                      </div>
                      <button 
                        className="callback-remove"
                        onClick={() => deleteCallback(callback.name)}
                      >
                        <span>remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tools-message">No callbacks added yet</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="builder-tabs-container">
      <div className="builder-tab-content">
        {/* Tab Navigation */}
        <div className="builder-tab-layout">
          <div className="builder-tab-rail" role="tablist" aria-orientation="vertical">
            <button
              className={`tab-button ${selectedTabIndex === 0 ? 'active' : ''}`}
              onClick={() => setSelectedTabIndex(0)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                tune
              </span>
              <span className="tab-label">Configuration</span>
            </button>
            <button
              className={`tab-button ${selectedTabIndex === 1 ? 'active' : ''}`}
              onClick={() => setSelectedTabIndex(1)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                group_work
              </span>
              <span className="tab-label">Sub Agents</span>
            </button>
            {agentConfig.agent_class === 'LlmAgent' && (
              <button
                className={`tab-button ${selectedTabIndex === 2 ? 'active' : ''}`}
                onClick={() => setSelectedTabIndex(2)}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  build
                </span>
                <span className="tab-label">Tools</span>
              </button>
            )}
            <button
              className={`tab-button ${selectedTabIndex === 3 ? 'active' : ''}`}
              onClick={() => setSelectedTabIndex(3)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                bolt
              </span>
              <span className="tab-label">Callbacks</span>
            </button>
          </div>
          <div className="builder-tab-body">
            <div className="agent-breadcrumb-container">
          <div className="breadcrumb-chip current-agent">
            {agentConfig.name}
          </div>
        </div>
            <div className="content-wrapper">
          <div className="builder-panel-wrapper">
            <div className="panel-title">Configuration</div>
            <div>
              <div className="config-form">
                <div className="form-row">
                  <div className="agent-name-field">
                    <label>Agent Name</label>
                    <input
                      type="text"
                      value={agentConfig.name}
                      disabled={agentConfig.isRoot}
                      onChange={(e) => handleAgentConfigChange('name', e.target.value)}
                    />
                  </div>
                  <div className="agent-type-field">
                    <label>Agent Type</label>
                    <select
                      value={agentConfig.agent_class}
                      disabled
                      onChange={(e) => handleAgentConfigChange('agent_class', e.target.value)}
                    >
                      {agentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Model</label>
                    <select
                      value={agentConfig.model}
                      onChange={(e) => handleAgentConfigChange('model', e.target.value)}
                    >
                      {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Instructions</label>
                    <textarea
                      rows={5}
                      value={agentConfig.instruction}
                      onChange={(e) => handleAgentConfigChange('instruction', e.target.value)}
                    ></textarea>
                  </div>
                )}

                {agentConfig.agent_class === 'LlmAgent' && (
                  <div className="form-field">
                    <label>Description (optional)</label>
                    <textarea
                      rows={3}
                      value={agentConfig.description || ''}
                      onChange={(e) => handleAgentConfigChange('description', e.target.value)}
                    ></textarea>
                  </div>
                )}

                {agentConfig.agent_class === 'LoopAgent' && (
                  <div className="form-field">
                    <label>Max Iteration</label>
                    <input
                      type="number"
                      value={agentConfig.max_iterations || ''}
                      min={1}
                      onChange={(e) => handleAgentConfigChange('max_iterations', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}

                {agentConfig.isAgentTool && (
                  <div className="form-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={agentConfig.skip_summarization || false}
                        onChange={(e) => handleAgentConfigChange('skip_summarization', e.target.checked)}
                      />
                      Skip summarization
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {agentConfig.agent_class === 'LlmAgent' && (
            <div className="builder-panel-wrapper">
              <div className="panel-title">
                <div>Tools</div>
                <div>
                  <button 
                    className="panel-action-button"
                    onClick={() => setShowToolTypeMenu((prev) => !prev)}
                  >
                    <span>add</span>
                  </button>
                </div>
              </div>
              {showToolTypeMenu && (
                <div className="tool-type-menu">
                  <button type="button" onClick={() => openToolDialog('Function tool')}>
                    Function tool
                  </button>
                  <button type="button" onClick={() => openToolDialog('Built-in tool')}>
                    Built-in tool
                  </button>
                  <button type="button" onClick={() => openToolDialog('Agent tool')}>
                    Agent tool
                  </button>
                </div>
              )}
              <div className="tools-chips-container">
                {agentConfig.tools && agentConfig.tools.length > 0 ? (
                  <div className="tools-list">
                    {agentConfig.tools.map(tool => (
                      <div key={tool.name} className="tool-chip">
                        <span className="tool-icon material-symbols-outlined">{getToolIcon(tool)}</span>
                        <span className="tool-chip-name">{tool.name}</span>
                        <button 
                          className="tool-remove"
                          onClick={() => deleteTool(tool.name)}
                        >
                          <span>cancel</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-tools-message">No tools added yet</div>
                )}
              </div>
            </div>
          )}

          {selectedTabIndex === 1 && (
            <div className="builder-panel-wrapper">
              <div className="panel-title">
                <div>Sub Agents</div>
                <div>
                  <button 
                    className="panel-action-button"
                    onClick={() => {
                      const menu = document.createElement('div');
                      menu.className = 'sub-agent-menu';
                      menu.innerHTML = `
                        <div>
                          <button onClick="addSubAgentWithType('LlmAgent')">LLM Agent</button>
                          <button onClick="addSubAgentWithType('SequentialAgent')">Sequential Agent</button>
                          <button onClick="addSubAgentWithType('LoopAgent')">Loop Agent</button>
                          <button onClick="addSubAgentWithType('ParallelAgent')">Parallel Agent</button>
                        </div>
                      `;
                      document.body.appendChild(menu);
                    }}
                  >
                    <span>add</span>
                  </button>
                </div>
              </div>
              <div className="tools-chips-container">
                {agentConfig.sub_agents && agentConfig.sub_agents.length > 0 ? (
                  <div className="tools-list">
                    {agentConfig.sub_agents.map(subAgent => (
                      <div key={subAgent.name} className="tool-chip">
                        <span className="tool-icon material-symbols-outlined">{getToolIcon(subAgent)}</span>
                        <span className="tool-chip-name">{subAgent.name}</span>
                        <button 
                          className="tool-remove"
                          onClick={() => deleteSubAgent(subAgent.name)}
                        >
                          <span>cancel</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-tools-message">No sub agents added yet</div>
                )}
              </div>
            </div>
          )}

          <div className="builder-panel-wrapper">
            <div className="panel-title">
              <div>Callbacks</div>
              <div>
                <button 
                  className="panel-action-button"
                  onClick={() => {
                    const menu = document.createElement('div');
                    menu.className = 'callbacks-menu';
                    menu.innerHTML = `
                      <div>
                        <div className="menu-header">Agent Lifecycle</div>
                        <button onClick="addCallback('before_agent')">Before Agent</button>
                        <button onClick="addCallback('after_agent')">After Agent</button>
                        ${agentConfig.agent_class === 'LlmAgent' ? `
                          <div className="menu-header">Model (LLM) Interaction</div>
                          <button onClick="addCallback('before_model')">Before Model</button>
                          <button onClick="addCallback('after_model')">After Model</button>
                          <div className="menu-header">Tool Execution</div>
                          <button onClick="addCallback('before_tool')">Before Tool</button>
                          <button onClick="addCallback('after_tool')">After Tool</button>
                        ` : ''}
                      </div>
                    `;
                    document.body.appendChild(menu);
                  }}
                >
                  <span>add</span>
                </button>
              </div>
            </div>
            <div className="tools-chips-container callbacks-list">
              {agentConfig.callbacks && agentConfig.callbacks.length > 0 ? (
                <div className="callbacks-list">
                  {agentConfig.callbacks.map(callback => (
                    <div key={callback.name} className="callback-row">
                      <div className="callback-chip">
                        <span className="chip-content">
                          <span className="chip-type">{callback.type}</span>
                          <span className="chip-name">{callback.name}</span>
                        </span>
                      </div>
                      <button 
                        className="callback-remove"
                        onClick={() => deleteCallback(callback.name)}
                      >
                        <span>remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tools-message">No callbacks added yet</div>
              )}
            </div>
          </div>
        </div>
            <div className="action-buttons">
              <button className="save-button" onClick={saveChanges}>Save</button>
              <button className="cancel-button" onClick={cancelChanges}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
      <AddToolDialogComponent
        isOpen={isToolDialogOpen}
        toolType={toolDialogType}
        onAddTool={(toolData) => {
          addTool({ toolType: toolData.toolType, name: toolData.name })
          closeToolDialog()
        }}
        onCancel={closeToolDialog}
      />
    </div>
  );
};

export default BuilderTabsComponent;
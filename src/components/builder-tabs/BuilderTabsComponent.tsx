import React, { useEffect, useRef, useState } from 'react';
import type { AgentNode } from '../../types/agentBuilder';
import { getToolIcon } from '../../constants/tool-icons';
import { useStore } from '../../store/store';
import './BuilderTabsComponent.scss';

export const BuilderTabsComponent: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const tabRailRef = useRef<HTMLDivElement | null>(null);
  const [canScrollTabRailUp, setCanScrollTabRailUp] = useState(false);
  const [canScrollTabRailDown, setCanScrollTabRailDown] = useState(false);
  const [isTabRailCollapsed, setIsTabRailCollapsed] = useState(false);

  const agentConfig = useStore(state => state.agentConfig);
  const setAgentConfig = useStore(state => state.setAgentConfig);
  const setSelectedBuilderItem = useStore(state => state.setSelectedBuilderItem);

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
  }, [selectedTabIndex, agentConfig.agent_class]);

  const handleAgentConfigChange = (field: string, value: string | number | boolean) => {
    setAgentConfig({ ...agentConfig, [field]: value });
  };

  const handleSelectItem = (type: 'tool' | 'callback' | 'agent', name: string) => {
    setSelectedBuilderItem({ type, name });
  };

  const saveChanges = () => {
    console.log('Saving changes for agent:', agentConfig.name);
    // In a real implementation, this would save to the backend
  };

  const cancelChanges = () => {
    console.log('Cancelling changes');
    // In a real implementation, this would revert changes
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
        return (
          <div className="builder-panel-wrapper">
            <div className="panel-title">
              <div>Sub Agents</div>
            </div>
            <div className="tools-chips-container">
              {agentConfig.sub_agents && agentConfig.sub_agents.length > 0 ? (
                <div className="tools-list">
                  {agentConfig.sub_agents.map(subAgent => (
                    <button
                      key={subAgent.name}
                      type="button"
                      className="tool-chip tool-chip-button"
                      onClick={() => handleSelectItem('agent', subAgent.name)}
                    >
                      <span className="tool-icon material-symbols-outlined">{getToolIcon(subAgent)}</span>
                      <span className="tool-chip-name">{subAgent.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-tools-message">No sub agents added yet</div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="builder-panel-wrapper">
            <div className="panel-title">
              <div>Tools</div>
            </div>
            <div className="tools-chips-container">
              {agentConfig.tools && agentConfig.tools.length > 0 ? (
                <div className="tools-list">
                  {agentConfig.tools.map(tool => (
                    <button
                      key={tool.name}
                      type="button"
                      className="tool-chip tool-chip-button"
                      onClick={() => handleSelectItem('tool', tool.name)}
                    >
                      <span className="tool-icon material-symbols-outlined">{getToolIcon(tool)}</span>
                      <span className="tool-chip-name">{tool.name}</span>
                    </button>
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
            </div>
            <div className="tools-chips-container callbacks-list">
              {agentConfig.callbacks && agentConfig.callbacks.length > 0 ? (
                <div className="callbacks-list">
                  {agentConfig.callbacks.map(callback => (
                    <button
                      key={callback.name}
                      type="button"
                      className="callback-row callback-row-button"
                      onClick={() => handleSelectItem('callback', callback.name)}
                    >
                      <div className="callback-chip">
                        <span className="chip-content">
                          <span className="chip-type">{callback.type}</span>
                          <span className="chip-name">{callback.name}</span>
                        </span>
                      </div>
                    </button>
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
          <div className={`builder-tab-rail ${isTabRailCollapsed ? 'collapsed' : ''}`} role="tablist" aria-orientation="vertical">
            <button
              type="button"
              className="builder-tab-rail-scroll"
              onClick={() => scrollTabRailBy(-80)}
              disabled={!canScrollTabRailUp}
              aria-label="Scroll tabs up"
            >
              <span className="material-symbols-outlined" aria-hidden>
                expand_less
              </span>
            </button>
            <div className="builder-tab-rail-scroll-area" ref={tabRailRef}>
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
            <button
              type="button"
              className="builder-tab-rail-scroll"
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
              className="builder-tab-rail-collapse"
              onClick={() => setIsTabRailCollapsed((prev) => !prev)}
              aria-label={isTabRailCollapsed ? 'Expand tabs' : 'Collapse tabs'}
            >
              <span className="material-symbols-outlined" aria-hidden>
                {isTabRailCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
          <div className="builder-tab-body">
            <div className="agent-breadcrumb-container">
          <div className="breadcrumb-chip current-agent">
            {agentConfig.name}
          </div>
        </div>
            <div className="content-wrapper">
              {renderTabContent()}
            </div>
            <div className="action-buttons">
              <button className="save-button" onClick={saveChanges}>Save</button>
              <button className="cancel-button" onClick={cancelChanges}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderTabsComponent;
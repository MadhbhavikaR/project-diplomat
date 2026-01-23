/**
 * Add Tool Dialog Component
 * 
 * A dialog component for adding/editing tools with support for different tool types.
 * This component handles both function tools and built-in tools with validation
 * and integration with the tool management system.
 */

import React, { useState, useEffect } from 'react';
import './AddToolDialogComponent.css';

// Define TypeScript interfaces
interface ToolInfo {
  shortDescription: string;
  detailedDescription: string;
  docLink: string;
}

interface AddToolDialogProps {
  isOpen: boolean;
  toolType: string;
  toolName?: string;
  isEditMode?: boolean;
  onAddTool: (toolData: { toolType: string; name: string; isEditMode: boolean }) => void;
  onCancel: () => void;
}

// Mock tool information data (similar to TooltipUtil.getToolDetailedInfo)
const TOOL_INFO: Record<string, ToolInfo> = {
  'Function tool': {
    shortDescription: 'Custom function tools for executing specific tasks',
    detailedDescription: 'Function tools allow you to define custom functions that can be executed by agents. These functions can perform specific tasks, process data, or integrate with external systems. Function tools are highly flexible and can be tailored to your specific requirements.',
    docLink: 'https://developer.example.com/tools/function'
  },
  'Built-in tool': {
    shortDescription: 'Pre-built tools with specialized functionality',
    detailedDescription: 'Built-in tools provide pre-configured functionality for common tasks such as web searching, file operations, memory management, and AI integrations. These tools are optimized for performance and reliability, and can be easily integrated into your agents without additional configuration.',
    docLink: 'https://developer.example.com/tools/built-in'
  },
  'Agent tool': {
    shortDescription: 'Agent tools for calling other agents',
    detailedDescription: 'Agent tools allow you to invoke other agents as tools within a workflow. Use this when you want to delegate sub-tasks to specialized agents.',
    docLink: 'https://developer.example.com/tools/agent'
  }
};

// List of built-in tools
const BUILT_IN_TOOLS = [
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

const AddToolDialogComponent: React.FC<AddToolDialogProps> = ({
  isOpen,
  toolType,
  toolName,
  isEditMode = false,
  onAddTool,
  onCancel
}) => {
  const [toolNameInput, setToolNameInput] = useState('');
  const [selectedBuiltInTool, setSelectedBuiltInTool] = useState('google_search');
  const [isToolInfoExpanded, setIsToolInfoExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form based on props
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      if (isEditMode && toolName) {
        if (toolType === 'Built-in tool') {
          setSelectedBuiltInTool(toolName);
        } else {
          setToolNameInput(toolName);
        }
      } else {
        setToolNameInput('');
        setSelectedBuiltInTool('google_search');
      }
      setIsToolInfoExpanded(false);
    }
  }, [isOpen, isEditMode, toolName, toolType]);

  const getToolInfo = (): ToolInfo | null => {
    return TOOL_INFO[toolType] || null;
  };

  const toggleToolInfo = () => {
    setIsToolInfoExpanded(!isToolInfoExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = {
        toolType,
        isEditMode,
        name: toolType === 'Built-in tool' ? selectedBuiltInTool : toolNameInput.trim()
      };

      onAddTool(result);
    } catch (error) {
      console.error('Error adding tool:', error);
      setIsSubmitting(false);
    }
  };

  const isCreateDisabled = (): boolean => {
    return toolType !== 'Built-in tool' && !toolNameInput.trim();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isCreateDisabled()) {
        handleSubmit(e as any);
      }
    }
  };

  if (!isOpen) return null;

  const toolInfo = getToolInfo();

  return (
    <div className="add-tool-dialog">
      <h2 className="dialog-title">
        {isEditMode ? 'Editing Tool' : 'Add New Tool'}
      </h2>

      <div className="dialog-content">
        {/* Tool Information Section */}
        {toolInfo && (
          <div className="tool-info-container">
            <div className="tool-info-header" onClick={toggleToolInfo}>
              <span className="tool-info-icon material-symbols-outlined" aria-hidden>
                info
              </span>
              <div className="tool-info-title">
                <span>Tool Information</span>
              </div>
              <button
                type="button"
                className="tool-info-toggle"
                onClick={(e) => { e.stopPropagation(); toggleToolInfo(); }}
                aria-label="Toggle tool information"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {isToolInfoExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            <div className={`tool-info-body ${isToolInfoExpanded ? 'expanded' : ''}`}>
              <div className="tool-info-content">
                <div className="tool-info-short">{toolInfo.shortDescription}</div>
                <div className="tool-info-detailed">{toolInfo.detailedDescription}</div>
              </div>
              <div className="tool-info-link-container">
                <a
                  href={toolInfo.docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tool-info-link"
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    open_in_new
                  </span>
                  <span>View Official Documentation</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Function Tool Form */}
        {toolType !== 'Built-in tool' && (
          <div className="form-field">
            <input
              type="text"
              id="toolName"
              className="form-input"
              value={toolNameInput}
              onChange={(e) => setToolNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${toolType.toLowerCase()} name`}
              autoFocus
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Built-in Tool Selector */}
        {toolType === 'Built-in tool' && (
          <div className="form-field">
            <select
              id="builtInTool"
              className="form-select"
              value={selectedBuiltInTool}
              onChange={(e) => setSelectedBuiltInTool(e.target.value)}
              disabled={isSubmitting}
            >
              {BUILT_IN_TOOLS.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            onClick={handleSubmit}
            disabled={isCreateDisabled() || isSubmitting}
          >
            {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToolDialogComponent;
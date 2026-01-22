import React, { useState, useEffect } from 'react'
import './SidePanelComponent.css'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'

// Define TypeScript interfaces for component props
interface SidePanelProps {
  appName: string
  userId: string
  sessionId: string
  traceData: any[]
  eventData: Map<string, any>
  currentSessionState: any
  artifacts: any[]
  selectedEventIndex?: number
  renderedEventGraph?: string
  rawSvgString?: string | null
  llmRequest?: any
  llmResponse?: any
  showSidePanel: boolean
  isApplicationSelectorEnabled: boolean
  apps: string[]
  isLoadingApps: boolean
  selectedApp: string
  isBuilderMode: boolean
  disableBuilderIcon: boolean
  onClosePanel: () => void
  onAppSelectionChange: (event: any) => void
  onTabChange: (event: any) => void
  onEventSelected: (eventId: string) => void
  onSessionSelected: (session: any) => void
  onSessionReloaded: (session: any) => void
  onEvalCaseSelected: (evalCase: any) => void
  onEvalSetIdSelected: (evalSetId: string) => void
  onReturnToSession: (returnToSession: boolean) => void
  onEvalNotInstalled: (message: string) => void
  onPageChange: (event: any) => void
  onCloseSelectedEvent: () => void
  onOpenImageDialog: (imageUrl: string | null) => void
  onOpenAddItemDialog: (open: boolean) => void
  onEnterBuilderMode: (enter: boolean) => void
}

const SidePanelComponent: React.FC<SidePanelProps> = ({
  appName,
  userId,
  sessionId,
  traceData,
  eventData,
  currentSessionState,
  artifacts,
  selectedEventIndex,
  renderedEventGraph,
  rawSvgString,
  llmRequest,
  llmResponse,
  showSidePanel,
  isApplicationSelectorEnabled,
  apps,
  isLoadingApps,
  selectedApp,
  isBuilderMode,
  disableBuilderIcon,
  onClosePanel,
  onAppSelectionChange,
  onTabChange,
  onEventSelected,
  onSessionSelected,
  onSessionReloaded,
  onEvalCaseSelected,
  onEvalSetIdSelected,
  onReturnToSession,
  onEvalNotInstalled,
  onPageChange,
  onCloseSelectedEvent,
  onOpenImageDialog,
  onOpenAddItemDialog,
  onEnterBuilderMode
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  // Access Zustand store state and actions
  const isSessionLoading = useStore(state => state.isSessionLoading)
  const currentSession = useStore(state => state.currentSession)
  const setCurrentSession = useStore(state => state.setCurrentSession)
  const selectedEvent = useStore(state => state.selectedEvent)
  const setSelectedEvent = useStore(state => state.setSelectedEvent)
  const uiState = useStore(state => state.uiState)
  const setUiState = useStore(state => state.setUiState)

  // Filter apps based on search term
  const filteredApps = apps.filter(app =>
    app.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTabChange = (index: number) => {
    setActiveTab(index)
    onTabChange({ index })
    
    // Add routing based on tab selection
    switch (index) {
      case 0:
        navigate('/sessions')
        break
      case 1:
        navigate('/trace')
        break
      case 2:
        navigate('/events')
        break
      case 3:
        navigate('/state')
        break
      case 4:
        navigate('/artifacts')
        break
      default:
        navigate('/')
    }
  }

  const handleAppChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onAppSelectionChange(event)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  if (isSessionLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    )
  }

  if (!showSidePanel) {
    return null
  }

  return (
    <div className="side-panel">
      {/* Header with logo and controls */}
      <div className="panel-header">
        <div className="panel-logo">
          <div className="logo-content">
            <img src="/assets/ADK-512-color.svg" width="32" height="32" alt="ADK Logo" />
            <span className="logo-text">Agent Development Kit</span>
          </div>
        </div>
        <div className="panel-controls">
          <button
            className="close-button"
            onClick={onClosePanel}
            title="Collapse panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* App selector */}
      {isApplicationSelectorEnabled && (
        <div className="app-selector">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <select
            value={selectedApp}
            onChange={handleAppChange}
            disabled={isLoadingApps}
            className="app-select"
          >
            <option value="" disabled>
              {isLoadingApps ? 'Loading...' : 'Select an agent'}
            </option>
            {filteredApps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>

          {!isBuilderMode && (
            <div className="mode-controls">
              <button
                className="add-button"
                onClick={() => onOpenAddItemDialog(true)}
                title="Create new agent"
              >
                +
              </button>
              <button
                className={`edit-button ${disableBuilderIcon ? 'disabled' : ''}`}
                onClick={() => !disableBuilderIcon && onEnterBuilderMode(true)}
                title={disableBuilderIcon ? 'This agent was not built by builder' : 'Edit in Builder Mode'}
                disabled={disableBuilderIcon}
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content - Tabs */}
      {appName && (
        <div className="tabs-container">
          <div className="tab-header">
            <button
              className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => handleTabChange(0)}
            >
              Sessions
            </button>
            <button
              className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => handleTabChange(1)}
            >
              Trace
            </button>
            <button
              className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => handleTabChange(2)}
            >
              Events
            </button>
            <button
              className={`tab-button ${activeTab === 3 ? 'active' : ''}`}
              onClick={() => handleTabChange(3)}
            >
              State
            </button>
            <button
              className={`tab-button ${activeTab === 4 ? 'active' : ''}`}
              onClick={() => handleTabChange(4)}
            >
              Artifacts
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 0 && (
              <div className="session-tab">
                <p>Sessions content</p>
                {/* Session tab content will be implemented */}
              </div>
            )}
            {activeTab === 1 && (
              <div className="trace-tab">
                <p>Trace content</p>
                {/* Trace tab content will be implemented */}
              </div>
            )}
            {activeTab === 2 && (
              <div className="events-tab">
                <p>Events content</p>
                {/* Events tab content will be implemented */}
              </div>
            )}
            {activeTab === 3 && (
              <div className="state-tab">
                <p>State content</p>
                {/* State tab content will be implemented */}
              </div>
            )}
            {activeTab === 4 && (
              <div className="artifacts-tab">
                <p>Artifacts content</p>
                {/* Artifacts tab content will be implemented */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event details panel */}
      {selectedEvent && (
        <div className="event-details-panel">
          <div className="event-details-header">
            <button
              className="close-event-button"
              onClick={onCloseSelectedEvent}
            >
              ×
            </button>
          </div>
          <div className="event-details-content">
            <h3>Event Details</h3>
            <div className="json-viewer">
              <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SidePanelComponent
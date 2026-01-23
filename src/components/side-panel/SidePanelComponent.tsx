import React, { useEffect, useMemo, useRef, useState } from 'react'
import './SidePanelComponent.css'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'
import SessionTabComponent from '../session-tab/SessionTabComponent'
import TraceTabComponent from '../trace-tab/TraceTabComponent'
import EventTabComponent from '../event-tab/EventTabComponent'
import BuilderTabsComponent from '../builder-tabs/BuilderTabsComponent'

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
  onTabChange: (index: number) => void
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
  onEnterBuilderMode,
}) => {
  const isSessionLoading = useStore(state => state.isSessionLoading)
  const currentSession = useStore(state => state.currentSession)
  const setCurrentSession = useStore(state => state.setCurrentSession)
  const selectedEvent = useStore(state => state.selectedEvent)
  const setSelectedEvent = useStore(state => state.setSelectedEvent)
  const uiState = useStore(state => state.uiState)
  const setUiState = useStore(state => state.setUiState)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false)
  const agentMenuRef = useRef<HTMLDivElement | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(0)
  const tabRailRef = useRef<HTMLDivElement | null>(null)
  const [canScrollTabRailUp, setCanScrollTabRailUp] = useState(false)
  const [canScrollTabRailDown, setCanScrollTabRailDown] = useState(false)
  const [panelWidth, setPanelWidth] = useState<number>(
    typeof uiState?.sidePanelWidth === 'number' ? uiState.sidePanelWidth : 320
  )
  const [isTabRailCollapsed, setIsTabRailCollapsed] = useState(false)

  // Filter apps based on search term
  const filteredApps = apps.filter(app =>
    app.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeAppLabel = useMemo(() => {
    return selectedApp || 'Select an agent'
  }, [selectedApp])

  const handleTabChange = (index: number) => {
    setActiveTab(index)
    onTabChange(index)
    
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

  const updateTabRailScroll = () => {
    const rail = tabRailRef.current
    if (!rail) return
    setCanScrollTabRailUp(rail.scrollTop > 0)
    setCanScrollTabRailDown(rail.scrollTop + rail.clientHeight < rail.scrollHeight - 1)
  }

  const scrollTabRailBy = (delta: number) => {
    const rail = tabRailRef.current
    if (!rail) return
    rail.scrollBy({ top: delta, behavior: 'smooth' })
  }

  useEffect(() => {
    updateTabRailScroll()
    const rail = tabRailRef.current
    if (!rail) return
    const handleScroll = () => updateTabRailScroll()
    rail.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      rail.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [activeTab, appName, showSidePanel])

  const handleAppChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onAppSelectionChange(event)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSelectAgent = (app: string) => {
    onAppSelectionChange({ target: { value: app } })
    setSearchTerm('')
    setIsAgentMenuOpen(false)
  }

  useEffect(() => {
    if (!isAgentMenuOpen) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (!agentMenuRef.current?.contains(event.target as Node)) {
        setIsAgentMenuOpen(false)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isAgentMenuOpen])

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsResizing(true)
    resizeStartX.current = event.clientX
    resizeStartWidth.current = panelWidth
  }

  useEffect(() => {
    if (!isResizing) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - resizeStartX.current
      const nextWidth = Math.min(520, Math.max(240, resizeStartWidth.current + delta))
      setPanelWidth(nextWidth)
      setUiState({ ...(uiState || {}), sidePanelWidth: nextWidth })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, panelWidth, setUiState, uiState])

  if (isSessionLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner" data-testid="spinner"></div>
        <p>Loading session...</p>
      </div>
    )
  }

  if (!showSidePanel) {
    return null
  }

  return (
    <div className="side-panel" style={{ width: panelWidth }}>
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
            aria-label="Collapse panel"
          >
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>
        </div>
      </div>

      {/* App selector */}
      {isApplicationSelectorEnabled && (
        <div className="app-selector">
          <div className="app-dropdown" ref={agentMenuRef}>
            <button
              type="button"
              className="app-dropdown-button"
              onClick={() => setIsAgentMenuOpen((open) => !open)}
              aria-label="Toggle agent selector"
            >
              {activeAppLabel}
              <span className="app-dropdown-caret material-symbols-outlined" aria-hidden>
                expand_more
              </span>
            </button>
            {isAgentMenuOpen && (
              <div className="app-dropdown-menu" role="listbox">
                <div className="app-dropdown-input">
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                    disabled={isLoadingApps}
                  />
                </div>
                <div className="app-dropdown-list">
                  {isLoadingApps && (
                    <div className="app-dropdown-empty">Loading...</div>
                  )}
                  {!isLoadingApps && filteredApps.length === 0 && (
                    <div className="app-dropdown-empty">No agents found</div>
                  )}
                  {!isLoadingApps && filteredApps.map(app => (
                    <button
                      key={app}
                      type="button"
                      className={`app-dropdown-item ${app === selectedApp ? 'active' : ''}`}
                      onClick={() => handleSelectAgent(app)}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isBuilderMode && (
            <div className="mode-controls">
              <button
                className="add-button"
                onClick={() => onOpenAddItemDialog(true)}
                title="Create new agent"
                aria-label="Create new agent"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  add
                </span>
              </button>
              <button
                className={`edit-button ${disableBuilderIcon ? 'disabled' : ''}`}
                onClick={() => !disableBuilderIcon && onEnterBuilderMode(true)}
                title={disableBuilderIcon ? 'This agent was not built by builder' : 'Edit in Builder Mode'}
                disabled={disableBuilderIcon}
                aria-label="Edit in Builder Mode"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  edit
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content - Tabs */}
      {appName && (
        <div className="tabs-container">
          {isBuilderMode ? (
            <div className="tab-content builder-tab-content">
              <BuilderTabsComponent />
            </div>
          ) : (
            <>
              <div className="tab-layout">
                <div className={`tab-rail ${isTabRailCollapsed ? 'collapsed' : ''}`} role="tablist" aria-orientation="vertical">
                  <button
                    type="button"
                    className="tab-rail-scroll"
                    onClick={() => scrollTabRailBy(-80)}
                    disabled={!canScrollTabRailUp}
                    aria-label="Scroll tabs up"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      expand_less
                    </span>
                  </button>
                  <div className="tab-rail-scroll-area" ref={tabRailRef}>
                    <button
                      className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
                      onClick={() => handleTabChange(0)}
                      aria-label="Sessions"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        forum
                      </span>
                      <span className="tab-label">Sessions</span>
                    </button>
                    <button
                      className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                      onClick={() => handleTabChange(1)}
                      aria-label="Trace"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        timeline
                      </span>
                      <span className="tab-label">Trace</span>
                    </button>
                    <button
                      className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                      onClick={() => handleTabChange(2)}
                      aria-label="Events"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        event_note
                      </span>
                      <span className="tab-label">Events</span>
                    </button>
                    <button
                      className={`tab-button ${activeTab === 3 ? 'active' : ''}`}
                      onClick={() => handleTabChange(3)}
                      aria-label="State"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        data_object
                      </span>
                      <span className="tab-label">State</span>
                    </button>
                    <button
                      className={`tab-button ${activeTab === 4 ? 'active' : ''}`}
                      onClick={() => handleTabChange(4)}
                      aria-label="Artifacts"
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        inventory_2
                      </span>
                      <span className="tab-label">Artifacts</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="tab-rail-scroll"
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
                    className="tab-rail-collapse"
                    onClick={() => setIsTabRailCollapsed((prev) => !prev)}
                    aria-label={isTabRailCollapsed ? 'Expand tabs' : 'Collapse tabs'}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {isTabRailCollapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                  </button>
                </div>

                <div className="tab-content">
                {activeTab === 0 && (
                  <div className="session-tab">
                    <SessionTabComponent
                      userId={userId}
                      appName={appName}
                      sessionId={sessionId}
                      onSessionSelected={onSessionSelected}
                      onSessionReloaded={onSessionReloaded}
                    />
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="trace-tab">
                    <TraceTabComponent traceData={traceData as any[]} sessionId={sessionId} />
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="events-tab">
                    <EventTabComponent
                      eventsMap={eventData}
                      traceData={traceData as any[]}
                      sessionId={sessionId}
                      onSelectedEvent={onEventSelected}
                    />
                  </div>
                )}
                {activeTab === 3 && (
                  <div className="state-tab">
                    {currentSessionState ? (
                      <pre className="state-json">{JSON.stringify(currentSessionState, null, 2)}</pre>
                    ) : (
                      <p className="state-empty">No state data available.</p>
                    )}
                  </div>
                )}
                {activeTab === 4 && (
                  <div className="artifacts-tab">
                    {artifacts.length ? (
                      <ul className="artifacts-list">
                        {artifacts.map((artifact, index) => (
                          <li key={index}>{artifact?.name || `Artifact ${index + 1}`}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="artifacts-empty">No artifacts available.</p>
                    )}
                  </div>
                )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Event details panel */}
      {selectedEvent && (
        <div className="event-details-panel">
          <div className="event-details-header">
            <button
              className="close-event-button"
              onClick={onCloseSelectedEvent}
              aria-label="Close event details"
            >
              <span className="material-symbols-outlined" aria-hidden>
                close
              </span>
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
      <div className="side-panel-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  )
}
export default SidePanelComponent
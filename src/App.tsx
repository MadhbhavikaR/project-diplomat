import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import './App.css'
import ChatComponent from './components/chat/ChatComponent'
import SidePanelComponent from './components/side-panel/SidePanelComponent'
import EventTabComponent from './components/event-tab/EventTabComponent'
import SessionTabComponent from './components/session-tab/SessionTabComponent'
import TraceTabComponent from './components/trace-tab/TraceTabComponent'
import GitStatusBarComponent from './components/git-status-bar/GitStatusBarComponent'
import BuilderTabsComponent from './components/builder-tabs/BuilderTabsComponent'
import CanvasComponent from './components/canvas/CanvasComponent'
import BuilderAssistantComponent from './components/builder-assistant/BuilderAssistantComponent'
import { theme } from './theme/theme'
import type { QueryClient } from '@tanstack/react-query'

interface AppProps {
  queryClient: QueryClient
}

function App({ queryClient }: AppProps) {
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [, setSelectedEvent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [sessionId] = useState('session1')
  const [isBuilderMode, setIsBuilderMode] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  // Mock data for demonstration
  const mockApps = ['App 1', 'App 2', 'App 3']
  const mockEvents = new Map([
    ['event1', { id: 'event1', title: 'Event 1', data: { key: 'value1' } }],
    ['event2', { id: 'event2', title: 'Event 2', data: { key: 'value2' } }],
  ])
  const mockTraceData: any[] = []

  const handleClosePanel = () => {
    setShowSidePanel(false)
  }

  const handleEventSelected = (eventId: string) => {
    // Find the event from the mock data
    const event = Array.from(mockEvents.values()).find(e => e.id === eventId)
    setSelectedEvent(event || null)
  }

  const handleTabChange = (index: number) => {
    setActiveTab(index)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app-container">
          {/* Side Panel - Left side */}
          {showSidePanel ? (
            <div className="side-panel-container">
              <SidePanelComponent
                appName="ADK Demo"
                userId="user123"
                sessionId="session456"
                traceData={[]}
                eventData={mockEvents}
                currentSessionState={null}
                artifacts={[]}
                selectedEventIndex={0}
                renderedEventGraph={undefined}
                rawSvgString={null}
                llmRequest={null}
                llmResponse={null}
                showSidePanel={showSidePanel}
                isApplicationSelectorEnabled={true}
                apps={mockApps}
                isLoadingApps={false}
                selectedApp={mockApps[0]}
                isBuilderMode={isBuilderMode}
                disableBuilderIcon={false}
                onClosePanel={handleClosePanel}
                onAppSelectionChange={(e) => console.log('App changed:', e)}
                onTabChange={handleTabChange}
                onEventSelected={handleEventSelected}
                onSessionSelected={(session) => console.log('Session selected:', session)}
                onSessionReloaded={(session) => console.log('Session reloaded:', session)}
                onEvalCaseSelected={(evalCase) => console.log('Eval case selected:', evalCase)}
                onEvalSetIdSelected={(evalSetId) => console.log('Eval set ID selected:', evalSetId)}
                onReturnToSession={(returnToSession) => console.log('Return to session:', returnToSession)}
                onEvalNotInstalled={(message) => console.log('Eval not installed:', message)}
                onPageChange={(event) => console.log('Page changed:', event)}
                onCloseSelectedEvent={() => setSelectedEvent(null)}
                onOpenImageDialog={(imageUrl) => console.log('Open image dialog:', imageUrl)}
                onOpenAddItemDialog={(open) => console.log('Open add item dialog:', open)}
                onEnterBuilderMode={(enter) => setIsBuilderMode(enter)}
              />
            </div>
          ) : (
            <button
              className="side-panel-toggle"
              onClick={() => setShowSidePanel(true)}
              aria-label="Expand side panel"
            >
              ☰
            </button>
          )}

          {/* Main Content Area */}
          <div className="main-content">
            <GitStatusBarComponent repoPath="/repo" />
            {isBuilderMode ? (
              <div className="builder-layout">
                <div className="builder-toolbar">
                  <button
                    className="builder-exit"
                    onClick={() => setIsBuilderMode(false)}
                  >
                    Exit Builder
                  </button>
                  <button
                    className="builder-assistant-toggle"
                    onClick={() => setIsAssistantOpen(true)}
                  >
                    Open Assistant
                  </button>
                </div>
                <div className="builder-content">
                  <div className="builder-canvas">
                    <CanvasComponent />
                  </div>
                  <div className="builder-tabs">
                    <BuilderTabsComponent />
                  </div>
                  <BuilderAssistantComponent
                    isVisible={isAssistantOpen}
                    appName="ADK Demo"
                    onClosePanel={() => setIsAssistantOpen(false)}
                    onReloadCanvas={() => undefined}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Chat Panel - Top area */}
                <div className="chat-panel-container">
                  <ChatComponent />
                </div>

                {/* Session Tab - Bottom area (visible when sessions tab is active) */}
                {activeTab === 0 && (
                  <div className="session-tab-container">
                    <SessionTabComponent
                      userId="user123"
                      appName="ADK Demo"
                      sessionId={sessionId}
                      onSessionSelected={(session) => console.log('Session selected:', session)}
                      onSessionReloaded={(session) => console.log('Session reloaded:', session)}
                    />
                  </div>
                )}

                {/* Event Tab - Bottom area (visible when events tab is active) */}
                {activeTab === 1 && (
                  <div className="event-tab-container">
                    <TraceTabComponent traceData={[]} sessionId={sessionId} />
                  </div>
                )}

                {/* Event Tab - Bottom area (visible when events tab is active) */}
                {activeTab === 2 && (
                  <div className="event-tab-container">
                    <EventTabComponent
                      eventsMap={mockEvents}
                      traceData={mockTraceData}
                      sessionId={sessionId}
                      onSelectedEvent={handleEventSelected}
                    />
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

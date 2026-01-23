import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import './App.css'
import ChatComponent from './components/chat/ChatComponent'
import SidePanelComponent from './components/side-panel/SidePanelComponent'
import GitStatusBarComponent from './components/git-status-bar/GitStatusBarComponent'
import CanvasComponent from './components/canvas/CanvasComponent'
import BuilderAssistantComponent from './components/builder-assistant/BuilderAssistantComponent'
import FileExplorerComponent from './components/file-explorer/FileExplorerComponent'
import FileTabsComponent from './components/file-tabs/FileTabsComponent'
import MonacoEditorComponent from './components/monaco-editor/MonacoEditorComponent'
import { theme } from './theme/theme'
import type { QueryClient } from '@tanstack/react-query'
import { useStore } from './store/store'
import { repoService } from './services/repoService'

interface AppProps {
  queryClient: QueryClient
}

function App({ queryClient }: AppProps) {
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [, setSelectedEvent] = useState<any>(null)
  const [sessionId] = useState('session1')
  const [isBuilderMode, setIsBuilderMode] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [topMode, setTopMode] = useState<'edit' | 'test'>('edit')

  const openFiles = useStore(state => state.openFiles)
  const activeFile = useStore(state => state.activeFile)
  const updateFileContent = useStore(state => state.updateFileContent)
  const markSaved = useStore(state => state.markSaved)

  const activeTabData = activeFile ? openFiles[activeFile] : null

  useEffect(() => {
    const applyButtonTitles = () => {
      const buttons = document.querySelectorAll('button')
      buttons.forEach((button) => {
        if (button.getAttribute('title')) {
          return
        }

        const ariaLabel = button.getAttribute('aria-label')
        if (ariaLabel) {
          button.setAttribute('title', ariaLabel)
          return
        }

        const text = (button.textContent || '').trim()
        if (text) {
          button.setAttribute('title', text)
        }
      })
    }

    applyButtonTitles()

    const observer = new MutationObserver(() => {
      applyButtonTitles()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleSaveActive = async () => {
    if (!activeTabData) return

    try {
      await repoService.saveFile(activeTabData.path, activeTabData.content)
      markSaved(activeTabData.path)
    } catch (error) {
      console.error('Failed to save file', error)
    }
  }

  // Mock data for demonstration
  const mockApps = ['App 1', 'App 2', 'App 3']
  const mockEvents = new Map([
    ['event1', { id: 'event1', title: 'Event 1', data: { key: 'value1' } }],
    ['event2', { id: 'event2', title: 'Event 2', data: { key: 'value2' } }],
  ])
  const handleClosePanel = () => {
    setShowSidePanel(false)
  }

  const handleEventSelected = (eventId: string) => {
    // Find the event from the mock data
    const event = Array.from(mockEvents.values()).find(e => e.id === eventId)
    setSelectedEvent(event || null)
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
                onTabChange={() => undefined}
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
                onOpenAddItemDialog={(open) => {
                  if (open) {
                    setIsBuilderMode(true)
                  }
                }}
                onEnterBuilderMode={(enter) => setIsBuilderMode(enter)}
              />
            </div>
          ) : (
            <button
              className="side-panel-toggle"
              onClick={() => setShowSidePanel(true)}
              aria-label="Expand side panel"
            >
              <span className="material-symbols-outlined" aria-hidden>
                menu
              </span>
            </button>
          )}

          {/* Main Content Area */}
          <div className="main-content">
            <div className="top-mode-tabs" role="tablist">
              <button
                type="button"
                className={`top-mode-tab ${topMode === 'edit' ? 'active' : ''}`}
                aria-selected={topMode === 'edit'}
                onClick={() => setTopMode('edit')}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  edit
                </span>
                Edit Mode
              </button>
              <button
                type="button"
                className={`top-mode-tab ${topMode === 'test' ? 'active' : ''}`}
                aria-selected={topMode === 'test'}
                onClick={() => setTopMode('test')}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  science
                </span>
                Test Mode
              </button>
            </div>
            {!isBuilderMode && topMode === 'edit' && (
              <GitStatusBarComponent repoPath="/repo" />
            )}
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
                {topMode === 'test' && (
                  <div className="chat-panel-container">
                    <ChatComponent />
                  </div>
                )}

                {topMode === 'edit' && (
                  <div className="workspace-container">
                    <div className="workspace-sidebar">
                      <FileExplorerComponent repoPath="/repo" />
                    </div>
                    <div className="workspace-editor">
                      <FileTabsComponent />
                      {activeTabData ? (
                        <div className="editor-shell">
                          <MonacoEditorComponent
                            filePath={activeTabData.path}
                            language={activeTabData.language}
                            value={activeTabData.content}
                            onChange={(value) => updateFileContent(activeTabData.path, value)}
                            onSave={handleSaveActive}
                          />
                        </div>
                      ) : (
                        <div className="editor-empty">Open a file to start editing.</div>
                      )}
                    </div>
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

import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ChatComponent from './components/chat/ChatComponent'
import SidePanelComponent from './components/side-panel/SidePanelComponent'
import ChatPanelComponent from './components/chat-panel/ChatPanelComponent'
import EventTabComponent from './components/event-tab/EventTabComponent'
import SessionTabComponent from './components/session-tab/SessionTabComponent'

function App() {
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [, setSelectedEvent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [sessionId] = useState('session1')

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
    <div className="app-container">
      {/* Side Panel - Left side */}
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
          isBuilderMode={false}
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
          onEnterBuilderMode={(enter) => console.log('Enter builder mode:', enter)}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Chat Panel - Top area */}
        <div className="chat-panel-container">
          <ChatPanelComponent
            appName="ADK Demo"
            sessionName="Demo Session"
            messages={[]}
            isChatMode={true}
            evalCase={null}
            isEvalEditMode={false}
            isEvalCaseEditing={false}
            isEditFunctionArgsEnabled={false}
            userInput=""
            userEditEvalCaseMessage=""
            selectedFiles={[]}
            updatedSessionState={null}
            eventData={new Map()}
            isAudioRecording={false}
            isVideoRecording={false}
            hoveredEventMessageIndices={[]}
            onUserInputChange={(input) => console.log('User input changed:', input)}
            onUserEditEvalCaseMessageChange={(message) => console.log('Edit eval case message:', message)}
            onClickEvent={(index) => console.log('Event clicked:', index)}
            onHandleKeydown={(event) => console.log('Key down:', event)}
            onCancelEditMessage={(message) => console.log('Cancel edit message:', message)}
            onSaveEditMessage={(message) => console.log('Save edit message:', message)}
            onOpenViewImageDialog={(imageUrl) => console.log('Open view image dialog:', imageUrl)}
            onOpenBase64InNewTab={(data) => console.log('Open base64 in new tab:', data)}
            onEditEvalCaseMessage={(message) => console.log('Edit eval case message:', message)}
            onDeleteEvalCaseMessage={(params) => console.log('Delete eval case message:', params)}
            onEditFunctionArgs={(args) => console.log('Edit function args:', args)}
            onFileSelect={(event) => console.log('File selected:', event)}
            onRemoveFile={(index) => console.log('Remove file:', index)}
            onRemoveStateUpdate={() => console.log('Remove state update')}
            onSendMessage={(event) => console.log('Send message:', event)}
            onUpdateState={() => console.log('Update state')}
            onToggleAudioRecording={() => console.log('Toggle audio recording')}
            onToggleVideoRecording={() => console.log('Toggle video recording')}
            onFeedback={(direction) => console.log('Feedback:', direction)}
          />
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
        {activeTab === 2 && (
          <div className="event-tab-container">
            <EventTabComponent
              eventsMap={mockEvents}
              traceData={mockTraceData}
              onSelectedEvent={handleEventSelected}
            />
          </div>
        )}

        <Routes>
          <Route path="/" element={<ChatComponent />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

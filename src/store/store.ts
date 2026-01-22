import { create } from 'zustand'

// Define the UI state interface
interface UIState {
  isSessionLoading: boolean
  isEventRequestResponseLoading: boolean
  isMessagesLoading: boolean
  isLoadingAgentResponse: boolean
  isUserFeedbackEnabled: boolean
  isMessageFileUploadEnabled: boolean
  isManualStateUpdateEnabled: boolean
  isBidiStreamingEnabled: boolean
  canEditSession: boolean
  isTraceEnabled: boolean
  currentSession: any | null
  selectedEvent: any | null
  uiState: any
  setSessionLoading: (loading: boolean) => void
  setEventRequestResponseLoading: (loading: boolean) => void
  setMessagesLoading: (loading: boolean) => void
  setLoadingAgentResponse: (loading: boolean) => void
  setUserFeedbackEnabled: (enabled: boolean) => void
  setMessageFileUploadEnabled: (enabled: boolean) => void
  setManualStateUpdateEnabled: (enabled: boolean) => void
  setBidiStreamingEnabled: (enabled: boolean) => void
  setCanEditSession: (canEdit: boolean) => void
  setCurrentSession: (session: any | null) => void
  setSelectedEvent: (event: any | null) => void
  setUiState: (state: any) => void
}

// Create the UI state store
export const useStore = create<UIState>((set) => ({
  isSessionLoading: false,
  isEventRequestResponseLoading: false,
  isMessagesLoading: false,
  isLoadingAgentResponse: false,
  isUserFeedbackEnabled: true,
  isMessageFileUploadEnabled: true,
  isManualStateUpdateEnabled: true,
  isBidiStreamingEnabled: false,
  canEditSession: true,
  isTraceEnabled: true,
  currentSession: null,
  selectedEvent: null,
  uiState: {},
  setSessionLoading: (loading) => set({ isSessionLoading: loading }),
  setEventRequestResponseLoading: (loading) => set({ isEventRequestResponseLoading: loading }),
  setMessagesLoading: (loading) => set({ isMessagesLoading: loading }),
  setLoadingAgentResponse: (loading) => set({ isLoadingAgentResponse: loading }),
  setUserFeedbackEnabled: (enabled) => set({ isUserFeedbackEnabled: enabled }),
  setMessageFileUploadEnabled: (enabled) => set({ isMessageFileUploadEnabled: enabled }),
  setManualStateUpdateEnabled: (enabled) => set({ isManualStateUpdateEnabled: enabled }),
  setBidiStreamingEnabled: (enabled) => set({ isBidiStreamingEnabled: enabled }),
  setCanEditSession: (canEdit) => set({ canEditSession: canEdit }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setUiState: (state) => set({ uiState: state })
}))

// Export the UIState type
export type { UIState }
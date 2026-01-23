import type { StateCreator } from 'zustand'

export interface UiSlice {
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
  isSessionFilteringEnabled: boolean
  isSessionListLoading: boolean
  assistantMode: 'plan' | 'act'
  currentSession: unknown | null
  selectedEvent: unknown | null
  uiState: Record<string, unknown>
  setSessionLoading: (loading: boolean) => void
  setEventRequestResponseLoading: (loading: boolean) => void
  setMessagesLoading: (loading: boolean) => void
  setLoadingAgentResponse: (loading: boolean) => void
  setUserFeedbackEnabled: (enabled: boolean) => void
  setMessageFileUploadEnabled: (enabled: boolean) => void
  setManualStateUpdateEnabled: (enabled: boolean) => void
  setBidiStreamingEnabled: (enabled: boolean) => void
  setCanEditSession: (canEdit: boolean) => void
  setCurrentSession: (session: unknown | null) => void
  setSelectedEvent: (event: unknown | null) => void
  setUiState: (state: Record<string, unknown>) => void
  setSessionFilteringEnabled: (enabled: boolean) => void
  setSessionListLoading: (loading: boolean) => void
  setAssistantMode: (mode: 'plan' | 'act') => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
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
  isSessionFilteringEnabled: true,
  isSessionListLoading: false,
  assistantMode: 'plan',
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
  setUiState: (state) => set({ uiState: state }),
  setSessionFilteringEnabled: (enabled) => set({ isSessionFilteringEnabled: enabled }),
  setSessionListLoading: (loading) => set({ isSessionListLoading: loading }),
  setAssistantMode: (mode) => set({ assistantMode: mode }),
})

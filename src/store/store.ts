import { create } from 'zustand'
import { createEditorSlice, type EditorSlice } from './editorSlice'
import { createSessionSlice, type SessionSlice } from './sessionSlice'
import { createUiSlice, type UiSlice } from './uiSlice'

export type AppState = UiSlice & SessionSlice & EditorSlice

export const useStore = create<AppState>()((...args) => ({
  ...createUiSlice(...args),
  ...createSessionSlice(...args),
  ...createEditorSlice(...args),
}))
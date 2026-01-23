import { create } from 'zustand'
import { createEditorSlice, type EditorSlice } from './editorSlice'
import { createSessionSlice, type SessionSlice } from './sessionSlice'
import { createUiSlice, type UiSlice } from './uiSlice'
import { createBuilderSlice, type BuilderSlice } from './builderSlice'

export type AppState = UiSlice & SessionSlice & EditorSlice & BuilderSlice

export const useStore = create<AppState>()((...args) => ({
  ...createUiSlice(...args),
  ...createSessionSlice(...args),
  ...createEditorSlice(...args),
  ...createBuilderSlice(...args),
}))
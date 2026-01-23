import type { StateCreator } from 'zustand'

export interface EditorTab {
  path: string
  content: string
  language: string
  isDirty: boolean
}

export interface EditorSlice {
  openFiles: Record<string, EditorTab>
  activeFile: string | null
  dirtyFiles: string[]
  openFile: (tab: EditorTab) => void
  closeFile: (path: string) => void
  setActiveFile: (path: string | null) => void
  updateFileContent: (path: string, content: string) => void
  markSaved: (path: string) => void
}

export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set, get) => ({
  openFiles: {},
  activeFile: null,
  dirtyFiles: [],
  openFile: (tab) =>
    set((state) => ({
      openFiles: { ...state.openFiles, [tab.path]: tab },
      activeFile: tab.path,
      dirtyFiles: tab.isDirty ? [...new Set([...state.dirtyFiles, tab.path])] : state.dirtyFiles,
    })),
  closeFile: (path) =>
    set((state) => {
      const { [path]: _, ...remaining } = state.openFiles
      return {
        openFiles: remaining,
        activeFile: state.activeFile === path ? null : state.activeFile,
        dirtyFiles: state.dirtyFiles.filter((filePath) => filePath !== path),
      }
    }),
  setActiveFile: (path) => set({ activeFile: path }),
  updateFileContent: (path, content) =>
    set((state) => {
      const existing = state.openFiles[path]
      if (!existing) {
        return state
      }
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { ...existing, content, isDirty: true },
        },
        dirtyFiles: [...new Set([...state.dirtyFiles, path])],
      }
    }),
  markSaved: (path) =>
    set((state) => {
      const existing = state.openFiles[path]
      if (!existing) {
        return state
      }
      return {
        openFiles: {
          ...state.openFiles,
          [path]: { ...existing, isDirty: false },
        },
        dirtyFiles: state.dirtyFiles.filter((filePath) => filePath !== path),
      }
    }),
})

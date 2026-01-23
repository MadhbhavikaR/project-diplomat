import Editor, { type OnMount } from '@monaco-editor/react'
import { useCallback, useMemo } from 'react'

interface MonacoEditorProps {
  filePath: string
  language: string
  value: string
  onChange: (value: string) => void
  onSave?: () => void
}

const MonacoEditorComponent = ({ filePath, language, value, onChange, onSave }: MonacoEditorProps) => {
  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.()
      })
    },
    [onSave]
  )

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: true },
      folding: true,
      lineNumbers: 'on',
      wordWrap: 'on',
      automaticLayout: true,
    }),
    []
  )

  return (
    <Editor
      height="100%"
      language={language}
      path={filePath}
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? '')}
      onMount={handleMount}
      options={editorOptions}
    />
  )
}

export default MonacoEditorComponent

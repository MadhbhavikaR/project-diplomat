import { useStore } from '../../store/store'
import './FileTabsComponent.css'

const FileTabsComponent = () => {
  const openFiles = useStore(state => state.openFiles)
  const activeFile = useStore(state => state.activeFile)
  const setActiveFile = useStore(state => state.setActiveFile)
  const closeFile = useStore(state => state.closeFile)

  const tabs = Object.values(openFiles)

  if (!tabs.length) {
    return <div className="file-tabs-empty">No files open</div>
  }

  return (
    <div className="file-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`file-tab ${activeFile === tab.path ? 'active' : ''}`}
          onClick={() => setActiveFile(tab.path)}
        >
          <span className="file-tab-name">{tab.path.split('/').pop()}</span>
          {tab.isDirty && <span className="file-tab-dirty">●</span>}
          <button
            className="file-tab-close"
            onClick={(event) => {
              event.stopPropagation()
              closeFile(tab.path)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default FileTabsComponent

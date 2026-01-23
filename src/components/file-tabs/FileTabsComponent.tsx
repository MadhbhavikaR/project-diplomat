import { useStore } from '../../store/store'
import { repoService } from '../../services/repoService'
import './FileTabsComponent.css'

const FileTabsComponent = () => {
  const openFiles = useStore(state => state.openFiles)
  const activeFile = useStore(state => state.activeFile)
  const setActiveFile = useStore(state => state.setActiveFile)
  const closeFile = useStore(state => state.closeFile)
  const markSaved = useStore(state => state.markSaved)

  const tabs = Object.values(openFiles)
  const activeTab = activeFile ? openFiles[activeFile] : null

  const handleSaveActive = async () => {
    if (!activeTab) return

    try {
      await repoService.saveFile(activeTab.path, activeTab.content)
      markSaved(activeTab.path)
    } catch (error) {
      console.error('Failed to save file', error)
    }
  }

  if (!tabs.length) {
    return <div className="file-tabs-empty">No files open</div>
  }

  return (
    <div className="file-tabs">
      <div className="file-tabs-list">
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
      <div className="file-tabs-actions">
        <button
          type="button"
          className="file-tabs-save"
          onClick={handleSaveActive}
          disabled={!activeTab || !activeTab.isDirty}
        >
          Save changes
        </button>
      </div>
    </div>
  )
}

export default FileTabsComponent

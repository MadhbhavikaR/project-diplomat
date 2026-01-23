import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/store'
import { repoService } from '../../services/repoService'
import './FileTabsComponent.css'

const FileTabsComponent = () => {
  const openFiles = useStore(state => state.openFiles)
  const activeFile = useStore(state => state.activeFile)
  const setActiveFile = useStore(state => state.setActiveFile)
  const closeFile = useStore(state => state.closeFile)
  const markSaved = useStore(state => state.markSaved)
  const tabListRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  const updateTabScroll = () => {
    const list = tabListRef.current
    if (!list) return
    setCanScrollLeft(list.scrollLeft > 0)
    setCanScrollRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 1)
  }

  const scrollTabsBy = (delta: number) => {
    const list = tabListRef.current
    if (!list) return
    list.scrollBy({ left: delta, behavior: 'smooth' })
  }

  useEffect(() => {
    updateTabScroll()
    const list = tabListRef.current
    if (!list) return
    const handleScroll = () => updateTabScroll()
    list.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      list.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [tabs.length, activeFile])

  if (!tabs.length) {
    return <div className="file-tabs-empty">No files open</div>
  }

  return (
    <div className="file-tabs">
      <div className="file-tabs-scroller">
        <button
          type="button"
          className="file-tabs-scroll"
          onClick={() => scrollTabsBy(-160)}
          disabled={!canScrollLeft}
          aria-label="Scroll tabs left"
        >
          <span className="material-symbols-outlined" aria-hidden>
            chevron_left
          </span>
        </button>
        <div className="file-tabs-list" ref={tabListRef}>
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
                aria-label="Close file"
                title="Close file"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="file-tabs-scroll"
          onClick={() => scrollTabsBy(160)}
          disabled={!canScrollRight}
          aria-label="Scroll tabs right"
        >
          <span className="material-symbols-outlined" aria-hidden>
            chevron_right
          </span>
        </button>
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

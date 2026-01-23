import { useEffect, useMemo, useState } from 'react'
import type { FileNode } from '../../types/file'
import { repoService } from '../../services/repoService'
import { useStore } from '../../store/store'
import ConfirmationDialogComponent from '../dialogs/ConfirmationDialogComponent'
import { getViteEnv } from '../../utils/vite-env'
import { getRuntimeConfig } from '../../utils/runtime-config-util'
import './FileExplorerComponent.css'

interface FileExplorerProps {
  repoPath: string
}

const FileExplorerComponent = ({ repoPath }: FileExplorerProps) => {
  const [nodes, setNodes] = useState<FileNode[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [newEntryName, setNewEntryName] = useState('')
  const [createMode, setCreateMode] = useState<'file' | 'folder' | null>(null)
  const [renamePath, setRenamePath] = useState<string | null>(null)
  const [deletePath, setDeletePath] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string | null } | null>(null)
  const [stagedPaths, setStagedPaths] = useState<Set<string>>(new Set())

  const hasApi = useMemo(() => {
    const env = getViteEnv()
    return Boolean(getRuntimeConfig().demoMode || env.VITE_API_URL || env.VITE_API_SERVER_DOMAIN)
  }, [])

  const openFile = useStore(state => state.openFile)

  useEffect(() => {
    if (!hasApi) {
      return
    }

    const load = async () => {
      try {
        const tree = await repoService.listTree(repoPath)
        setNodes(tree)
      } catch (error) {
        console.error('Failed to load file tree', error)
      }
    }

    load()
  }, [repoPath, hasApi])

  const selectedNode = useMemo(() => {
    if (!selectedPath) return null

    const findNode = (items: FileNode[]): FileNode | null => {
      for (const item of items) {
        if (item.path === selectedPath) return item
        if (item.children) {
          const found = findNode(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findNode(nodes)
  }, [nodes, selectedPath])

  const toggleNode = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const expandAll = (items: FileNode[]) => {
    const next: Record<string, boolean> = {}
    const walk = (nodes: FileNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'directory') {
          next[node.path] = true
          if (node.children) {
            walk(node.children)
          }
        }
      })
    }
    walk(items)
    setExpanded(next)
  }

  const collapseAll = () => {
    setExpanded({})
  }

  const refreshTree = async () => {
    if (!hasApi) {
      return
    }
    try {
      const tree = await repoService.listTree(repoPath)
      setNodes(tree)
    } catch (error) {
      console.error('Failed to load file tree', error)
    }
  }

  const handleSelect = async (node: FileNode) => {
    setSelectedPath(node.path)

    if (node.type === 'file') {
      const content = hasApi ? await repoService.readFile(node.path) : ''
      openFile({
        path: node.path,
        content,
        language: node.path.split('.').pop() || 'plaintext',
        isDirty: false,
      })
    }
  }

  const getBasePath = () => {
    if (!selectedNode) {
      return repoPath
    }

    if (selectedNode.type === 'directory') {
      return selectedNode.path
    }

    return selectedNode.path.substring(0, selectedNode.path.lastIndexOf('/')) || repoPath
  }

  const addNodeToTree = (items: FileNode[], basePath: string, newNode: FileNode): FileNode[] => {
    if (!basePath || basePath === repoPath) {
      return [...items, newNode]
    }

    return items.map((node) => {
      if (node.path === basePath && node.type === 'directory') {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        }
      }

      if (node.children) {
        return {
          ...node,
          children: addNodeToTree(node.children, basePath, newNode),
        }
      }

      return node
    })
  }

  const renameNodeInTree = (items: FileNode[], oldPath: string, newPath: string): FileNode[] => {
    const rename = (node: FileNode): FileNode => {
      const shouldUpdate = node.path === oldPath || node.path.startsWith(`${oldPath}/`)
      const nextPath = shouldUpdate ? node.path.replace(oldPath, newPath) : node.path
      const nextName = node.path === oldPath ? newPath.split('/').pop() || node.name : node.name
      const nextChildren = node.children ? node.children.map(rename) : node.children
      return {
        ...node,
        path: nextPath,
        name: nextName,
        children: nextChildren,
      }
    }

    return items.map(rename)
  }

  const removeNodeFromTree = (items: FileNode[], targetPath: string): FileNode[] => {
    const filtered = items.filter(node => node.path !== targetPath && !node.path.startsWith(`${targetPath}/`))
    return filtered.map((node) => ({
      ...node,
      children: node.children ? removeNodeFromTree(node.children, targetPath) : node.children,
    }))
  }

  const handleCreate = async () => {
    if (!newEntryName.trim()) return

    const basePath = getBasePath()
    const targetPath = `${basePath.replace(/\/$/, '')}/${newEntryName}`
    const mode = createMode

    try {
      if (mode === 'file') {
        if (hasApi) {
          await repoService.createFile(targetPath)
        } else {
          setNodes((prev) =>
            addNodeToTree(prev, basePath, {
              path: targetPath,
              name: newEntryName,
              type: 'file',
            })
          )
        }
      } else if (mode === 'folder') {
        if (hasApi) {
          await repoService.createFolder(targetPath)
        } else {
          setNodes((prev) =>
            addNodeToTree(prev, basePath, {
              path: targetPath,
              name: newEntryName,
              type: 'directory',
              children: [],
            })
          )
        }
      }
      setNewEntryName('')
      setCreateMode(null)

      setExpanded((prev) => ({
        ...prev,
        ...(basePath && basePath !== repoPath ? { [basePath]: true } : {}),
      }))
      setSelectedPath(targetPath)

      if (hasApi) {
        const tree = await repoService.listTree(repoPath)
        setNodes(tree)
      }

      if (mode === 'file') {
        const content = hasApi ? await repoService.readFile(targetPath) : ''
        openFile({
          path: targetPath,
          content,
          language: targetPath.split('.').pop() || 'plaintext',
          isDirty: false,
        })
      }
    } catch (error) {
      console.error('Failed to create entry', error)
    }
  }

  const handleRename = async () => {
    if (!renamePath || !newEntryName.trim()) return

    const parentPath = renamePath.substring(0, renamePath.lastIndexOf('/')) || repoPath
    const targetPath = `${parentPath}/${newEntryName}`

    try {
      if (hasApi) {
        await repoService.renamePath(renamePath, targetPath)
      } else {
        setNodes((prev) => renameNodeInTree(prev, renamePath, targetPath))
      }
      setRenamePath(null)
      setNewEntryName('')
      if (hasApi) {
        const tree = await repoService.listTree(repoPath)
        setNodes(tree)
      }
    } catch (error) {
      console.error('Failed to rename entry', error)
    }
  }

  const confirmDelete = (path: string) => {
    setDeletePath(path)
  }

  const handleContextMenu = (event: React.MouseEvent, path: string | null) => {
    event.preventDefault()
    if (path) {
      setSelectedPath(path)
    }
    setContextMenu({ x: event.clientX, y: event.clientY, path })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const handleAddToCommit = async () => {
    if (!selectedPath) return
    try {
      await repoService.addToCommit(repoPath, selectedPath)
      setStagedPaths((prev) => new Set(prev).add(selectedPath))
    } catch (error) {
      console.error('Failed to add file to commit', error)
    } finally {
      closeContextMenu()
    }
  }

  const handleRemoveFromCommit = async () => {
    if (!selectedPath) return
    try {
      await repoService.removeFromCommit(repoPath, selectedPath)
      setStagedPaths((prev) => {
        const next = new Set(prev)
        next.delete(selectedPath)
        return next
      })
    } catch (error) {
      console.error('Failed to remove file from commit', error)
    } finally {
      closeContextMenu()
    }
  }

  const handleDelete = async () => {
    if (!deletePath) return

    try {
      if (hasApi) {
        await repoService.deletePath(deletePath)
      } else {
        setNodes((prev) => removeNodeFromTree(prev, deletePath))
      }
      setDeletePath(null)
      if (hasApi) {
        const tree = await repoService.listTree(repoPath)
        setNodes(tree)
      }
    } catch (error) {
      console.error('Failed to delete entry', error)
    }
  }

  const renderTree = (items: FileNode[]) => {
    return (
      <ul className="file-tree">
        {items.map((node) => {
          const isExpanded = expanded[node.path] ?? false
          return (
            <li key={node.path} className={`file-node ${selectedPath === node.path ? 'selected' : ''}`}>
              <div
                className="file-node-row"
                onContextMenu={(event) => handleContextMenu(event, node.path)}
              >
                {node.type === 'directory' && (
                  <button
                    className="file-node-toggle"
                    type="button"
                    aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                    onClick={() => toggleNode(node.path)}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {isExpanded ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                )}
                {node.type === 'file' && <span className="file-node-toggle-placeholder" />}
                <button
                  type="button"
                  className="file-node-label"
                  onClick={() => handleSelect(node)}
                  aria-label={`Open ${node.name}`}
                >
                  {node.name}
                </button>
              </div>
              {node.type === 'directory' && isExpanded && node.children && renderTree(node.children)}
            </li>
          )
        })}
      </ul>
    )
  }

  const treeMarkup = useMemo(
    () => (nodes.length ? renderTree(nodes) : <div className="file-explorer-empty">No files found.</div>),
    [nodes, expanded, selectedPath]
  )

  return (
    <div className="file-explorer" onContextMenu={(event) => handleContextMenu(event, null)}>
      <div className="file-explorer-actions">
        <button type="button" className="icon-button icon-only" aria-label="Expand all" title="Expand all" onClick={() => expandAll(nodes)}>
          <span className="material-symbols-outlined">unfold_more</span>
          <span className="sr-only">Expand all</span>
        </button>
        <button type="button" className="icon-button icon-only" aria-label="Collapse all" title="Collapse all" onClick={collapseAll}>
          <span className="material-symbols-outlined">unfold_less</span>
          <span className="sr-only">Collapse all</span>
        </button>
        <button type="button" className="icon-button icon-only" aria-label="Refresh tree" title="Refresh" onClick={refreshTree}>
          <span className="material-symbols-outlined">refresh</span>
          <span className="sr-only">Refresh</span>
        </button>
      </div>

      {(createMode || renamePath) && (
        <div className="file-explorer-form">
          <input
            value={newEntryName}
            onChange={(event) => setNewEntryName(event.target.value)}
            placeholder={createMode ? `New ${createMode} name` : 'New name'}
            aria-label={createMode ? `New ${createMode} name` : 'New name'}
          />
          <button type="button" onClick={createMode ? handleCreate : handleRename}>
            {createMode ? 'Create' : 'Rename'}
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateMode(null)
              setRenamePath(null)
              setNewEntryName('')
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {treeMarkup}

      {contextMenu && (
        <div
          className="file-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
          onMouseLeave={closeContextMenu}
        >
          <button type="button" onClick={() => { setCreateMode('file'); closeContextMenu() }}>
            New File
          </button>
          <button type="button" onClick={() => { setCreateMode('folder'); closeContextMenu() }}>
            New Folder
          </button>
          <button
            type="button"
            disabled={!selectedPath}
            onClick={() => {
              if (selectedPath) {
                setRenamePath(selectedPath)
                setNewEntryName(selectedNode?.name || '')
              }
              closeContextMenu()
            }}
          >
            Rename
          </button>
          <button
            type="button"
            disabled={!selectedPath}
            onClick={() => {
              if (selectedPath) {
                confirmDelete(selectedPath)
              }
              closeContextMenu()
            }}
          >
            Delete
          </button>
          {selectedPath && stagedPaths.has(selectedPath) ? (
            <button type="button" onClick={handleRemoveFromCommit}>
              Remove from commit
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedPath}
              onClick={handleAddToCommit}
            >
              Add to commit
            </button>
          )}
        </div>
      )}

      <ConfirmationDialogComponent
        open={Boolean(deletePath)}
        title="Delete item"
        description="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletePath(null)}
      />
    </div>
  )
}

export default FileExplorerComponent

import { useEffect, useMemo, useState } from 'react'
import type { FileNode } from '../../types/file'
import { repoService } from '../../services/repoService'
import { useStore } from '../../store/store'
import ConfirmationDialogComponent from '../dialogs/ConfirmationDialogComponent'
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

  const openFile = useStore(state => state.openFile)

  useEffect(() => {
    const load = async () => {
      try {
        const tree = await repoService.listTree(repoPath)
        setNodes(tree)
      } catch (error) {
        console.error('Failed to load file tree', error)
      }
    }

    load()
  }, [repoPath])

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

  const handleSelect = async (node: FileNode) => {
    setSelectedPath(node.path)

    if (node.type === 'file') {
      const content = await repoService.readFile(node.path)
      openFile({
        path: node.path,
        content,
        language: node.path.split('.').pop() || 'plaintext',
        isDirty: false,
      })
    }
  }

  const handleCreate = async () => {
    if (!newEntryName.trim()) return

    const basePath = selectedNode?.type === 'directory' ? selectedNode.path : repoPath
    const targetPath = `${basePath.replace(/\/$/, '')}/${newEntryName}`

    try {
      if (createMode === 'file') {
        await repoService.createFile(targetPath)
      } else if (createMode === 'folder') {
        await repoService.createFolder(targetPath)
      }
      setNewEntryName('')
      setCreateMode(null)
      const tree = await repoService.listTree(repoPath)
      setNodes(tree)
    } catch (error) {
      console.error('Failed to create entry', error)
    }
  }

  const handleRename = async () => {
    if (!renamePath || !newEntryName.trim()) return

    const parentPath = renamePath.substring(0, renamePath.lastIndexOf('/')) || repoPath
    const targetPath = `${parentPath}/${newEntryName}`

    try {
      await repoService.renamePath(renamePath, targetPath)
      setRenamePath(null)
      setNewEntryName('')
      const tree = await repoService.listTree(repoPath)
      setNodes(tree)
    } catch (error) {
      console.error('Failed to rename entry', error)
    }
  }

  const confirmDelete = (path: string) => {
    setDeletePath(path)
  }

  const handleDelete = async () => {
    if (!deletePath) return

    try {
      await repoService.deletePath(deletePath)
      setDeletePath(null)
      const tree = await repoService.listTree(repoPath)
      setNodes(tree)
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
              <div className="file-node-row">
                {node.type === 'directory' && (
                  <button
                    className="file-node-toggle"
                    type="button"
                    aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                    onClick={() => toggleNode(node.path)}
                  >
                    {isExpanded ? '▾' : '▸'}
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
    <div className="file-explorer">
      <div className="file-explorer-actions">
        <button type="button" aria-label="Create new file" onClick={() => setCreateMode('file')}>
          New File
        </button>
        <button type="button" aria-label="Create new folder" onClick={() => setCreateMode('folder')}>
          New Folder
        </button>
        <button
          type="button"
          aria-label="Rename selected item"
          onClick={() => {
            if (selectedPath) {
              setRenamePath(selectedPath)
              setNewEntryName(selectedNode?.name || '')
            }
          }}
          disabled={!selectedPath}
        >
          Rename
        </button>
        <button
          type="button"
          aria-label="Delete selected item"
          onClick={() => selectedPath && confirmDelete(selectedPath)}
          disabled={!selectedPath}
        >
          Delete
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

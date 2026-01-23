import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { repoService } from '../../services/repoService'
import { queryClient } from '../../services/queryClient'
import CommitDialogComponent from '../dialogs/CommitDialogComponent'
import ResetDialogComponent from '../dialogs/ResetDialogComponent'
import './GitStatusBarComponent.css'

interface GitStatusBarProps {
  repoPath: string
}

const GitStatusBarComponent = ({ repoPath }: GitStatusBarProps) => {
  const [isCommitOpen, setIsCommitOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false)
  const branchMenuRef = useRef<HTMLDivElement | null>(null)

  const { data: status } = useQuery({
    queryKey: ['git-status', repoPath],
    queryFn: () => repoService.getGitStatus(repoPath),
    refetchInterval: 5000,
  })

  const { data: branches } = useQuery({
    queryKey: ['git-branches', repoPath],
    queryFn: () => repoService.getGitBranches(repoPath),
    refetchInterval: 10000,
  })

  const branchOptions = useMemo(() => {
    const list = branches?.length
      ? branches
      : status?.branch
        ? [{ name: status.branch, current: true }]
        : []
    return list
  }, [branches, status?.branch])

  const filteredBranches = useMemo(() => {
    if (!newBranchName.trim()) {
      return branchOptions
    }

    const query = newBranchName.trim().toLowerCase()
    return branchOptions.filter((branch) => branch.name.toLowerCase().includes(query))
  }, [branchOptions, newBranchName])

  const commitMutation = useMutation({
    mutationFn: (message: string) => repoService.commit(repoPath, message, []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['git-status', repoPath] })
      setIsCommitOpen(false)
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => repoService.reset(repoPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['git-status', repoPath] })
      setIsResetOpen(false)
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: (branch: string) => repoService.checkoutBranch(repoPath, branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['git-status', repoPath] })
      queryClient.invalidateQueries({ queryKey: ['git-branches', repoPath] })
    },
  })

  const createBranchMutation = useMutation({
    mutationFn: (branch: string) => repoService.createBranch(repoPath, branch, true),
    onSuccess: () => {
      setNewBranchName('')
      queryClient.invalidateQueries({ queryKey: ['git-status', repoPath] })
      queryClient.invalidateQueries({ queryKey: ['git-branches', repoPath] })
    },
  })

  const handleBranchChange = (value: string) => {
    if (!value || value === status?.branch) {
      return
    }
    checkoutMutation.mutate(value)
    setIsBranchMenuOpen(false)
  }

  const handleCreateBranch = () => {
    const trimmed = newBranchName.trim()
    if (!trimmed) {
      return
    }

    const existing = branchOptions.some((branch) => branch.name === trimmed)
    if (existing) {
      checkoutMutation.mutate(trimmed)
      setNewBranchName('')
      setIsBranchMenuOpen(false)
      return
    }

    createBranchMutation.mutate(trimmed)
    setIsBranchMenuOpen(false)
  }

  useEffect(() => {
    if (!isBranchMenuOpen) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (!branchMenuRef.current?.contains(event.target as Node)) {
        setIsBranchMenuOpen(false)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isBranchMenuOpen])

  return (
    <div className="git-status-bar">
      <div className="git-status-info">
        <div className="git-branch-dropdown" ref={branchMenuRef}>
          <button
            className="git-branch-button"
            type="button"
            aria-label="Toggle branch menu"
            onClick={() => setIsBranchMenuOpen((open) => !open)}
          >
            {status?.branch || 'main'}
            <span className="git-branch-caret material-symbols-outlined" aria-hidden>
              expand_more
            </span>
          </button>
          {isBranchMenuOpen && (
            <div className="git-branch-menu" role="listbox">
              <div className="git-branch-menu-input">
                <input
                  type="text"
                  aria-label="New branch name"
                  placeholder="Search or create branch"
                  value={newBranchName}
                  onChange={(event) => setNewBranchName(event.target.value)}
                />
                <button
                  className="git-action"
                  type="button"
                  aria-label="Create branch"
                  onClick={handleCreateBranch}
                  disabled={createBranchMutation.isPending || checkoutMutation.isPending}
                >
                  Create
                </button>
              </div>
              <div className="git-branch-menu-list">
                {filteredBranches.length === 0 ? (
                  <div className="git-branch-empty">No matching branches</div>
                ) : (
                  filteredBranches.map((branch) => (
                    <button
                      key={branch.name}
                      type="button"
                      className={`git-branch-item ${branch.name === status?.branch ? 'active' : ''}`}
                      onClick={() => handleBranchChange(branch.name)}
                    >
                      {branch.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <span className="git-dirty">{status?.dirtyCount ?? 0} changes</span>
        <span className="git-sync">
          ↑{status?.ahead ?? 0} ↓{status?.behind ?? 0}
        </span>
      </div>
      <div className="git-status-actions">
        <button
          className="git-action"
          type="button"
          aria-label="Open commit dialog"
          onClick={() => setIsCommitOpen(true)}
        >
          Commit
        </button>
        <button
          className="git-action"
          type="button"
          aria-label="Open reset confirmation"
          onClick={() => setIsResetOpen(true)}
        >
          Reset
        </button>
      </div>

      <CommitDialogComponent
        open={isCommitOpen}
        onCommit={(message) => commitMutation.mutate(message)}
        onCancel={() => setIsCommitOpen(false)}
      />
      <ResetDialogComponent
        open={isResetOpen}
        onConfirm={() => resetMutation.mutate()}
        onCancel={() => setIsResetOpen(false)}
      />
    </div>
  )
}

export default GitStatusBarComponent

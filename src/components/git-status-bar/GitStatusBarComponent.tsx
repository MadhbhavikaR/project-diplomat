import { useState } from 'react'
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

  const { data: status } = useQuery({
    queryKey: ['git-status', repoPath],
    queryFn: () => repoService.getGitStatus(repoPath),
    refetchInterval: 5000,
  })

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

  return (
    <div className="git-status-bar">
      <div className="git-status-info">
        <span className="git-branch">{status?.branch || 'main'}</span>
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

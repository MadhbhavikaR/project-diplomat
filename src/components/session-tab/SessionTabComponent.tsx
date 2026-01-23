import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/store'
import type { Session } from '../../types/session'
import { sessionService } from '../../services/sessionService'
import ConfirmationDialogComponent from '../dialogs/ConfirmationDialogComponent'
import './SessionTabComponent.css'

interface SessionTabProps {
  userId: string
  appName: string
  sessionId: string
  onSessionSelected: (session: Session) => void
  onSessionReloaded: (session: Session) => void
}

const SessionTabComponent: React.FC<SessionTabProps> = ({
  userId,
  appName,
  sessionId,
  onSessionSelected,
  onSessionReloaded,
}) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)
  const [pageToken, setPageToken] = useState('')
  const [newSessionName, setNewSessionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Access Zustand store
  const isSessionFilteringEnabled = useStore(state => state.isSessionFilteringEnabled)
  const isSessionListLoading = useStore(state => state.isSessionListLoading)
  const canEditSession = useStore(state => state.canEditSession)
  const setSessionListLoading = useStore(state => state.setSessionListLoading)
  const setSessionsInStore = useStore(state => state.setSessions)
  const setActiveSessionId = useStore(state => state.setActiveSessionId)

  // Load initial sessions
  useEffect(() => {
    loadSessions(true)
  }, [userId, appName])

  // Debounced filter change handler
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFilter(value)

    // Debounce the filter
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      // Reset pagination when filter changes
      setPageToken('')
      setSessions([])
      loadSessions(true, value)
    }, 300)
  }

  const loadSessions = async (reset: boolean, filterValue: string = filter) => {
    setIsLoading(true)
    setSessionListLoading(true)

    try {
      const page = reset ? 1 : Number(pageToken || 1)
      const response = await sessionService.listSessions({ page, pageSize: 20 })
      const filtered = filterValue
        ? response.items.filter((sessionItem) =>
            sessionItem.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
            sessionItem.id.toLowerCase().includes(filterValue.toLowerCase())
          )
        : response.items

      setSessions((prev) => {
        const nextSessions = reset ? filtered : [...prev, ...filtered]
        setSessionsInStore(nextSessions)
        return nextSessions
      })
      setCanLoadMore(Boolean(response.nextPageToken))
      setPageToken(response.nextPageToken)
    } catch (error) {
      console.error('Failed to load sessions', error)
      setSessions([])
      setSessionsInStore([])
      setCanLoadMore(false)
      setPageToken('')
    } finally {
      setIsLoading(false)
      setSessionListLoading(false)
    }
  }

  const loadMoreSessions = async () => {
    if (isLoadingMore || !pageToken) return

    setIsLoadingMore(true)
    setSessionListLoading(true)

    try {
      const nextPage = Number(pageToken)
      const response = await sessionService.listSessions({ page: nextPage, pageSize: 20 })
      setSessions((prev) => {
        const nextSessions = [...prev, ...response.items]
        setSessionsInStore(nextSessions)
        return nextSessions
      })
      setCanLoadMore(Boolean(response.nextPageToken))
      setPageToken(response.nextPageToken)
    } catch (error) {
      console.error('Failed to load more sessions', error)
    } finally {
      setIsLoadingMore(false)
      setSessionListLoading(false)
    }
  }

  const getSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setActiveSessionId(session.id)
      onSessionSelected(session)
    }
  }

  const reloadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      onSessionReloaded(session)
    }
  }

  const getDate = (session: Session): string => {
    try {
      const date = new Date(session.updatedAt)
      return date.toLocaleString()
    } catch {
      return session.updatedAt.toString()
    }
  }

  const handleCreateSession = async () => {
    if (isCreating) return
    const name = newSessionName.trim() || `Session ${new Date().toLocaleTimeString()}`

    setIsCreating(true)
    try {
      const session = await sessionService.createSession(name, appName)
      setNewSessionName('')
      setActiveSessionId(session.id)
      await loadSessions(true)
      onSessionSelected(session)
    } catch (error) {
      console.error('Failed to create session', error)
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDeleteSession = (session: Session) => {
    setSessionToDelete(session)
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    try {
      await sessionService.deleteSession(sessionToDelete.id)
      setSessionToDelete(null)
      await loadSessions(true)
    } catch (error) {
      console.error('Failed to delete session', error)
    }
  }

  return (
    <div className="session-wrapper">
      {/* Session Filter */}
      {isSessionFilteringEnabled && (
        <div className="session-filter-container">
          <div className="session-filter-input">
            <input
              type="text"
              placeholder="Filter sessions..."
              value={filter}
              onChange={handleFilterChange}
              className="filter-input"
            />
            <span className="filter-icon">🔍</span>
          </div>
          <div className="session-create-row">
            <input
              type="text"
              placeholder="New session name"
              value={newSessionName}
              onChange={(event) => setNewSessionName(event.target.value)}
              className="create-session-input"
            />
            <button
              className="create-session-button"
              onClick={handleCreateSession}
              disabled={isCreating}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {(isSessionListLoading && !isLoadingMore) && (
        <div className="loading-spinner-container">
          <div className="progress-bar"></div>
        </div>
      )}

      {/* Empty State */}
      {!isSessionListLoading && sessions.length === 0 && (
        <div className="empty-state">
          No sessions found
        </div>
      )}

      {/* Session List */}
      {!isSessionListLoading && sessions.length > 0 && (
        <div className="session-tab-container">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={
                `session-item ${session.id === sessionId ? 'current' : ''}`
              }
              onClick={() => getSession(session.id)}
            >
              <div className="session-info">
                <div className="session-id">{session.name || session.id}</div>
                <div className="session-date">{getDate(session)}</div>
              </div>
              <div className="session-actions">
                {!canEditSession && (
                  <div className="readonly-badge">
                    <span>👁️</span>
                    <span>Read-only</span>
                  </div>
                )}
                <button
                  className="delete-session-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    confirmDeleteSession(session)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {isSessionFilteringEnabled && canLoadMore && (
        <div className="load-more-container">
          {isLoadingMore && (
            <div className="loading-spinner-container">
              <div className="progress-bar"></div>
            </div>
          )}
          <button
            className="load-more-button"
            onClick={loadMoreSessions}
            disabled={isLoadingMore}
          >
            Load more
          </button>
        </div>
      )}
      <ConfirmationDialogComponent
        open={Boolean(sessionToDelete)}
        title="Delete session"
        description="Are you sure you want to delete this session?"
        confirmLabel="Delete"
        onConfirm={handleDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  )
}

export default SessionTabComponent
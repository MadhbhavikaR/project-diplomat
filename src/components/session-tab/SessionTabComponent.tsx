import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/store'
import './SessionTabComponent.css'

// Define TypeScript interfaces
interface Session {
  id: string
  lastUpdateTime: string
  // Add other session properties as needed
}

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
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Access Zustand store
  const isSessionFilteringEnabled = useStore(state => state.isSessionFilteringEnabled)
  const isSessionListLoading = useStore(state => state.isSessionListLoading)

  // Mock data for demonstration - in real implementation, this would come from API
  const mockSessions: Session[] = [
    { id: 'session1', lastUpdateTime: '2023-01-01T10:00:00Z' },
    { id: 'session2', lastUpdateTime: '2023-01-02T11:00:00Z' },
    { id: 'session3', lastUpdateTime: '2023-01-03T12:00:00Z' },
    { id: 'session4', lastUpdateTime: '2023-01-04T13:00:00Z' },
    { id: 'session5', lastUpdateTime: '2023-01-05T14:00:00Z' },
  ]

  // Load initial sessions
  useEffect(() => {
    loadSessions()
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
      loadSessions(value)
    }, 300)
  }

  const loadSessions = (filterValue: string = filter) => {
    setIsLoading(true)

    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    setTimeout(() => {
      // Filter sessions if filter is provided
      let filteredSessions = mockSessions
      if (filterValue) {
        filteredSessions = mockSessions.filter(session => session.id.includes(filterValue))
      }

      // Simulate pagination
      const startIndex = pageToken ? parseInt(pageToken) : 0
      const paginatedSessions = filteredSessions.slice(startIndex, startIndex + 3)

      // Replace sessions instead of appending to avoid duplicate keys
      setSessions(paginatedSessions)
      setCanLoadMore(filteredSessions.length > startIndex + 3)
      setIsLoading(false)
    }, 500)
  }

  const loadMoreSessions = () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    const nextPageToken = (sessions.length).toString()
    setPageToken(nextPageToken)

    // Load more sessions
    setTimeout(() => {
      const startIndex = parseInt(pageToken) || 0
      const moreSessions = mockSessions.slice(startIndex, startIndex + 3)

      setSessions(prev => [...prev, ...moreSessions])
      setCanLoadMore(mockSessions.length > startIndex + 3)
      setIsLoadingMore(false)
    }, 500)
  }

  const getSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
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
      const date = new Date(session.lastUpdateTime)
      return date.toLocaleString()
    } catch {
      return session.lastUpdateTime
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
                <div className="session-id">{session.id}</div>
                <div className="session-date">{getDate(session)}</div>
              </div>
              {/* In a real implementation, this would check edit permissions */}
              <div className="readonly-badge">
                <span>👁️</span>
                <span>Read-only</span>
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
    </div>
  )
}

export default SessionTabComponent
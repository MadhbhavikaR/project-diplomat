import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../store/store'
import { eventService, type EventItem } from '../../services/eventService'
import './EventTabComponent.css'

// Define TypeScript interfaces
interface Span {
  trace_id: string
  start_time: number
  end_time: number
  attributes?: Record<string, any>
  invoc_id?: string
}

interface EventTabProps {
  eventsMap: Map<string, any>
  traceData: Span[]
  sessionId?: string
  onSelectedEvent: (key: string) => void
}

const EventTabComponent: React.FC<EventTabProps> = ({
  eventsMap,
  traceData,
  sessionId,
  onSelectedEvent,
}) => {
  const [view, setView] = useState<'events' | 'trace'>('events')
  const [showJson, setShowJson] = useState<boolean[]>(Array(eventsMap.size).fill(false))
  const [spansByTraceId, setSpansByTraceId] = useState<Map<string, Span[]>>(new Map())
  const [localEvents, setLocalEvents] = useState<Map<string, EventItem>>(eventsMap)
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null)
  const [graphSvg, setGraphSvg] = useState<string | null>(null)

  // Access Zustand store
  const isTraceEnabled = useStore(state => state.isTraceEnabled)

  // Process trace data when it changes
  useEffect(() => {
    if (traceData && traceData.length > 0) {
      const groupedSpans = traceData.reduce((map, span) => {
        const key = span.trace_id
        const group = map.get(key)
        if (group) {
          span.invoc_id = span.attributes?.['gcp.vertex.agent.invocation_id']
          group.push(span)
          group.sort((a: Span, b: Span) => a.start_time - b.start_time)
        } else {
          map.set(key, [span])
        }
        return map
      }, new Map<string, Span[]>())
      setSpansByTraceId(groupedSpans)
    }
  }, [traceData])

  useEffect(() => {
    setLocalEvents(eventsMap)
  }, [eventsMap])

  useEffect(() => {
    setShowJson(Array(localEvents.size).fill(false))
  }, [localEvents.size])

  useEffect(() => {
    const loadEvents = async () => {
      if (!sessionId || eventsMap.size > 0) {
        return
      }

      try {
        const response = await eventService.listEvents(sessionId, { page: 1, pageSize: 50 })
        const map = new Map(response.items.map((item) => [item.id, item]))
        setLocalEvents(map)
      } catch (error) {
        console.error('Failed to load events', error)
      }
    }

    loadEvents()
  }, [eventsMap.size, sessionId])

  const toggleJson = (index: number) => {
    const newShowJson = [...showJson]
    newShowJson[index] = !newShowJson[index]
    setShowJson(newShowJson)
  }

  const selectEvent = (key: string) => {
    onSelectedEvent(key)
    setSelectedEventKey(key)
  }

  const mapOrderPreservingSort = (a: any, b: any): number => 0

  const findInvocId = (spans: Span[]): string | undefined => {
    const foundItem = spans.find(
      item => item.attributes !== undefined &&
        'gcp.vertex.agent.invocation_id' in item.attributes
    )
    return foundItem?.attributes?.['gcp.vertex.agent.invocation_id']
  }

  const openTraceDialog = (traceId: string) => {
    const spans = spansByTraceId.get(traceId)
    if (spans) {
      const invocId = findInvocId(spans)
      // In a real implementation, this would open a dialog
      console.log('Opening trace dialog for trace:', traceId, 'invocId:', invocId)
      // For now, we'll just log the data that would be passed to the dialog
      console.log('Spans data:', spans)
    }
  }

  const isTraceView = view === 'trace'

  const selectedEvent = useMemo(() => {
    if (!selectedEventKey) {
      return null
    }
    return localEvents.get(selectedEventKey) ?? null
  }, [localEvents, selectedEventKey])

  useEffect(() => {
    const renderGraph = async () => {
      if (!selectedEvent) {
        setGraphSvg(null)
        return
      }

      if (selectedEvent.graphSvg) {
        setGraphSvg(selectedEvent.graphSvg)
        return
      }

      if (!selectedEvent.graphDot) {
        setGraphSvg(null)
        return
      }

      try {
        const { instance } = await import('@viz-js/viz')
        const viz = await instance()
        const svg = viz.renderString(selectedEvent.graphDot)
        setGraphSvg(svg)
      } catch (error) {
        console.error('Failed to render event graph', error)
        setGraphSvg(null)
      }
    }

    renderGraph()
  }, [selectedEvent])

  return (
    <div className="events-wrapper">
      {localEvents.size > 0 ? (
        <div className="events-container">
          <div className="event-header">
            {!isTraceView && (
              <p>Conversations</p>
            )}
            {isTraceView && (
              <p>Trace</p>
            )}
            {traceData.length > 0 && (
              <div className="view-toggle-group">
                <button
                  className={
                    `view-toggle-button ${view === 'events' ? 'active' : ''}`
                  }
                  onClick={() => setView('events')}
                >
                  Events
                </button>
                {isTraceEnabled && (
                  <button
                    className={
                      `view-toggle-button ${view === 'trace' ? 'active' : ''}`
                    }
                    onClick={() => setView('trace')}
                  >
                    Trace
                  </button>
                )}
              </div>
            )}
          </div>

          {!isTraceView && (
            <div className="event-list">
              {Array.from(localEvents.entries()).map(([key, value], index) => (
                <div
                  key={key}
                  className="event-list-item"
                  onClick={() => selectEvent(key)}
                >
                  <span className="event-index">{index}</span>
                  <span className="event-title">{value.title}</span>
                  <button
                    className="event-json-toggle"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleJson(index)
                    }}
                  >
                    {showJson[index] ? 'Hide JSON' : 'View JSON'}
                  </button>
                  {showJson[index] && (
                    <div className="event-json">
                      <pre>{JSON.stringify(value.payload ?? value, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              <div className="event-graph">
                <h4>Event Graph</h4>
                {graphSvg ? (
                  <div
                    className="event-graph-content"
                    dangerouslySetInnerHTML={{ __html: graphSvg }}
                  />
                ) : (
                  <div className="event-graph-empty">Select an event to view graph.</div>
                )}
              </div>
            </div>
          )}

          {isTraceView && (
            <div className="event-list">
              {Array.from(spansByTraceId.entries()).map(([traceId, spans], index) => (
                <div
                  key={traceId}
                  className="event-list-item"
                  onClick={() => openTraceDialog(traceId)}
                >
                  <span className="event-index">{index}</span>
                  <span>Invocation: {findInvocId(spans) || 'Unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          No conversations available
        </div>
      )}
    </div>
  )
}

export default EventTabComponent
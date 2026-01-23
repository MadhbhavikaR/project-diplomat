import { apiClient } from './apiClient'
import { getViteEnv } from '../utils/vite-env'

export interface EventItem {
  id: string
  title: string
  payload: Record<string, unknown>
  timestamp?: string
  graphDot?: string
  graphSvg?: string
}

interface EventListResponse {
  data: EventItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

class EventService {
  async listEvents(
    sessionId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<{ items: EventItem[]; nextPageToken: string }> {
    const env = getViteEnv()
    if (!env.VITE_API_URL && !env.VITE_API_SERVER_DOMAIN) {
      return { items: [], nextPageToken: '' }
    }

    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))

    const response = await apiClient.get<EventListResponse>(
      `/sessions/${sessionId}/events?${search}`
    )

    return {
      items: response.data,
      nextPageToken: response.hasMore ? String(response.page + 1) : '',
    }
  }
}

export const eventService = new EventService()

import type {
  Task,
  TaskListResponse,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  TaskFilterParams,
  DashboardStats,
  ApiError,
  ChatResponse,
  Tag,
  TagListResponse,
  CreateTagData,
  UpdateTagData
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get token from localStorage (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers
      }
    })

    // Handle 204 No Content (for DELETE)
    if (response.status === 204) {
      return undefined as T
    }

    // Handle errors
    if (!response.ok) {
      // Handle 404 on DELETE as success (task already deleted)
      if (response.status === 404 && options?.method === 'DELETE') {
        return undefined as T
      }

      const error: ApiError = {
        detail: await response.text().catch(() => 'An error occurred'),
        status: response.status
      }

      // Handle 401 Unauthorized - redirect to login (client-side only)
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
      }

      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Helper to clean task data - convert empty strings to null for date fields
  private cleanTaskData(data: any): any {
    const cleaned = { ...data }
    // Convert empty strings to null for date fields
    if (cleaned.due_date === '') cleaned.due_date = null
    if (cleaned.recurrence_end_date === '') cleaned.recurrence_end_date = null
    // Convert empty reminder to null
    if (cleaned.reminder_minutes === '' || cleaned.reminder_minutes === undefined) {
      cleaned.reminder_minutes = null
    }
    return cleaned
  }

  // Task API methods - Phase 5 Enhanced
  tasks = {
    list: (userId: string, params?: TaskFilterParams) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.priority) searchParams.append('priority', params.priority)
      if (params?.tag_ids) searchParams.append('tag_ids', params.tag_ids)
      if (params?.due_from) searchParams.append('due_from', params.due_from)
      if (params?.due_to) searchParams.append('due_to', params.due_to)
      if (params?.search) searchParams.append('search', params.search)
      if (params?.sort_by) searchParams.append('sort_by', params.sort_by)
      if (params?.sort_order) searchParams.append('sort_order', params.sort_order)
      const queryString = searchParams.toString()
      return this.request<TaskListResponse>(`/api/${userId}/tasks${queryString ? `?${queryString}` : ''}`)
    },

    search: (userId: string, query: string) =>
      this.request<TaskListResponse>(`/api/${userId}/tasks/search?q=${encodeURIComponent(query)}`),

    create: (userId: string, data: CreateTaskData) =>
      this.request<Task>(`/api/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(this.cleanTaskData(data))
      }),

    update: (userId: string, taskId: number, data: UpdateTaskData) =>
      this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(this.cleanTaskData(data))
      }),

    delete: (userId: string, taskId: number) =>
      this.request<void>(`/api/${userId}/tasks/${taskId}`, {
        method: 'DELETE'
      }),

    toggleComplete: (userId: string, taskId: number) =>
      this.request<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH'
      })
  }

  // Tags API methods - Phase 5
  tags = {
    list: (userId: string) =>
      this.request<TagListResponse>(`/api/${userId}/tags`),

    get: (userId: string, tagId: number) =>
      this.request<Tag>(`/api/${userId}/tags/${tagId}`),

    create: (userId: string, data: CreateTagData) =>
      this.request<Tag>(`/api/${userId}/tags`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (userId: string, tagId: number, data: UpdateTagData) =>
      this.request<Tag>(`/api/${userId}/tags/${tagId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    delete: (userId: string, tagId: number) =>
      this.request<void>(`/api/${userId}/tags/${tagId}`, {
        method: 'DELETE'
      })
  }

  // Chat API methods
  chat = {
    sendMessage: (userId: string, message: string, conversationId?: number) => {
      const requestBody: { conversation_id?: number; message: string } = { message };
      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }
      return this.request<ChatResponse>(`/api/${userId}/chat`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
    }
  }

  // Dashboard API methods
  dashboard = {
    getStats: (userId: string) =>
      this.request<DashboardStats>(`/api/${userId}/dashboard/stats`)
  }
}

export const api = new ApiClient()

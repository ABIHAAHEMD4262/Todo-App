import type {
  Task,
  TaskListResponse,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  DashboardStats,
  ApiError,
  ChatResponse
} from '@/types'

// Determine base URL based on environment - use proxy routes in production
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: Use relative URLs to go through Next.js proxy in production
    // This helps avoid CORS issues on Vercel deployment
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLocalNetwork = /^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);

    // Use direct API calls for localhost and local network (for development)
    // Use relative paths (proxy routes) for production deployments
    if (isLocalhost || isLocalNetwork) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    } else {
      // In production (Vercel), use relative paths to go through Next.js API routes
      return '';
    }
  }
  // Server-side: fallback to environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get token from localStorage (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    // Use proxy route in production, direct API in development
    const baseUrl = getBaseUrl();
    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

    // For debugging - log the URL being called
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`API call to: ${url}`);
    }

    const response = await fetch(url, {
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

  // Task API methods
  tasks = {
    list: (userId: string, status?: TaskStatus) =>
      this.request<TaskListResponse>(`/api/${userId}/tasks?status=${status || 'all'}`),

    create: (userId: string, data: CreateTaskData) =>
      this.request<Task>(`/api/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (userId: string, taskId: number, data: UpdateTaskData) =>
      this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
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

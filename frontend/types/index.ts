// User types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

// Task types
export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  completed?: boolean
}

export type TaskStatus = 'all' | 'pending' | 'completed'

export interface TaskListResponse {
  tasks: Task[]
  total: number
}

// Dashboard types
export interface ActivityItem {
  task_id: number | null
  task_title: string
  action: 'created' | 'completed' | 'updated' | 'deleted'
  timestamp: string
}

export interface DashboardStats {
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  completion_rate: number
  recent_activity: ActivityItem[]
}

// API Error type
export interface ApiError {
  detail: string
  status: number
}

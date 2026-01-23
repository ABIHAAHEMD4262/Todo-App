// User types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

// Task types - Phase 5 Enhanced
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type TaskSortBy = 'created_at' | 'title' | 'priority' | 'due_date' | 'id'
export type SortOrder = 'asc' | 'desc'
export type TaskStatus = 'all' | 'pending' | 'completed' | 'overdue'

// Tag type - Phase 5
export interface Tag {
  id: number
  name: string
  color: string
}

export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
  // Phase 5 fields
  due_date: string | null
  reminder_minutes: number | null
  priority: string
  is_recurring: boolean
  recurrence_pattern: string | null
  recurrence_interval: number | null
  recurrence_end_date: string | null
  parent_task_id: number | null
  tags: Tag[]
}

export interface CreateTaskData {
  title: string
  description?: string
  due_date?: string
  reminder_minutes?: number
  priority?: TaskPriority
  is_recurring?: boolean
  recurrence_pattern?: TaskRecurrence
  recurrence_interval?: number
  recurrence_end_date?: string
  tag_ids?: number[]
}

export interface UpdateTaskData {
  title?: string
  description?: string
  completed?: boolean
  due_date?: string
  reminder_minutes?: number
  priority?: TaskPriority
  is_recurring?: boolean
  recurrence_pattern?: TaskRecurrence
  recurrence_interval?: number
  recurrence_end_date?: string
  tag_ids?: number[]
}

// Task filtering parameters - Phase 5
export interface TaskFilterParams {
  status?: TaskStatus
  priority?: TaskPriority
  tag_ids?: string
  due_from?: string
  due_to?: string
  search?: string
  sort_by?: TaskSortBy
  sort_order?: SortOrder
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
}

// Tag CRUD types - Phase 5
export interface CreateTagData {
  name: string
  color?: string
}

export interface UpdateTagData {
  name?: string
  color?: string
}

export interface TagListResponse {
  tags: Tag[]
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

// Chat types
export interface ChatResponse {
  conversation_id: number
  response: string
  tool_calls: string[]
}

// API Error type
export interface ApiError {
  detail: string
  status: number
}

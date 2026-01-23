'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/ui/sidebar'
import { useAuthContext } from '@/components/providers/auth-provider'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { api } from '@/lib/api'
import { Task, Tag, TaskStatus, TaskPriority, TaskSortBy, SortOrder } from '@/types'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ArrowUpDown, Filter } from 'lucide-react'

export default function TasksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  const [tasks, setTasks] = useState<Task[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskStatus>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null)

  // Phase 5 Features: Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load tags
  const loadTags = async () => {
    if (!user) return
    try {
      const response = await api.tags.list(user.id)
      setAvailableTags(response.tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  // Load tasks with Phase 5 server-side filtering
  const loadTasks = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Build filter params for backend
      const params: any = {
        status: filter,
        sort_by: sortBy,
        sort_order: sortOrder
      }
      if (priorityFilter) params.priority = priorityFilter
      if (tagFilter) params.tag_ids = tagFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const response = await api.tasks.list(user.id, params)
      setTasks(response.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  // Load tags on mount
  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  // Load tasks when filters change
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user, filter, searchQuery, priorityFilter, tagFilter, sortBy, sortOrder])

  // Create task
  const handleCreate = async (data: any) => {
    if (!user) return

    try {
      setFormLoading(true)
      await api.tasks.create(user.id, data)
      toast.success('Task created successfully!')
      setShowForm(false)
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    } finally {
      setFormLoading(false)
    }
  }

  // Update task
  const handleUpdate = async (data: any) => {
    if (!user || !editingTask) return

    try {
      setFormLoading(true)
      await api.tasks.update(user.id, editingTask.id, data)
      toast.success('Task updated successfully!')
      setEditingTask(undefined)
      loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    } finally {
      setFormLoading(false)
    }
  }

  // Toggle complete
  const handleToggleComplete = async (taskId: number) => {
    if (!user || togglingTaskId !== null) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      setTogglingTaskId(taskId)
      await api.tasks.toggleComplete(user.id, taskId)
      await loadTasks()
      toast.success(task.completed ? 'Task marked as pending' : 'Task completed!')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      toast.error('Failed to update task')
    } finally {
      setTogglingTaskId(null)
    }
  }

  // Delete task
  const handleDelete = async (taskId: number) => {
    if (!user) return
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await api.tasks.delete(user.id, taskId)
      toast.success('Task deleted!')
      loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  // Edit task
  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    )
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length
  }

  return (
    <SidebarLayout>
      <main className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold ai-gradient-text mb-2">
            My Tasks
          </h1>
          <p className="text-slate-400 text-lg">
            {stats.pending === 0 && stats.total > 0
              ? 'All done! Great job!'
              : `${stats.pending} pending, ${stats.completed} completed`
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-12 pr-12 py-4 bg-slate-900/60 text-slate-200 border border-indigo-500/20 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition placeholder:text-slate-600 backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status Filters and Add Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 glass-card p-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'ai-gradient-bg text-white shadow-md ai-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'pending'
                    ? 'ai-gradient-bg text-white shadow-md ai-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'completed'
                    ? 'ai-gradient-bg text-white shadow-md ai-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Completed ({stats.completed})
              </button>
              {stats.overdue > 0 && (
                <button
                  onClick={() => setFilter('overdue')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === 'overdue'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  Overdue ({stats.overdue})
                </button>
              )}
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 ai-gradient-bg text-white rounded-2xl font-bold hover:opacity-90 transition-all duration-300 ai-glow hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-indigo-500/40 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>

            {showAdvancedFilters && (
              <div className="flex flex-wrap gap-3">
                {/* Priority Filter - Phase 5 Enhanced */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
                  className="px-4 py-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-300 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">🔥 Urgent</option>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                  <option value="none">⚪ None</option>
                </select>

                {/* Tag Filter - Phase 5 */}
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-300 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition"
                >
                  <option value="">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag.id} value={String(tag.id)}>
                      {tag.name}
                    </option>
                  ))}
                </select>

                {/* Sort Controls */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
                  className="px-4 py-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-300 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition"
                >
                  <option value="created_at">Sort by Created Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="due_date">Sort by Due Date</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700/60 transition flex items-center gap-2"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            filter={filter}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            togglingTaskId={togglingTaskId}
          />
        )}
      </main>

      {/* Task Form Modal - Phase 5 with Tags */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          availableTags={availableTags}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingTask(undefined)
          }}
          isLoading={formLoading}
        />
      )}
    </SidebarLayout>
  )
}

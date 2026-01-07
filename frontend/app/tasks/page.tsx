'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/ui/sidebar'
import { useAuthContext } from '@/components/providers/auth-provider'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { api } from '@/lib/api'
import { Task, TaskStatus, TaskPriority, TaskSortBy, SortOrder } from '@/types'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ArrowUpDown, Filter } from 'lucide-react'

export default function TasksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskStatus>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null)

  // Phase I Features: Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [tagFilter, setTagFilter] = useState('')
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load tasks
  const loadTasks = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load all tasks with filters (search is done client-side)
      const response = await api.tasks.list(user.id, filter)

      // Client-side search filtering
      let filteredTasks = response.tasks
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filteredTasks = response.tasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        )
      }

      // Client-side priority filtering
      if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter)
      }

      // Client-side tag filtering
      if (tagFilter.trim()) {
        const tag = tagFilter.toLowerCase()
        filteredTasks = filteredTasks.filter(task =>
          task.tags && task.tags.some(t => t.toLowerCase().includes(tag))
        )
      }

      // Client-side sorting
      filteredTasks.sort((a, b) => {
        let compareA: any = a[sortBy]
        let compareB: any = b[sortBy]

        // Handle priority sorting
        if (sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          compareA = priorityOrder[a.priority]
          compareB = priorityOrder[b.priority]
        }

        // Handle null values
        if (compareA === null || compareA === undefined) return 1
        if (compareB === null || compareB === undefined) return -1

        // Compare
        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })

      setTasks(filteredTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

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
    completed: tasks.filter(t => t.completed).length
  }

  return (
    <SidebarLayout>
      <main className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            My Tasks
          </h1>
          <p className="text-slate-600 text-lg">
            {stats.pending === 0 && stats.total > 0
              ? '🎉 All done! Great job!'
              : `${stats.pending} pending, ${stats.completed} completed`
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition placeholder:text-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status Filters and Add Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'pending'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-violet-300 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>

            {showAdvancedFilters && (
              <div className="flex flex-wrap gap-3">
                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                >
                  <option value="">All Priorities</option>
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>

                {/* Tag Filter */}
                <div className="relative">
                  <input
                    type="text"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    placeholder="Filter by tag..."
                    className="w-48 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                  />
                  {tagFilter && (
                    <button
                      onClick={() => setTagFilter('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort Controls */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                >
                  <option value="created_at">Sort by Created Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="due_date">Sort by Due Date</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
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

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
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

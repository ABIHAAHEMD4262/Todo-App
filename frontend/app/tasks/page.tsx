'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { api } from '@/lib/api'
import { Task, TaskStatus, TaskPriority, TaskSortBy, SortOrder } from '@/types'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ArrowUpDown } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Tasks
          </h1>
          <p className="text-gray-600">
            {stats.pending === 0 && stats.total > 0
              ? '🎉 All done! Great job!'
              : `${stats.pending} pending, ${stats.completed} completed`
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-10 pr-10 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>

          {/* Tag Filter */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag..."
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {tagFilter && (
              <button
                onClick={() => setTagFilter('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="created_at">Sort by Created Date</option>
            <option value="title">Sort by Title</option>
            <option value="priority">Sort by Priority</option>
            <option value="due_date">Sort by Due Date</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
          </button>
        </div>

        {/* Filters and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
    </div>
  )
}

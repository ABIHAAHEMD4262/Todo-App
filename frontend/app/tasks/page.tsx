'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { api } from '@/lib/api'
import { Task, TaskStatus } from '@/types'
import { toast } from 'sonner'
import { Plus, Loader2, ListFilter } from 'lucide-react'

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

  // Redirect if not authenticated
  useEffect(() => {
    console.log('=== TASKS PAGE AUTH CHECK ===')
    console.log('authLoading:', authLoading)
    console.log('user:', user?.email || 'null')

    // Double-check localStorage before redirecting (client-side only)
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')

        console.log('localStorage check:')
        console.log('  - auth_token:', token ? `${token.substring(0, 20)}...` : 'NULL')
        console.log('  - user_data:', userData ? 'EXISTS' : 'NULL')
        console.log('  - All localStorage keys:', Object.keys(localStorage))

        // Only redirect if there's truly no session
        if (!token || !userData) {
          console.log('❌ REDIRECTING TO LOGIN - No session found')
          router.push('/login')
        } else {
          console.log('⏳ Session exists in localStorage, waiting for context to sync...')
        }
      }
    } else if (user) {
      console.log('✓ User authenticated:', user.email, 'User ID:', user.id)
    }
    console.log('=== END AUTH CHECK ===')
  }, [user, authLoading, router])

  // Load tasks
  const loadTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.tasks.list(user.id, filter)
      setTasks(response.tasks)
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
  }, [user, filter])

  // Create task
  const handleCreate = async (data: { title: string; description?: string }) => {
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
  const handleUpdate = async (data: { title: string; description?: string }) => {
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

    // Find the task to check current state
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      setTogglingTaskId(taskId)
      await api.tasks.toggleComplete(user.id, taskId)
      // Reload tasks from server to get the correct state
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

  // Show loading spinner while auth is loading or initial tasks are loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // Don't render if no user (redirect will happen in useEffect)
  if (!user) {
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

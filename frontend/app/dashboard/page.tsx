'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/ui/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import { api } from '@/lib/api'
import { DashboardStats } from '@/types'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  Circle,
  BarChart3,
  TrendingUp,
  Plus,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load dashboard stats
  const loadStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await api.dashboard.getStats(user.id)
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // Don't render if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your task overview and recent activity
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_tasks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {stats.pending_tasks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Circle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.completed_tasks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">Completion Rate</p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.completion_rate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity - 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

                {stats.recent_activity.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Start creating tasks to see activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recent_activity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
                      >
                        {/* Action Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.action === 'created' ? 'bg-blue-100' :
                          activity.action === 'completed' ? 'bg-green-100' :
                          activity.action === 'updated' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {activity.action === 'created' ? (
                            <Plus className={`w-5 h-5 text-blue-600`} />
                          ) : activity.action === 'completed' ? (
                            <CheckCircle2 className={`w-5 h-5 text-green-600`} />
                          ) : activity.action === 'updated' ? (
                            <Circle className={`w-5 h-5 text-yellow-600`} />
                          ) : (
                            <Circle className={`w-5 h-5 text-red-600`} />
                          )}
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action === 'created' && 'Created task: '}
                            {activity.action === 'completed' && 'Completed task: '}
                            {activity.action === 'updated' && 'Updated task: '}
                            {activity.action === 'deleted' && 'Deleted task: '}
                            <span className="text-gray-700">{activity.task_title}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions - 1/3 width */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

                <div className="space-y-3">
                  <Link
                    href="/tasks"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition shadow-sm hover:shadow-md"
                  >
                    View All Tasks
                  </Link>

                  <Link
                    href="/tasks"
                    className="block w-full px-4 py-3 bg-white text-gray-700 rounded-lg font-semibold text-center border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                  >
                    Create New Task
                  </Link>
                </div>

                {/* Progress Summary */}
                {stats.total_tasks > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Progress</p>
                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${stats.completion_rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.completed_tasks} of {stats.total_tasks} tasks completed
                    </p>
                  </div>
                )}

                {/* Motivational Message */}
                {stats.pending_tasks === 0 && stats.total_tasks > 0 ? (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      All caught up!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      You've completed all your tasks. Great job!
                    </p>
                  </div>
                ) : stats.pending_tasks > 0 ? (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Keep going!
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {stats.pending_tasks} task{stats.pending_tasks !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load dashboard</p>
          </div>
        )}
      </main>
    </div>
  )
}

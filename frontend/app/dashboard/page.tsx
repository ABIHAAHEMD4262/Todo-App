'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/ui/sidebar'
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
  Clock,
  Target,
  Zap
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    )
  }

  // Don't render if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    )
  }

  return (
    <SidebarLayout>
      <main className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Here's your productivity overview
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tasks */}
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Tasks</p>
                    <p className="text-4xl font-bold text-slate-900 mt-3">
                      {stats.total_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
                    <p className="text-4xl font-bold text-amber-600 mt-3">
                      {stats.pending_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
                    <p className="text-4xl font-bold text-emerald-600 mt-3">
                      {stats.completed_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="group bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl p-6 text-white transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Success Rate</p>
                    <p className="text-4xl font-bold mt-3">
                      {stats.completion_rate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity - 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 p-6 transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  Recent Activity
                </h2>

                {stats.recent_activity.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                    <p className="text-sm text-slate-400 mt-1">Start creating tasks to see activity here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_activity.map((activity, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                      >
                        {/* Action Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                          activity.action === 'created' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          activity.action === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          activity.action === 'updated' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                          'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                          {activity.action === 'created' ? (
                            <Plus className="w-5 h-5 text-white" />
                          ) : activity.action === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : activity.action === 'updated' ? (
                            <Circle className="w-5 h-5 text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.action === 'created' && 'Created task: '}
                            {activity.action === 'completed' && 'Completed task: '}
                            {activity.action === 'updated' && 'Updated task: '}
                            {activity.action === 'deleted' && 'Deleted task: '}
                            <span className="text-slate-700">{activity.task_title}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
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
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 p-6 transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-indigo-600 rounded-full"></div>
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <Link
                    href="/tasks"
                    className="group block w-full px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl font-bold text-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <span className="relative">View All Tasks</span>
                  </Link>

                  <Link
                    href="/chat"
                    className="group block w-full px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-center hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      Chat with AI
                    </span>
                  </Link>
                </div>

                {/* Progress Summary */}
                {stats.total_tasks > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-700">Your Progress</p>
                      <p className="text-sm font-bold text-violet-600">{stats.completion_rate.toFixed(0)}%</p>
                    </div>
                    <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-full transition-all duration-700 shadow-lg"
                        style={{ width: `${stats.completion_rate}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-2">
                      {stats.completed_tasks} of {stats.total_tasks} tasks completed
                    </p>
                  </div>
                )}

                {/* Motivational Message */}
                {stats.pending_tasks === 0 && stats.total_tasks > 0 ? (
                  <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-6xl opacity-10">🎉</div>
                    <p className="text-sm font-bold text-emerald-800 relative">
                      All caught up!
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 relative">
                      You've completed all your tasks. Great job!
                    </p>
                  </div>
                ) : stats.pending_tasks > 0 ? (
                  <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-6xl opacity-10">💪</div>
                    <p className="text-sm font-bold text-blue-800 relative">
                      Keep going!
                    </p>
                    <p className="text-xs text-blue-600 mt-1 relative">
                      {stats.pending_tasks} task{stats.pending_tasks !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">Failed to load dashboard</p>
          </div>
        )}
      </main>
    </SidebarLayout>
  )
}

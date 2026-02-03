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
  Zap,
  Bot,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { ReminderList } from '@/components/dashboard/reminder-list'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders'>('overview')

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <SidebarLayout>
      <main className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold ai-gradient-text">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Here's your AI-powered productivity overview
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 glass-card p-1.5 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'ai-gradient-bg text-white shadow-md ai-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'ai-gradient-bg text-white shadow-md ai-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            Reminders
          </button>
        </div>

        {activeTab === 'reminders' ? (
          <ReminderList userId={user.id} />
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tasks */}
              <div className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Tasks</p>
                    <p className="text-4xl font-bold text-white mt-3">
                      {stats.total_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
                    <p className="text-4xl font-bold text-amber-400 mt-3">
                      {stats.pending_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
                    <p className="text-4xl font-bold text-emerald-400 mt-3">
                      {stats.completed_tasks}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300 ai-border-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Success Rate</p>
                    <p className="text-4xl font-bold ai-gradient-text mt-3">
                      {stats.completion_rate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-14 h-14 ai-gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity - 2/3 width */}
              <div className="lg:col-span-2 glass-card p-6">
                <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 ai-gradient-bg rounded-full"></div>
                  Recent Activity
                </h2>

                {stats.recent_activity.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                    <p className="text-sm text-slate-600 mt-1">Start creating tasks to see activity here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_activity.map((activity, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-4 p-4 rounded-xl border border-indigo-500/10 bg-slate-800/30 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                          activity.action === 'created' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          activity.action === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                          activity.action === 'updated' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                          'bg-gradient-to-br from-red-500 to-rose-600'
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

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-300">
                            {activity.action === 'created' && 'Created task: '}
                            {activity.action === 'completed' && 'Completed task: '}
                            {activity.action === 'updated' && 'Updated task: '}
                            {activity.action === 'deleted' && 'Deleted task: '}
                            <span className="text-slate-200">{activity.task_title}</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
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
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <Link
                    href="/tasks"
                    className="group block w-full px-5 py-4 ai-gradient-bg text-white rounded-xl font-bold text-center hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden ai-glow"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <span className="relative">View All Tasks</span>
                  </Link>

                  <Link
                    href="/chat"
                    className="group block w-full px-5 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-center hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden shadow-lg shadow-cyan-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Bot className="w-5 h-5" />
                      Chat with AI
                    </span>
                  </Link>
                </div>

                {/* Progress Summary */}
                {stats.total_tasks > 0 && (
                  <div className="mt-6 pt-6 border-t border-indigo-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-400">Your Progress</p>
                      <p className="text-sm font-bold ai-gradient-text">{stats.completion_rate.toFixed(0)}%</p>
                    </div>
                    <div className="relative w-full h-4 bg-slate-800/60 rounded-full overflow-hidden border border-indigo-500/20">
                      <div
                        className="absolute top-0 left-0 h-full ai-gradient-bg rounded-full transition-all duration-700"
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
                  <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                    <p className="text-sm font-bold text-emerald-300">
                      All caught up!
                    </p>
                    <p className="text-xs text-emerald-400/70 mt-1">
                      You've completed all your tasks. Great job!
                    </p>
                  </div>
                ) : stats.pending_tasks > 0 ? (
                  <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
                    <p className="text-sm font-bold text-indigo-300">
                      Keep going!
                    </p>
                    <p className="text-xs text-indigo-400/70 mt-1">
                      {stats.pending_tasks} task{stats.pending_tasks !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Failed to load dashboard</p>
          </div>
        )}
      </main>
    </SidebarLayout>
  )
}

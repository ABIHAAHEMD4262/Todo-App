'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Clock, Trash2, Send, Loader2 } from 'lucide-react'
import { api, Reminder } from '@/lib/api'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'
import { toast } from 'sonner'

type StatusFilter = 'all' | 'pending' | 'unread' | 'sent'

interface ReminderListProps {
  userId: string
}

export function ReminderList({ userId }: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const response = await api.reminders.list(userId, statusFilter === 'all' ? undefined : statusFilter)
      setReminders(response.reminders)
      setUnreadCount(response.unread_count)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
      toast.error('Failed to load reminders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [userId, statusFilter])

  const handleMarkRead = async (reminderId: number) => {
    try {
      await api.reminders.markRead(userId, reminderId)
      setReminders(prev => prev.map(r =>
        r.id === reminderId ? { ...r, read: true } : r
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success('Marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.reminders.markAllRead(userId)
      setReminders(prev => prev.map(r => ({ ...r, read: true })))
      setUnreadCount(0)
      toast.success('All reminders marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (reminderId: number) => {
    try {
      await api.reminders.delete(userId, reminderId)
      const deleted = reminders.find(r => r.id === reminderId)
      setReminders(prev => prev.filter(r => r.id !== reminderId))
      setTotal(prev => prev - 1)
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      toast.success('Reminder deleted')
    } catch (error) {
      toast.error('Failed to delete reminder')
    }
  }

  const getStatusIcon = (reminder: Reminder) => {
    if (!reminder.sent) {
      return <Clock className="w-4 h-4 text-blue-400" />
    }
    if (!reminder.read) {
      return <Bell className="w-4 h-4 text-amber-400" />
    }
    return <Check className="w-4 h-4 text-slate-500" />
  }

  const getStatusBadge = (reminder: Reminder) => {
    if (!reminder.sent) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
          Pending
        </span>
      )
    }
    if (!reminder.read) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
          Unread
        </span>
      )
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-medium">
        Read
      </span>
    )
  }

  const getIconBg = (reminder: Reminder) => {
    if (!reminder.sent) return 'bg-blue-500/20'
    if (!reminder.read) return 'bg-amber-500/20'
    return 'bg-slate-500/20'
  }

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'unread', label: 'Unread' },
    { key: 'sent', label: 'Sent' },
  ]

  return (
    <div>
      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-2 glass-card p-1.5">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                statusFilter === f.key
                  ? 'ai-gradient-bg text-white shadow-md ai-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all duration-200"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Reminder List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reminders</p>
          <p className="text-sm text-slate-600 mt-1">
            {statusFilter === 'all'
              ? 'Set reminders when creating tasks with due dates'
              : `No ${statusFilter} reminders`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={cn(
                'group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200',
                !reminder.read && reminder.sent
                  ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 hover:bg-amber-500/10'
                  : 'border-indigo-500/10 bg-slate-800/30 hover:border-indigo-500/30 hover:bg-slate-800/50'
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110',
                getIconBg(reminder)
              )}>
                {getStatusIcon(reminder)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {reminder.task_title}
                  </p>
                  {getStatusBadge(reminder)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {reminder.sent ? 'Sent' : 'Scheduled'} {formatDistanceToNow(reminder.remind_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {reminder.sent && !reminder.read && (
                  <button
                    onClick={() => handleMarkRead(reminder.id)}
                    className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

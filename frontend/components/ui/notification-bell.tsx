'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Clock, Trash2, X } from 'lucide-react'
import { api, Reminder } from '@/lib/api'
import { useAuthContext } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'
import { toast } from 'sonner'

// Polling interval for checking due reminders (30 seconds)
const POLL_INTERVAL = 30000

export function NotificationBell() {
  const { user } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch due reminders
  const fetchDueReminders = async () => {
    if (!user) return

    try {
      const response = await api.reminders.getDue(user.id)

      // Show toast for new reminders
      const newReminders = response.reminders.filter(
        r => !reminders.find(existing => existing.id === r.id)
      )

      newReminders.forEach(reminder => {
        toast.info(`Reminder: ${reminder.task_title}`, {
          description: 'Task is due soon!',
          duration: 10000,
          action: {
            label: 'View',
            onClick: () => setIsOpen(true)
          }
        })
      })

      setReminders(response.reminders)
      setUnreadCount(response.unread_count)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    }
  }

  // Fetch all reminders when dropdown opens
  const fetchAllReminders = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await api.reminders.list(user.id, 'unread')
      setReminders(response.reminders)
      setUnreadCount(response.unread_count)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll for due reminders
  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchDueReminders()

    // Set up polling
    const interval = setInterval(fetchDueReminders, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [user])

  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchAllReminders()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (reminderId: number) => {
    if (!user) return

    try {
      await api.reminders.markRead(user.id, reminderId)
      setReminders(prev => prev.filter(r => r.id !== reminderId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark reminder as read')
    }
  }

  const handleMarkAllRead = async () => {
    if (!user) return

    try {
      await api.reminders.markAllRead(user.id)
      setReminders([])
      setUnreadCount(0)
      toast.success('All reminders marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (reminderId: number) => {
    if (!user) return

    try {
      await api.reminders.delete(user.id, reminderId)
      setReminders(prev => prev.filter(r => r.id !== reminderId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to delete reminder')
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          "hover:bg-slate-700/50 text-slate-400 hover:text-white",
          isOpen && "bg-slate-700/50 text-white"
        )}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reminder List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Bell className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "px-4 py-3 hover:bg-slate-700/30 transition-colors",
                      !reminder.read && "bg-indigo-500/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {reminder.task_title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Due {formatDistanceToNow(reminder.remind_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMarkRead(reminder.id)}
                          className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {reminders.length > 0 && (
            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Set reminders when creating tasks with due dates
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

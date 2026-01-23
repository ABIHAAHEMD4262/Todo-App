'use client'

import { Task } from '@/types'
import { Check, Pencil, Trash2, Circle, CheckCircle2, Calendar, Clock, Repeat, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: number) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  isToggling?: boolean
}

// Priority badge colors
const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', color: 'bg-purple-100 text-purple-800', icon: '🔥' },
  high: { label: 'High', color: 'bg-red-100 text-red-800', icon: '🔴' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  low: { label: 'Low', color: 'bg-green-100 text-green-800', icon: '🟢' },
  none: { label: '', color: '', icon: '' }
}

// Check if task is overdue
function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false
  return new Date(dueDate) < new Date()
}

// Format due date
function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
  if (diffDays <= 7) return `In ${diffDays} days`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete, isToggling = false }: TaskItemProps) {
  const overdue = isOverdue(task.due_date, task.completed)
  const priority = priorityConfig[task.priority] || priorityConfig.none

  return (
    <div className={`group glass-card glass-card-hover p-4 transition-all duration-300 ${
      task.completed
        ? 'border-green-500/30 bg-green-950/20'
        : overdue
        ? 'border-red-500/40 bg-red-950/20'
        : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => !isToggling && onToggleComplete(task.id)}
          disabled={isToggling}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isToggling
              ? 'opacity-50 cursor-not-allowed'
              : task.completed
              ? 'bg-green-500 border-green-500 hover:bg-green-600 cursor-pointer'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`text-base font-semibold transition-all ${
              task.completed
                ? 'text-slate-500 line-through'
                : 'text-slate-100'
            }`}>
              {task.title}
            </h3>

            {/* Priority Badge */}
            {task.priority && task.priority !== 'none' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                {priority.icon} {priority.label}
              </span>
            )}

            {/* Recurring Icon */}
            {task.is_recurring && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {task.recurrence_pattern}
              </span>
            )}
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            {/* Status */}
            <span className="flex items-center gap-1">
              {task.completed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Completed
                </>
              ) : overdue ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span className="text-red-600 font-medium">Overdue</span>
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3 text-blue-600" />
                  Pending
                </>
              )}
            </span>

            {/* Due Date */}
            {task.due_date && (
              <>
                <span>•</span>
                <span className={`flex items-center gap-1 ${overdue && !task.completed ? 'text-red-600 font-medium' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  {formatDueDate(task.due_date)}
                </span>
              </>
            )}

            {/* Reminder */}
            {task.reminder_minutes && task.reminder_minutes > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.reminder_minutes >= 60
                    ? `${Math.floor(task.reminder_minutes / 60)}h reminder`
                    : `${task.reminder_minutes}m reminder`}
                </span>
              </>
            )}

            <span>•</span>
            <span>{formatDistanceToNow(task.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

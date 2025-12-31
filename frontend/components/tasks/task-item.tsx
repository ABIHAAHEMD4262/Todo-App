'use client'

import { Task } from '@/types'
import { Check, Pencil, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: number) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  isToggling?: boolean
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete, isToggling = false }: TaskItemProps) {
  return (
    <div className={`group bg-white rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
      task.completed
        ? 'border-green-200 bg-green-50/30'
        : 'border-gray-200 hover:border-blue-300'
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
          <h3 className={`text-base font-semibold mb-1 transition-all ${
            task.completed
              ? 'text-gray-500 line-through'
              : 'text-gray-900'
          }`}>
            {task.title}
          </h3>

          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {task.completed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3 text-blue-600" />
                  Pending
                </>
              )}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(task.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

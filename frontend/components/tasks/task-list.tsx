'use client'

import { Task } from '@/types'
import { TaskItem } from './task-item'
import { CheckCircle2, Circle, Inbox } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (taskId: number) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  filter: 'all' | 'pending' | 'completed'
  togglingTaskId?: number | null
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete, filter, togglingTaskId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          {filter === 'completed' ? (
            <CheckCircle2 className="w-10 h-10 text-gray-400" />
          ) : filter === 'pending' ? (
            <Circle className="w-10 h-10 text-gray-400" />
          ) : (
            <Inbox className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {filter === 'completed' ? 'No completed tasks' :
           filter === 'pending' ? 'No pending tasks' :
           'No tasks yet'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {filter === 'all' && "Start by creating your first task to get organized!"}
          {filter === 'pending' && "All tasks are completed! Great job! 🎉"}
          {filter === 'completed' && "Complete some tasks to see them here."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          isToggling={togglingTaskId === task.id}
        />
      ))}
    </div>
  )
}

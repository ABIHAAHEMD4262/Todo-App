'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/validation'
import { Task } from '@/types'
import { X, Loader2 } from 'lucide-react'
import { PrioritySelector, TagsInput, DueDatePicker, RecurrenceSelector } from '@/components/ui/task-inputs'

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TaskForm({ task, onSubmit, onCancel, isLoading = false }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      tags: task?.tags || [],
      due_date: task?.due_date || '',
      recurrence: task?.recurrence || 'none'
    }
  })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              {...register('title')}
              id="title"
              type="text"
              disabled={isLoading}
              className={`w-full px-5 py-3.5 bg-gray-50 text-gray-900 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-medium ${
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-2">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              disabled={isLoading}
              className={`w-full px-5 py-3.5 bg-gray-50 text-gray-900 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 resize-none ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Add more details about this task..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-2">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <PrioritySelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            {errors.priority && (
              <p className="text-red-600 text-sm mt-2">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            {errors.tags && (
              <p className="text-red-600 text-sm mt-2">
                {errors.tags.message}
              </p>
            )}
          </div>

          {/* Due Date Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <Controller
              name="due_date"
              control={control}
              render={({ field }) => (
                <DueDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            {errors.due_date && (
              <p className="text-red-600 text-sm mt-2">
                {errors.due_date.message}
              </p>
            )}
          </div>

          {/* Recurrence Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recurrence
            </label>
            <Controller
              name="recurrence"
              control={control}
              render={({ field }) => (
                <RecurrenceSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            {errors.recurrence && (
              <p className="text-red-600 text-sm mt-2">
                {errors.recurrence.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                    {task ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  task ? 'Update Task' : 'Create Task'
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

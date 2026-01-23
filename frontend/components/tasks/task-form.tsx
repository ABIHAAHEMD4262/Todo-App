'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/validation'
import { Task, Tag, TaskPriority, TaskRecurrence } from '@/types'
import { X, Loader2 } from 'lucide-react'
import { PrioritySelector, DueDatePicker, RecurrenceSelector } from '@/components/ui/task-inputs'

interface TaskFormProps {
  task?: Task
  availableTags?: Tag[]
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TaskForm({ task, availableTags = [], onSubmit, onCancel, isLoading = false }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: (task?.priority as TaskPriority) || 'none',
      tag_ids: task?.tags?.map(t => t.id) || [],
      due_date: task?.due_date || '',
      reminder_minutes: task?.reminder_minutes || undefined,
      is_recurring: task?.is_recurring || false,
      recurrence_pattern: (task?.recurrence_pattern as TaskRecurrence) || 'none',
      recurrence_interval: task?.recurrence_interval || 1,
      recurrence_end_date: task?.recurrence_end_date || ''
    }
  })

  const isRecurring = watch('is_recurring')
  const recurrencePattern = watch('recurrence_pattern')

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-card bg-slate-900/95 shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 ai-glow">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-indigo-500/20">
          <div>
            <h2 className="text-3xl font-bold ai-gradient-text">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Fill in the details below</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              {...register('title')}
              id="title"
              type="text"
              disabled={isLoading}
              className={`w-full px-5 py-3.5 bg-slate-800/60 text-slate-100 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all duration-200 font-medium placeholder:text-slate-600 ${
                errors.title ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 hover:border-slate-600'
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
            <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              disabled={isLoading}
              className={`w-full px-5 py-3.5 bg-slate-800/60 text-slate-100 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all duration-200 resize-none placeholder:text-slate-600 ${
                errors.description ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 hover:border-slate-600'
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">
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

          {/* Tags Field - Phase 5 */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <Controller
              name="tag_ids"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2 p-3 border-2 border-slate-700 rounded-xl bg-slate-800/40">
                  {availableTags.length === 0 ? (
                    <span className="text-sm text-slate-500">No tags available. Create tags in Tag Management.</span>
                  ) : (
                    availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const newIds = field.value.includes(tag.id)
                            ? field.value.filter((id: number) => id !== tag.id)
                            : [...field.value, tag.id]
                          field.onChange(newIds)
                        }}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          field.value.includes(tag.id)
                            ? 'ring-2 ring-offset-1 ring-gray-400'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: `${tag.color}30`,
                          color: tag.color,
                          borderColor: tag.color
                        }}
                      >
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            />
          </div>

          {/* Due Date and Reminder Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
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
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Reminder (minutes before)
              </label>
              <select
                {...register('reminder_minutes', { valueAsNumber: true })}
                disabled={isLoading}
                className="w-full px-4 py-2 border-2 border-slate-700 rounded-xl bg-slate-800/60 focus:border-indigo-500/50 text-slate-200"
              >
                <option value="">No reminder</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          </div>

          {/* Recurring Task Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_recurring')}
                disabled={isLoading}
                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-300">Recurring Task</span>
            </label>
          </div>

          {/* Recurrence Fields (shown when is_recurring is true) */}
          {isRecurring && (
            <div className="space-y-4 p-4 bg-indigo-950/30 rounded-xl border-2 border-indigo-500/20">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Recurrence Pattern
                </label>
                <Controller
                  name="recurrence_pattern"
                  control={control}
                  render={({ field }) => (
                    <RecurrenceSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              {recurrencePattern === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Custom Interval (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    {...register('recurrence_interval', { valueAsNumber: true })}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border-2 border-slate-700 rounded-xl bg-slate-800/60 focus:border-indigo-500/50 text-slate-200"
                    placeholder="Number of days"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  End Date (Optional)
                </label>
                <Controller
                  name="recurrence_end_date"
                  control={control}
                  render={({ field }) => (
                    <DueDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-indigo-500/20">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-slate-800/60 text-slate-300 rounded-xl font-bold hover:bg-slate-700/60 border border-slate-700 transition-all duration-200 disabled:opacity-50 hover:shadow-md"
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

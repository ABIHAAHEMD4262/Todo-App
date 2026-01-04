'use client'

import { useState } from 'react'
import type { TaskPriority, TaskRecurrence } from '@/types'

// Priority Selector Component (Feature #6)
interface PrioritySelectorProps {
  value?: TaskPriority
  onChange: (priority: TaskPriority) => void
  className?: string
  disabled?: boolean
}

export function PrioritySelector({ value = 'medium', onChange, className = '', disabled = false }: PrioritySelectorProps) {
  const priorities: { value: TaskPriority; label: string; icon: string; color: string }[] = [
    { value: 'high', label: 'High', icon: '🔴', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'medium', label: 'Medium', icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'low', label: 'Low', icon: '🟢', color: 'bg-green-100 text-green-800 border-green-300' }
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Priority
      </label>
      <div className="flex gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-2 rounded-lg border-2 font-medium text-sm
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${value === priority.value
                ? `${priority.color} ring-2 ring-offset-2 ring-gray-400`
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <span className="mr-1">{priority.icon}</span>
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Tags Input Component (Feature #7)
interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  className?: string
  disabled?: boolean
}

export function TagsInput({ value = [], onChange, className = '', disabled = false }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase()
    if (tag && !value.includes(tag) && value.length < 10) {
      onChange([...value, tag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Tags <span className="text-gray-500 text-xs">({value.length}/10)</span>
      </label>
      <div className={`flex flex-wrap gap-2 p-3 border-2 border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="hover:text-blue-900 font-bold disabled:cursor-not-allowed"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? "Add tags..." : ""}
          maxLength={20}
          disabled={disabled || value.length >= 10}
          className="flex-1 min-w-[120px] outline-none text-sm disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <p className="text-xs text-gray-500">
        Press Enter or comma to add a tag. Max 10 tags, 20 chars each.
      </p>
    </div>
  )
}

// Due Date Picker Component (Feature #12)
interface DueDatePickerProps {
  value?: string
  onChange: (date: string) => void
  className?: string
  disabled?: boolean
}

export function DueDatePicker({ value, onChange, className = '', disabled = false }: DueDatePickerProps) {
  // Convert ISO string to local datetime-local format
  const getLocalDateTimeValue = () => {
    if (!value) return ''
    try {
      const date = new Date(value)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Convert local datetime to ISO string
      const date = new Date(e.target.value)
      onChange(date.toISOString())
    } else {
      onChange('')
    }
  }

  const clearDate = () => {
    onChange('')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Due Date
      </label>
      <div className="relative">
        <input
          type="datetime-local"
          value={getLocalDateTimeValue()}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 text-sm bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ colorScheme: 'light' }}
        />
        {value && (
          <button
            type="button"
            onClick={clearDate}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold disabled:cursor-not-allowed"
            title="Clear date"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Recurrence Selector Component (Feature #11)
interface RecurrenceSelectorProps {
  value?: TaskRecurrence
  onChange: (recurrence: TaskRecurrence) => void
  className?: string
  disabled?: boolean
}

export function RecurrenceSelector({ value = 'none', onChange, className = '', disabled = false }: RecurrenceSelectorProps) {
  const options: { value: TaskRecurrence; label: string; icon: string }[] = [
    { value: 'none', label: 'None', icon: '🚫' },
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' }
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Recurrence
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TaskRecurrence)}
        disabled={disabled}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 text-sm bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
      {value !== 'none' && (
        <p className="text-xs text-blue-600">
          When completed, a new task will be created automatically
        </p>
      )}
    </div>
  )
}

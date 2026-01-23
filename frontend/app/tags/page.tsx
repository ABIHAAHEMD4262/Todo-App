'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/ui/sidebar'
import { useAuthContext } from '@/components/providers/auth-provider'
import { api } from '@/lib/api'
import { Tag, CreateTagData } from '@/types'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Tag as TagIcon,
  X,
  Check
} from 'lucide-react'

export default function TagsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')

  // Preset colors
  const presetColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E', '#64748B'
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load tags
  const loadTags = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.tags.list(user.id)
      setTags(response.tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
      toast.error('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  // Create tag
  const handleCreateTag = async () => {
    if (!user || !newTagName.trim()) return

    try {
      setIsCreating(true)
      const tag = await api.tags.create(user.id, {
        name: newTagName.trim(),
        color: newTagColor
      })
      setTags([...tags, tag])
      setNewTagName('')
      setNewTagColor('#3B82F6')
      toast.success('Tag created successfully')
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error('Failed to create tag')
    } finally {
      setIsCreating(false)
    }
  }

  // Update tag
  const handleUpdateTag = async () => {
    if (!user || !editingTag) return

    try {
      const updated = await api.tags.update(user.id, editingTag.id, {
        name: editingTag.name,
        color: editingTag.color
      })
      setTags(tags.map(t => t.id === updated.id ? updated : t))
      setEditingTag(null)
      toast.success('Tag updated successfully')
    } catch (error) {
      console.error('Failed to update tag:', error)
      toast.error('Failed to update tag')
    }
  }

  // Delete tag
  const handleDeleteTag = async (tagId: number) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) {
      return
    }

    try {
      await api.tags.delete(user.id, tagId)
      setTags(tags.filter(t => t.id !== tagId))
      toast.success('Tag deleted successfully')
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast.error('Failed to delete tag')
    }
  }

  if (authLoading || loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold ai-gradient-text mb-2 flex items-center gap-3">
            <TagIcon className="w-8 h-8 text-indigo-400" />
            Tag Management
          </h1>
          <p className="text-slate-400">Create and manage tags to organize your tasks</p>
        </div>

        {/* Create New Tag */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Create New Tag</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-400 mb-2">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                maxLength={50}
                className="w-full px-4 py-2.5 border-2 border-slate-700 rounded-xl focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 bg-slate-800/60 text-slate-200 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-slate-700 cursor-pointer"
                  style={{ backgroundColor: newTagColor }}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isCreating}
              className="px-6 py-2.5 ai-gradient-bg text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-glow"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Tag
            </button>
          </div>

          {/* Preset Colors */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">Quick Colors</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                    newTagColor === color ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            Your Tags ({tags.length})
          </h2>

          {tags.length === 0 ? (
            <div className="text-center py-12">
              <TagIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No tags yet. Create your first tag above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-slate-800/40 hover:border-indigo-500/40 transition-colors"
                >
                  {editingTag?.id === tag.id ? (
                    // Edit Mode
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="flex-1 px-3 py-1.5 border-2 border-slate-700 rounded-lg text-sm text-slate-200 bg-slate-800/60"
                        autoFocus
                      />
                      <input
                        type="color"
                        value={editingTag.color}
                        onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button
                        onClick={handleUpdateTag}
                        className="p-1.5 text-green-400 hover:bg-green-900/30 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="p-1.5 text-slate-500 hover:bg-slate-700/50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-slate-200">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

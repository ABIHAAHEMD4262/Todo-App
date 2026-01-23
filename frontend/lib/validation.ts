import { z } from "zod"

// Signup validation schema
export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters").trim(),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters")
})

export type SignupFormData = z.infer<typeof signupSchema>

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

export type LoginFormData = z.infer<typeof loginSchema>

// Task validation schemas - Phase 5 Enhanced
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
  description: z.string().max(1000, "Description must be less than 1000 characters").trim().optional(),
  // Phase 5: Enhanced priority
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).default('none'),
  // Phase 5: Due date and reminder
  due_date: z.string().optional(),
  reminder_minutes: z.number().min(0).optional(),
  // Phase 5: Recurring tasks
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom']).default('none'),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_end_date: z.string().optional(),
  // Phase 5: Tags (tag IDs)
  tag_ids: z.array(z.number()).max(10).default([])
})

export type TaskFormData = z.infer<typeof taskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
  reminder_minutes: z.number().min(0).optional(),
  is_recurring: z.boolean().optional(),
  recurrence_pattern: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom']).optional(),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_end_date: z.string().optional(),
  tag_ids: z.array(z.number()).max(10).optional()
})

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>

// Tag validation schemas - Phase 5
export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50, "Tag name must be less than 50 characters").trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)").default('#808080')
})

export type TagFormData = z.infer<typeof tagSchema>

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

// Task validation schemas
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
  description: z.string().max(1000, "Description must be less than 1000 characters").trim().optional()
})

export type TaskFormData = z.infer<typeof taskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  completed: z.boolean().optional()
})

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>

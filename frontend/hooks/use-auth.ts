'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)

  // Mark as mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    if (!mounted) return

    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')

        if (token && userData) {
          // Restore user from localStorage
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (err) {
        console.error('❌ useAuth: Session check failed:', err)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [mounted])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Call our backend auth endpoint directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }))
        const errorMessage = errorData.detail || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Extract user and token from response
      const { user: userData, access_token: token } = data

      // Store token (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }

      // Store user data for session persistence (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(userData))
      }

      // Update user state
      setUser(userData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password'
      setError(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }))
        const errorMessage = errorData.detail || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Extract user and token from response
      const { user: userData, access_token: token } = data

      // Store token (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }

      // Store user data for session persistence (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(userData))
      }

      // Update user state
      setUser(userData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)

      // Clear localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }

      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout
  }
}
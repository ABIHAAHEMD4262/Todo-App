'use client'

import { useState, useEffect, useCallback } from 'react'
import { authClient } from '@/lib/auth'
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
    console.log('🔍 useAuth: mounted =', mounted)
    if (!mounted) return

    const checkSession = async () => {
      console.log('🔍 useAuth: checkSession starting...')
      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')

        console.log('🔍 useAuth: localStorage contents:')
        console.log('  - token:', token ? `${token.substring(0, 20)}...` : 'NULL')
        console.log('  - userData:', userData ? 'EXISTS' : 'NULL')

        if (token && userData) {
          // Restore user from localStorage
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          console.log('✅ useAuth: Session restored for user:', parsedUser.email)
        } else {
          // No session found
          console.log('❌ useAuth: No active session')
          setUser(null)
        }
      } catch (err) {
        console.error('❌ useAuth: Session check failed:', err)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setUser(null)
      } finally {
        setLoading(false)
        console.log('🔍 useAuth: checkSession complete, loading = false')
      }
    }

    checkSession()
  }, [mounted])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Attempting signup for:', email)

      const response = await authClient.signUp.email({
        name,
        email,
        password,
      })

      console.log('Signup response:', response)

      if (response.error) {
        const errorMessage = response.error.message || 'Signup failed'
        console.error('Signup error:', errorMessage)
        throw new Error(errorMessage)
      }

      if (response.data) {
        console.log('Signup successful:', response.data)
      }
    } catch (err) {
      console.error('Signup exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Attempting login for:', email)

      const response = await authClient.signIn.email({
        email,
        password,
      })

      console.log('🔐 Login response:', response)

      if (response.error) {
        const errorMessage = response.error.message || 'Invalid email or password'
        console.error('❌ Login error:', errorMessage)
        throw new Error(errorMessage)
      }

      if (response.data) {
        console.log('🔐 Response data:', response.data)

        const userData = response.data.user

        console.log('🔐 User data:', userData)

        // Get all cookies to find the session token
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)

        console.log('🔐 Cookies:', Object.keys(cookies))

        // Better Auth stores session in a cookie, try to get it
        const sessionToken = cookies['better-auth.session_token'] || cookies['session_token'] || cookies['auth_session']

        console.log('🔐 Session token from cookie:', sessionToken ? `${sessionToken.substring(0, 20)}...` : 'NULL')

        // For now, create a simple token from user ID
        // The backend will validate against Better Auth's database
        const token = userData.id

        // Store token (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
          console.log('✅ Token stored in localStorage:', token)
        }

        // Transform Better Auth user to our User type
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          created_at: new Date(userData.createdAt).toISOString()
        }

        // Store user data for session persistence (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(user))
          console.log('✅ User data stored:', user)
        }

        console.log('✅ Login successful for user:', user.email)

        // Update user state
        setUser(user)
      } else {
        console.error('❌ No data in response!')
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password'
      setError(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await authClient.signOut()

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

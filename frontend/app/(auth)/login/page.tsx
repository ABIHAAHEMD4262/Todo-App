'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, CheckSquare } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { useAuthContext } from '@/components/providers/auth-provider'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data.email, data.password)

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      } else {
        localStorage.removeItem('remember_me')
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      // Generic error message for security (don't reveal if email exists)
      toast.error('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-violet-500/30 transform transition-transform hover:scale-105">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 text-lg">
            Log in to continue to Taskly
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full px-5 py-4 bg-white text-slate-900 border rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white outline-none transition duration-200 placeholder:text-slate-400 shadow-sm ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-violet-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center font-medium">
                  <span className="mr-1">⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`w-full px-5 py-4 pr-12 bg-white text-slate-900 border rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white outline-none transition duration-200 placeholder:text-slate-400 shadow-sm ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-violet-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2 flex items-center font-medium">
                  <span className="mr-1">⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-sm text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-violet-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">New to Taskly?</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-violet-600 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border border-violet-200 rounded-2xl font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-violet-200/50"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Built with ❤️ for Hackathon II
        </p>
      </div>
    </div>
  )
}

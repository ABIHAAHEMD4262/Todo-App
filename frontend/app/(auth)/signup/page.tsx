'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, CheckSquare, Check } from 'lucide-react'
import { signupSchema, type SignupFormData } from '@/lib/validation'
import { useAuthContext } from '@/components/providers/auth-provider'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const password = watch('password', '')

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true)
      await signup(data.name, data.email, data.password)

      toast.success('Account created successfully! Please log in.')
      router.push('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <CheckSquare className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Get started with Taskly today</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition duration-200 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition duration-200 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 text-gray-900 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition duration-200 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicators */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs">
                    <Check className={`w-3 h-3 mr-2 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={passwordChecks.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Check className={`w-3 h-3 mr-2 ${passwordChecks.hasLetter ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={passwordChecks.hasLetter ? 'text-green-600' : 'text-gray-500'}>
                      Contains letters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Check className={`w-3 h-3 mr-2 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                      Contains numbers
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <p className="text-xs text-gray-600">
                By signing up, you agree to our{' '}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-semibold transition-all duration-200"
            >
              Log in instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Hackathon II - Phase II Web Application
        </p>
      </div>
    </div>
  )
}

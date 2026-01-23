'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, Brain, Check } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 ai-gradient-bg rounded-3xl mb-6 shadow-2xl shadow-indigo-500/30 transform transition-transform hover:scale-105 ai-glow">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold ai-gradient-text mb-2">
            Create Account
          </h1>
          <p className="text-slate-400 text-lg">
            Get started with Taskly AI today
          </p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                className={`w-full px-5 py-4 bg-slate-800/60 text-slate-100 border-2 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition duration-200 placeholder:text-slate-600 ${
                  errors.name ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 hover:border-slate-600'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full px-5 py-4 bg-slate-800/60 text-slate-100 border-2 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition duration-200 placeholder:text-slate-600 ${
                  errors.email ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 hover:border-slate-600'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full px-5 py-4 pr-12 bg-slate-800/60 text-slate-100 border-2 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition duration-200 placeholder:text-slate-600 ${
                    errors.password ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 hover:border-slate-600'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-4 space-y-2 bg-slate-800/40 rounded-xl p-4 border border-indigo-500/10">
                  <div className="flex items-center text-sm">
                    <Check className={`w-4 h-4 mr-2 ${passwordChecks.length ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`font-medium ${passwordChecks.length ? 'text-emerald-300' : 'text-slate-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className={`w-4 h-4 mr-2 ${passwordChecks.hasLetter ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`font-medium ${passwordChecks.hasLetter ? 'text-emerald-300' : 'text-slate-500'}`}>
                      Contains letters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className={`w-4 h-4 mr-2 ${passwordChecks.hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`font-medium ${passwordChecks.hasNumber ? 'text-emerald-300' : 'text-slate-500'}`}>
                      Contains numbers
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-sm mt-2 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <p className="text-sm text-slate-500">
                By signing up, you agree to our{' '}
                <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full ai-gradient-bg text-white py-4 px-6 rounded-2xl font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg ai-glow"
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
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-indigo-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-indigo-300 bg-indigo-900/20 border border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-900/30 rounded-2xl font-bold transition-all duration-300"
            >
              Log in instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-8 font-medium">
          Taskly AI - Agentic Task Management
        </p>
      </div>
    </div>
  )
}

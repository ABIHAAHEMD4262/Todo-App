'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import {
  Loader2,
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Bot,
  Brain,
  MessageSquare,
  Cpu,
  Workflow,
  Tag
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-indigo-500/10 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 ai-gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold ai-gradient-text">
                Taskly AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white font-semibold transition-colors">
                Features
              </a>
              <a href="#ai-chatbot" className="text-slate-400 hover:text-white font-semibold transition-colors">
                AI Chatbot
              </a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white font-semibold transition-colors">
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 ai-gradient-bg text-white rounded-xl font-bold hover:opacity-90 transition shadow-md ai-glow transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-indigo-300">AI-Powered Task Management</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Your AI Agent</span>
                <br />
                <span className="text-white">for </span>
                <span className="ai-gradient-text">
                  Productivity
                </span>
              </h1>

              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                An intelligent agentic AI todo app with built-in chatbot, smart prioritization,
                and autonomous task management. Let AI handle the complexity while you focus on what matters.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <Link
                  href="/signup"
                  className="group px-8 py-4 ai-gradient-bg text-white rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-xl ai-glow transform hover:scale-105 flex items-center gap-2"
                >
                  Start with AI
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-slate-800/60 text-slate-200 rounded-2xl font-bold text-lg border border-indigo-500/20 hover:border-indigo-500/40 transition shadow-sm backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>

              {/* AI Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-indigo-500/20">
                <div className="text-center">
                  <p className="text-2xl font-bold ai-gradient-text">AI</p>
                  <p className="text-xs text-slate-500 font-medium">Powered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-xs text-slate-500 font-medium">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Smart</p>
                  <p className="text-xs text-slate-500 font-medium">Priorities</p>
                </div>
              </div>
            </div>

            {/* Right Column - AI Visual */}
            <div className="relative">
              <div className="relative glass-card p-8 ai-glow">
                {/* Mock AI Dashboard */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 text-center">
                      <Target className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">24</p>
                      <p className="text-xs text-slate-500">Tasks</p>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center">
                      <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">8</p>
                      <p className="text-xs text-slate-500">Pending</p>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">67%</p>
                      <p className="text-xs text-slate-500">Done</p>
                    </div>
                  </div>

                  {/* AI Chat Preview */}
                  <div className="bg-slate-800/60 border border-indigo-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-semibold text-indigo-300">AI Assistant</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      "I've prioritized your tasks. Focus on the project proposal first - it's due tomorrow."
                    </p>
                  </div>

                  {/* Sample Tasks */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-indigo-500/10">
                      <div className="w-5 h-5 rounded-full border-2 border-red-400"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">Complete project proposal</p>
                        <span className="text-xs text-red-400">Urgent</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 line-through">Team meeting notes</p>
                    </div>
                  </div>
                </div>

                {/* Floating AI Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 ai-gradient-bg rounded-2xl shadow-lg flex items-center justify-center transform rotate-12 ai-glow">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-12">
                  <Cpu className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Section */}
      <section id="ai-chatbot" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4 backdrop-blur-sm">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300">AI-Powered Chatbot</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Meet Your </span>
              <span className="ai-gradient-text">AI Task Assistant</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Our built-in AI chatbot understands your tasks, suggests priorities, and helps you
              stay organized with natural language conversations. Ask it anything about your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chatbot Feature 1 */}
            <div className="glass-card p-8 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Natural Language Tasks</h3>
              <p className="text-slate-400 leading-relaxed">
                Just tell the AI what you need to do in plain English. It creates, updates, and
                organizes tasks automatically from your conversations.
              </p>
            </div>

            {/* Chatbot Feature 2 */}
            <div className="glass-card p-8 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 ai-gradient-bg rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Prioritization</h3>
              <p className="text-slate-400 leading-relaxed">
                The AI analyzes deadlines, dependencies, and workload to suggest the optimal order
                for completing your tasks each day.
              </p>
            </div>

            {/* Chatbot Feature 3 */}
            <div className="glass-card p-8 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Workflow Automation</h3>
              <p className="text-slate-400 leading-relaxed">
                Set up recurring patterns, automated reminders, and smart workflows.
                The AI learns your habits and adapts accordingly.
              </p>
            </div>
          </div>

          {/* Chat Demo */}
          <div className="mt-12 max-w-2xl mx-auto glass-card p-6 ai-border-glow">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-indigo-500/20">
              <Bot className="w-6 h-6 text-indigo-400" />
              <span className="font-bold text-slate-200">Taskly AI Chat</span>
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-indigo-600/30 border border-indigo-500/30 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm text-slate-200">What should I focus on today?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm text-slate-300">
                    Based on your deadlines, I recommend:<br/>
                    1. Project proposal (due tomorrow, high priority)<br/>
                    2. Code review for PR #42 (team is waiting)<br/>
                    3. Update weekly report (recurring, medium priority)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Intelligent Features for </span>
              <span className="ai-gradient-text">Modern Workflows</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              AI-enhanced tools designed to make task management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-8 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 ai-gradient-bg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Task Management</h3>
              <p className="text-slate-400 leading-relaxed">
                Create, update, and organize tasks with AI-assisted categorization and priority detection.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tags & Categories</h3>
              <p className="text-slate-400 leading-relaxed">
                Organize with custom color-coded tags. Filter and search across all your tasks instantly.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analytics Dashboard</h3>
              <p className="text-slate-400 leading-relaxed">
                Visualize productivity with real-time statistics, completion rates, and activity tracking.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Due Dates & Reminders</h3>
              <p className="text-slate-400 leading-relaxed">
                Never miss a deadline. Smart reminders and overdue detection keep you on track.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-slate-400 leading-relaxed">
                Enterprise-grade security with JWT authentication. Your data stays private and encrypted.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recurring Tasks</h3>
              <p className="text-slate-400 leading-relaxed">
                Automate repeating tasks with daily, weekly, monthly, or custom schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Get Started in </span>
              <span className="ai-gradient-text">Seconds</span>
            </h2>
            <p className="text-xl text-slate-400">
              Three simple steps to AI-powered productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 ai-gradient-bg rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ai-glow">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Account</h3>
              <p className="text-slate-400">
                Sign up in seconds. Your AI workspace is ready immediately.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chat with AI</h3>
              <p className="text-slate-400">
                Tell the AI your tasks in natural language or add them manually.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/30">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stay Productive</h3>
              <p className="text-slate-400">
                Let AI prioritize and remind you. Track progress on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 ai-gradient-bg opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for <span className="ai-gradient-text">AI-Powered</span> Productivity?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join the future of task management with your personal AI assistant
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-10 py-5 ai-gradient-bg text-white rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-2xl ai-glow transform hover:scale-105"
          >
            Get Started with AI
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <p className="text-slate-500 mt-6 text-sm font-medium">
            Free to use. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 ai-gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Taskly AI</span>
              </div>
              <p className="text-slate-500 mb-4">
                AI-powered task management for the modern workflow.
                Built with Next.js, FastAPI, and advanced AI capabilities.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#ai-chatbot" className="hover:text-indigo-400 transition-colors">AI Chatbot</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Get Started</h3>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="/signup" className="hover:text-indigo-400 transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-indigo-500/10 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; 2025 Taskly AI. Agentic AI Todo Application. Built with Spec-Driven Development.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

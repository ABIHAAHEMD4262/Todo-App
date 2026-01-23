'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Settings,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
}

export function Sidebar({ isMobileOpen: externalMobileOpen, setIsMobileOpen: externalSetMobileOpen }: { isMobileOpen?: boolean; setIsMobileOpen?: (open: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isMobileOpen = externalMobileOpen ?? internalMobileOpen
  const setIsMobileOpen = externalSetMobileOpen ?? setInternalMobileOpen

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: <CheckSquare className="w-5 h-5" />
    },
    {
      name: 'Tags',
      href: '/tags',
      icon: <Tag className="w-5 h-5" />
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: <MessageSquare className="w-5 h-5" />
    }
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
        "border-r border-slate-700/50 shadow-2xl transition-all duration-300",
        isCollapsed ? "w-20" : "w-72",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Taskly</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                  isActive ? "bg-white/20" : "group-hover:bg-slate-700"
                )}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Active Indicator */}
                {isActive && isCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700/50">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 mb-4 px-2 py-3 rounded-xl bg-slate-800/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={async () => {
              try {
                await logout()
                router.push('/')
              } catch (error) {
                console.error('Logout failed:', error)
              }
            }}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-300",
              "hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg group-hover:bg-red-500/20 transition-all duration-200">
              <LogOut className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200 hidden lg:flex z-50"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <Menu className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
        </button>
      </aside>
    )
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0a0e1a] bg-grid">
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 transition-all duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center ai-glow">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold ai-gradient-text">Taskly AI</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

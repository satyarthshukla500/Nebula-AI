'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar'
import { useAuthStore } from '@/store/auth-store'
import { useState } from 'react'

const workspaces = [
  { name: 'General Chat', href: '/dashboard/workspaces/chat', icon: '💬' },
  { name: 'Explain Assist', href: '/dashboard/workspaces/explain', icon: '📚' },
  { name: 'Debug Workspace', href: '/dashboard/workspaces/debug', icon: '🐛' },
  { name: 'Smart Summarizer', href: '/dashboard/workspaces/summarizer', icon: '📝' },
]

const arena = [
  { name: 'Quiz Arena', href: '/dashboard/workspaces/quiz-arena', icon: '🎯' },
  { name: 'Interactive Quiz', href: '/dashboard/workspaces/interactive-quiz', icon: '🎮' },
]

const support = [
  { name: 'Cyber Safety', href: '/dashboard/workspaces/cyber-safety', icon: '🛡️' },
  { name: 'Mental Wellness', href: '/dashboard/workspaces/wellness', icon: '🧘' },
  { name: 'Study Focus', href: '/dashboard/workspaces/study', icon: '📖' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(false)
  
  // Get current workspace from pathname
  const getCurrentWorkspace = () => {
    if (pathname.includes('/chat')) return 'general_chat'
    if (pathname.includes('/explain')) return 'explain_assist'
    if (pathname.includes('/debug')) return 'debug_workspace'
    if (pathname.includes('/summarizer')) return 'smart_summarizer'
    if (pathname.includes('/quiz-arena')) return 'quiz_arena'
    if (pathname.includes('/interactive-quiz')) return 'interactive_quiz'
    if (pathname.includes('/cyber-safety')) return 'cyber_safety'
    if (pathname.includes('/wellness')) return 'mental_wellness'
    if (pathname.includes('/study')) return 'study_focus'
    return 'general_chat'
  }
  
  // Get user ID from auth store, fallback to demo user for development
  const { user } = useAuthStore()
  const userId = user?.id || 'demo-user-123'
  
  const handleSessionSelect = (sessionId: string) => {
    // Session is loaded by ChatHistorySidebar, just close the history panel
    setShowHistory(false)
  }

  const NavSection = ({ title, items }: { title: string; items: typeof workspaces }) => (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
      <div className="p-6 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
          <span className="text-xl font-bold text-gray-900">Nebula AI</span>
        </Link>
      </div>

      {/* Chat History Toggle Button */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            showHistory
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <span className="flex items-center">
            <span className="mr-3 text-lg">💬</span>
            Chat History
          </span>
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              showHistory ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Chat History Sidebar (Collapsible) */}
      {showHistory && (
        <div className="px-3 pb-4 flex-shrink-0 max-h-96 overflow-hidden">
          <ChatHistorySidebar
            userId={userId}
            currentWorkspace={getCurrentWorkspace()}
            onSessionSelect={handleSessionSelect}
          />
        </div>
      )}

      {/* Workspace Navigation */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <NavSection title="Workspaces" items={workspaces} />
        <NavSection title="Arena" items={arena} />
        <NavSection title="Support" items={support} />
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar'
import ThemePanel from '@/components/ThemePanel'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false)
  
  // Load collapse state from localStorage
  useEffect(() => {
    const savedCollapseState = localStorage.getItem('sidebar-collapsed')
    if (savedCollapseState !== null) {
      setIsCollapsed(savedCollapseState === 'true')
    }
  }, [])
  
  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }
  
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
  
  // If no user, try to get from Supabase session
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const getUserId = async () => {
      if (user?.id) {
        setSupabaseUserId(null)
        return
      }
      
      // Try to get from Supabase session
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.id) {
          console.log('[Sidebar] Got userId from Supabase:', session.user.id)
          setSupabaseUserId(session.user.id)
        } else {
          console.warn('[Sidebar] No user session found, using demo user')
          setSupabaseUserId(null)
        }
      } catch (error) {
        console.error('[Sidebar] Error getting user session:', error)
        setSupabaseUserId(null)
      }
    }
    
    getUserId()
  }, [user])
  
  // Fallback chain: auth store -> supabase session -> demo user (safety net)
  const userId = user?.id || supabaseUserId || 'demo-user-123'
  
  // Set current user in chat store when user changes
  const { setCurrentUser, clearWorkspace } = useChatStore()
  
  useEffect(() => {
    if (userId) {
      console.log('[Sidebar] Setting current user:', userId)
      setCurrentUser(userId)
    }
  }, [userId, setCurrentUser])
  
  const handleSessionSelect = (sessionId: string) => {
    // Session is loaded by ChatHistorySidebar
    // Close the history panel and let the store handle navigation
    setShowHistory(false)
  }
  
  const getCurrentWorkspaceFromURL = () => {
    const path = window.location.pathname
    if (path.includes('cyber-safety')) return 'cyber-safety'
    if (path.includes('wellness')) return 'wellness'
    if (path.includes('debug')) return 'debug_workspace'
    if (path.includes('explain')) return 'explain_assist'
    if (path.includes('summarizer')) return 'smart_summarizer'
    if (path.includes('study')) return 'study_focus'
    if (path.includes('quiz-arena')) return 'quiz'
    if (path.includes('interactive-quiz')) return 'quiz'
    return 'general_chat'
  }
  
  const handleNewChat = () => {
    const workspaceType = getCurrentWorkspaceFromURL()
    console.log('[New Chat] Clearing workspace:', workspaceType)
    clearWorkspace(workspaceType)
    window.location.reload()
  }

  const NavSection = ({ title, items }: { title: string; items: typeof workspaces }) => (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-150" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:scale-105',
                isActive
                  ? 'text-white shadow-glow'
                  : 'hover:shadow-glow'
              )}
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text)',
              }}
              title={isCollapsed ? item.name : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <aside 
      className={cn(
        'bg-white border-r h-screen overflow-y-auto flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo with Glow Effect */}
      <div className={cn('p-6 flex-shrink-0 transition-all duration-300', isCollapsed && 'p-3')}>
        <Link href="/dashboard" className="flex items-center justify-center">
          <div 
            className={cn(
              'relative transition-all duration-300 animate-pulse-glow',
              isCollapsed ? 'w-12 h-12' : 'w-32 h-20'
            )}
            style={{
              filter: 'drop-shadow(0 0 20px var(--color-glow))',
            }}
          >
            <Image 
              src="/nebula-logo.png" 
              alt="Nebula AI" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn('w-5 h-5 transition-transform duration-300', isCollapsed ? 'rotate-180' : '')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>

      {/* Dashboard Button */}
      <div className="px-3 pb-2 flex-shrink-0">
        <Link href="/dashboard">
          <button
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105"
            style={{
              backgroundColor: pathname === '/dashboard' ? 'var(--color-accent)' : 'var(--color-surface-hover)',
              color: pathname === '/dashboard' ? 'white' : 'var(--color-text)',
            }}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <span className="text-lg flex-shrink-0">🏠</span>
            {!isCollapsed && <span className="ml-2">Dashboard</span>}
          </button>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105 text-white shadow-sm"
          style={{
            background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          }}
          title={isCollapsed ? 'New Chat' : undefined}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </button>
      </div>

      {/* Chat History Toggle Button */}
      {!isCollapsed && (
        <div className="px-3 pb-2 flex-shrink-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105'
            )}
            style={{
              backgroundColor: showHistory ? 'var(--color-accent)' : 'var(--color-surface-hover)',
              color: showHistory ? 'white' : 'var(--color-text)',
            }}
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
      )}

      {/* Chat History Sidebar (Collapsible) */}
      {showHistory && !isCollapsed && (
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

      {/* Theme Switcher Button at Bottom */}
      <div className="px-3 py-4 flex-shrink-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {/* Theme Dots */}
        {!isCollapsed && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setTheme('dark')}
              className="w-6 h-6 rounded-full transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #7c6bff, #00d4ff)',
                border: theme === 'dark' ? '2px solid white' : '2px solid transparent',
                transform: theme === 'dark' ? 'scale(1.2)' : 'scale(1)',
              }}
              title="Dark theme"
            />
            <button
              onClick={() => setTheme('aurora')}
              className="w-6 h-6 rounded-full transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                border: theme === 'aurora' ? '2px solid white' : '2px solid transparent',
                transform: theme === 'aurora' ? 'scale(1.2)' : 'scale(1)',
              }}
              title="Aurora theme"
            />
            <button
              onClick={() => setTheme('sunset')}
              className="w-6 h-6 rounded-full transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
                border: theme === 'sunset' ? '2px solid white' : '2px solid transparent',
                transform: theme === 'sunset' ? 'scale(1.2)' : 'scale(1)',
              }}
              title="Sunset theme"
            />
            <button
              onClick={() => setTheme('light')}
              className="w-6 h-6 rounded-full transition-all hover:scale-110"
              style={{
                background: '#f0f2ff',
                border: theme === 'light' ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                transform: theme === 'light' ? 'scale(1.2)' : 'scale(1)',
              }}
              title="Light theme"
            />
            <button
              onClick={() => setShowThemePanel(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
              }}
              title="Custom theme"
            >
              +
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowThemePanel(true)}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
          }}
          title={isCollapsed ? 'Switch theme' : undefined}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          {!isCollapsed && <span className="ml-2">Theme</span>}
        </button>

        {/* Cursor Settings Button */}
        <Link href="/dashboard/settings/cursor">
          <button
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:scale-105 mt-2"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text)',
            }}
            title={isCollapsed ? 'Cursor Style' : undefined}
          >
            <span className="text-lg flex-shrink-0">🖱️</span>
            {!isCollapsed && <span className="ml-2">Cursor Style</span>}
          </button>
        </Link>
        
        {/* Quick Theme Switcher Dropdown */}
        {showThemeSwitcher && !isCollapsed && (
          <div 
            className="mt-2 p-2 rounded-lg space-y-1"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
            }}
          >
            {['dark', 'light', 'aurora', 'sunset'].map((themeName) => (
              <button
                key={themeName}
                onClick={() => {
                  setTheme(themeName as any)
                  setShowThemeSwitcher(false)
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded transition-all duration-150 hover:scale-105',
                  theme === themeName && 'shadow-glow'
                )}
                style={{
                  backgroundColor: theme === themeName ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: theme === themeName ? 'white' : 'var(--color-text)',
                }}
              >
                <span className="capitalize">{themeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Theme Panel */}
      <ThemePanel isOpen={showThemePanel} onClose={() => setShowThemePanel(false)} />
    </aside>
  )
}

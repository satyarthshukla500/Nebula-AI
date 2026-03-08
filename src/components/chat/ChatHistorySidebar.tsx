'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chat-store'
import { Card } from '@/components/ui/Card'

interface ChatHistorySidebarProps {
  userId: string
  currentWorkspace: string
  onSessionSelect?: (sessionId: string) => void
}

interface SessionListItem {
  sessionId: string
  title: string
  workspace: string
  createdAt: Date | string
  messageCount: number
}

interface GroupedSessions {
  today: SessionListItem[]
  yesterday: SessionListItem[]
  previous: SessionListItem[]
}

export function ChatHistorySidebar({ 
  userId, 
  currentWorkspace,
  onSessionSelect 
}: ChatHistorySidebarProps) {
  const router = useRouter()
  const { 
    chatHistory, 
    loadChatHistory, 
    loadSession, 
    deleteSession,
    currentSessionId 
  } = useChatStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      // Don't load if no userId
      if (!userId) {
        console.log('[ChatHistory] No userId available, skipping load')
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('[ChatHistory] Loading history for userId:', userId)
        await loadChatHistory(userId)
      } catch (err: any) {
        console.error('[ChatHistory] Load error:', err)
        setError(err.message || 'Failed to load chat history')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHistory()
  }, [userId, loadChatHistory])

  // Group sessions by time period
  const groupSessionsByTime = (sessions: SessionListItem[]): GroupedSessions => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const grouped: GroupedSessions = {
      today: [],
      yesterday: [],
      previous: []
    }

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt)
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      )

      if (sessionDay.getTime() === today.getTime()) {
        grouped.today.push(session)
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(session)
      } else {
        grouped.previous.push(session)
      }
    })

    return grouped
  }

  // Handle session click
  const handleSessionClick = async (session: SessionListItem) => {
    try {
      console.log('[ChatHistory] Loading session:', session.sessionId, 'workspace:', session.workspace)
      
      // Load the session (this will set messages in store)
      await loadSession(session.sessionId)
      
      // Navigate to the correct workspace
      const workspaceRoutes: Record<string, string> = {
        'general_chat': '/dashboard/workspaces/chat',
        'explain_assist': '/dashboard/workspaces/explain',
        'debug_workspace': '/dashboard/workspaces/debug',
        'smart_summarizer': '/dashboard/workspaces/summarizer',
        'quiz': '/dashboard/workspaces/quiz-arena',
        'cyber-safety': '/dashboard/workspaces/cyber-safety',
        'wellness': '/dashboard/workspaces/wellness',
        'study_focus': '/dashboard/workspaces/study',
      }
      
      const route = workspaceRoutes[session.workspace] || '/dashboard/workspaces/chat'
      console.log('[ChatHistory] Navigating to:', route)
      router.push(route)
      
      // Notify parent
      onSessionSelect?.(session.sessionId)
    } catch (err: any) {
      console.error('Failed to load session:', err)
      setError(err.message || 'Failed to load session')
    }
  }

  // Handle session deletion
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent session click
    
    if (!confirm('Delete this conversation? This action cannot be undone.')) {
      return
    }

    setDeletingSessionId(sessionId)
    
    try {
      await deleteSession(sessionId)
      
      // Reload chat history after deletion
      if (userId) {
        await loadChatHistory(userId)
      }
    } catch (err: any) {
      console.error('Failed to delete session:', err)
      setError(err.message || 'Failed to delete session')
    } finally {
      setDeletingSessionId(null)
    }
  }

  const groupedSessions = groupSessionsByTime(chatHistory)

  // Render session item
  const renderSessionItem = (session: SessionListItem) => {
    const isActive = session.sessionId === currentSessionId
    const isDeleting = session.sessionId === deletingSessionId

    return (
      <div
        key={session.sessionId}
        onClick={() => handleSessionClick(session)}
        className={`
          group relative p-3 rounded-lg cursor-pointer transition-all
          ${isActive 
            ? 'bg-blue-50 border-l-4 border-blue-500' 
            : 'hover:bg-gray-50 border-l-4 border-transparent'
          }
          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {session.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
            </p>
          </div>
          
          <button
            onClick={(e) => handleDeleteSession(session.sessionId, e)}
            disabled={isDeleting}
            className="
              opacity-0 group-hover:opacity-100 transition-opacity
              p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600
            "
            title="Delete conversation"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Render session group
  const renderSessionGroup = (title: string, sessions: SessionListItem[]) => {
    if (sessions.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {sessions.map(renderSessionItem)}
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Chat History
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <p className="font-medium">Error loading history</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={async () => {
                try {
                  const { createClient } = await import('@/lib/supabase/client')
                  const supabase = createClient()
                  const { data: { session } } = await supabase.auth.getSession()
                  const freshUserId = session?.user?.id || userId || 'demo-user-123'
                  console.log('[ChatHistory] Retry with userId:', freshUserId)
                  await loadChatHistory(freshUserId)
                } catch (err) {
                  console.error('[ChatHistory] Retry failed:', err)
                }
              }}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && chatHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="mt-2 text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start chatting to see your history here</p>
          </div>
        )}

        {/* Session Groups */}
        {!isLoading && !error && chatHistory.length > 0 && (
          <>
            {renderSessionGroup('Today', groupedSessions.today)}
            {renderSessionGroup('Yesterday', groupedSessions.yesterday)}
            {renderSessionGroup('Previous', groupedSessions.previous)}
          </>
        )}
      </div>
    </Card>
  )
}

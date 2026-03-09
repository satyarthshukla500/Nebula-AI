'use client'

import { DashboardGrid } from '@/components/dashboard/DashboardGrid'

const workspaces = [
  { 
    name: 'General Chat', 
    href: '/dashboard/workspaces/chat', 
    icon: '💬', 
    description: 'Daily life assistance',
    gradient: ['#8b5cf6', '#ec4899'] as [string, string]
  },
  { 
    name: 'Explain Assist', 
    href: '/dashboard/workspaces/explain', 
    icon: '📚', 
    description: 'Technical explanations',
    gradient: ['#3b82f6', '#8b5cf6'] as [string, string]
  },
  { 
    name: 'Debug Workspace', 
    href: '/dashboard/workspaces/debug', 
    icon: '🐛', 
    description: 'Code debugging',
    gradient: ['#ef4444', '#f59e0b'] as [string, string]
  },
  { 
    name: 'Smart Summarizer', 
    href: '/dashboard/workspaces/summarizer', 
    icon: '📝', 
    description: 'Content summaries',
    gradient: ['#10b981', '#3b82f6'] as [string, string]
  },
  { 
    name: 'Quiz Arena', 
    href: '/dashboard/workspaces/quiz-arena', 
    icon: '🎯', 
    description: 'Quiz generation',
    gradient: ['#f59e0b', '#ef4444'] as [string, string]
  },
  { 
    name: 'Cyber Safety', 
    href: '/dashboard/workspaces/cyber-safety', 
    icon: '🛡️', 
    description: 'Security analysis',
    gradient: ['#6366f1', '#8b5cf6'] as [string, string]
  },
  { 
    name: 'Mental Wellness', 
    href: '/dashboard/workspaces/wellness', 
    icon: '🧘', 
    description: 'Emotional support',
    gradient: ['#ec4899', '#a78bfa'] as [string, string]
  },
  { 
    name: 'Study Focus', 
    href: '/dashboard/workspaces/study', 
    icon: '📖', 
    description: 'Study environment',
    gradient: ['#14b8a6', '#10b981'] as [string, string]
  },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          Welcome back!
        </h2>
        <p 
          className="mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Choose a workspace to get started
        </p>
      </div>

      <DashboardGrid workspaces={workspaces} />
    </div>
  )
}

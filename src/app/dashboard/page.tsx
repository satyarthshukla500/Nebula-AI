'use client'

import { Card, CardBody } from '@/components/ui/Card'
import Link from 'next/link'

const workspaces = [
  { name: 'General Chat', href: '/dashboard/workspaces/chat', icon: '💬', description: 'Daily life assistance' },
  { name: 'Explain Assist', href: '/dashboard/workspaces/explain', icon: '📚', description: 'Technical explanations' },
  { name: 'Debug Workspace', href: '/dashboard/workspaces/debug', icon: '🐛', description: 'Code debugging' },
  { name: 'Smart Summarizer', href: '/dashboard/workspaces/summarizer', icon: '📝', description: 'Content summaries' },
  { name: 'Quiz Arena', href: '/dashboard/workspaces/quiz-arena', icon: '🎯', description: 'Quiz generation' },
  { name: 'Cyber Safety', href: '/dashboard/workspaces/cyber-safety', icon: '🛡️', description: 'Security analysis' },
  { name: 'Mental Wellness', href: '/dashboard/workspaces/wellness', icon: '🧘', description: 'Emotional support' },
  { name: 'Study Focus', href: '/dashboard/workspaces/study', icon: '📖', description: 'Study environment' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
        <p className="text-gray-600 mt-1">Choose a workspace to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Link key={workspace.href} href={workspace.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardBody className="text-center">
                <div className="text-4xl mb-3">{workspace.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {workspace.name}
                </h3>
                <p className="text-sm text-gray-600">{workspace.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

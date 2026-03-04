'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

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
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
          <span className="text-xl font-bold text-gray-900">Nebula AI</span>
        </Link>
      </div>

      <div className="px-3 py-4">
        <NavSection title="Workspaces" items={workspaces} />
        <NavSection title="Arena" items={arena} />
        <NavSection title="Support" items={support} />
      </div>
    </aside>
  )
}

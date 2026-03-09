'use client'

import { WorkspaceCard } from './WorkspaceCard'

interface Workspace {
  name: string
  description: string
  icon: string
  href: string
  gradient?: [string, string]
}

interface DashboardGridProps {
  workspaces: Workspace[]
}

export function DashboardGrid({ workspaces }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace, index) => (
        <WorkspaceCard
          key={workspace.href}
          {...workspace}
          delay={index * 0.1}
        />
      ))}
    </div>
  )
}

'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AnimatedBackground } from '@/components/background'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Animated Background Layer */}
      <AnimatedBackground
        enableOrbs={true}
        enableGrid={true}
        enableParticles={true}
        intensity={60}
      />
      
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10" style={{ background: 'transparent' }}>
        <TopBar title="Dashboard" subtitle="Welcome back to Nebula AI" showWave={true} />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'transparent' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

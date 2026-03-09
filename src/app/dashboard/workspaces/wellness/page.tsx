'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function WellnessPage() {
  return (
    <div className="h-full" style={{ background: 'transparent' }}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'white' }}>Mental Wellness</h2>
        <p style={{ color: '#8892b0' }}>Emotional support with crisis detection</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="wellness" />
      </div>
    </div>
  )
}

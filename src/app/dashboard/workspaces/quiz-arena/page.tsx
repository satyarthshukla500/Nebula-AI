'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function QuizArenaPage() {
  return (
    <div className="h-full" style={{ background: 'transparent' }}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'white' }}>Quiz Arena</h2>
        <p style={{ color: '#8892b0' }}>Customizable quiz generation with proctoring</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="quiz" />
      </div>
    </div>
  )
}

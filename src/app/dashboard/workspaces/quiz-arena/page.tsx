'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function QuizArenaPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Quiz Arena</h2>
        <p className="text-gray-600">Customizable quiz generation with proctoring</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="quiz" />
      </div>
    </div>
  )
}

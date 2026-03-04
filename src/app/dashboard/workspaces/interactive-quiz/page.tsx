'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function InteractiveQuizPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Quiz</h2>
        <p className="text-gray-600">Engaging quiz experiences with instant feedback</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="quiz" />
      </div>
    </div>
  )
}

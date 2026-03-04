'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function StudyPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Study Focus</h2>
        <p className="text-gray-600">Dedicated study environment with timer</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="study" />
      </div>
    </div>
  )
}

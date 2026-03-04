'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function WellnessPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Mental Wellness</h2>
        <p className="text-gray-600">Emotional support with crisis detection</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="wellness" />
      </div>
    </div>
  )
}

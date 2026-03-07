'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function ExplainPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Explain Assist</h2>
        <p className="text-gray-600">Get technical explanations in multiple modes</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="explain" />
      </div>
    </div>
  )
}

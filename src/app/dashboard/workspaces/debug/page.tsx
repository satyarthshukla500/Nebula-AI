'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function DebugPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Debug Workspace</h2>
        <p className="text-gray-600">Code debugging across 15+ languages</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="debug" />
      </div>
    </div>
  )
}

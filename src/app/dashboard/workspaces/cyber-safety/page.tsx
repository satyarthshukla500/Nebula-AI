'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function CyberSafetyPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Cyber Safety</h2>
        <p className="text-gray-600">Educational security analysis and risk assessment</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="cyber-safety" />
      </div>
    </div>
  )
}

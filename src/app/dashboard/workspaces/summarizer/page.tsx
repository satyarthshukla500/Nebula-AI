'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function SummarizerPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Smart Summarizer</h2>
        <p className="text-gray-600">High-level code and workflow summaries</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="summarize" />
      </div>
    </div>
  )
}

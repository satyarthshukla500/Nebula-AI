'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function ExplainPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-shrink-0 p-6 pb-4 bg-white border-b border-gray-200 relative z-20">
        <h2 className="text-2xl font-bold text-gray-900">Explain Assist</h2>
        <p className="text-sm text-gray-600 mt-1">Get technical explanations in multiple modes with file upload support</p>
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <ChatContainer 
          workspaceType="explain_assist" 
          enableFileUpload={true}
        />
      </div>
    </div>
  )
}

'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function ExplainPage() {
  return (
    <div className="h-full flex flex-col" style={{ background: 'transparent' }}>
      <div className="flex-shrink-0 pb-4 border-b relative z-20" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'white' }}>Explain Assist</h2>
        <p className="text-sm mt-1" style={{ color: '#8892b0' }}>Get technical explanations in multiple modes with file upload support</p>
      </div>
      <div className="flex-1 overflow-hidden relative z-10 mt-4">
        <ChatContainer 
          workspaceType="explain_assist" 
          enableFileUpload={true}
        />
      </div>
    </div>
  )
}

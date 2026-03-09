'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function CyberSafetyPage() {
  return (
    <div className="h-full" style={{ background: 'transparent' }}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'white' }}>Cyber Safety</h2>
        <p style={{ color: '#8892b0' }}>Educational security analysis and risk assessment</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer workspaceType="cyber-safety" enableFileUpload={true} />
      </div>
    </div>
  )
}

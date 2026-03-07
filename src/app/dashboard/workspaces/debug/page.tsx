'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'

export default function DebugPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Debug Workspace</h2>
            <p className="text-gray-600">Code debugging across 15+ languages + File Analysis (Images, PDFs, CSV, Excel)</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-500/30 shadow-lg">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-cyan-400">AWS SageMaker</span>
              <span className="text-[10px] text-gray-400">nebula-dolphin-endpoint • LIVE</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ChatContainer 
          workspaceType="debug" 
          enableFileUpload={true}
        />
      </div>
    </div>
  )
}

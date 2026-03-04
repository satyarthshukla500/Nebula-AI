'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Card } from '@/components/ui/Card'

interface ChatContainerProps {
  workspaceType: string
  systemPrompt?: string
}

export function ChatContainer({ workspaceType, systemPrompt }: ChatContainerProps) {
  const { messages, isLoading, sendMessage } = useChatStore()
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    const response = await sendMessage(content, workspaceType, sessionId)
    if (response?.sessionId && !sessionId) {
      setSessionId(response.sessionId)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </Card>
  )
}

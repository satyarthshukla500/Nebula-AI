'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/chat-store'

export function useChat(workspaceType: string) {
  const { messages, isLoading, sendMessage, clearMessages } = useChatStore()
  const [sessionId, setSessionId] = useState<string | null>(null)

  const send = async (content: string) => {
    const response = await sendMessage(content, workspaceType, sessionId)
    if (response?.sessionId && !sessionId) {
      setSessionId(response.sessionId)
    }
    return response
  }

  const reset = () => {
    clearMessages()
    setSessionId(null)
  }

  return {
    messages,
    isLoading,
    send,
    reset,
    sessionId,
  }
}

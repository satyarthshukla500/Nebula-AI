'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'

export function useChat(workspaceType: string) {
  const { 
    getMessages, 
    getSessionId,
    isLoading, 
    sendMessage, 
    clearWorkspace,
    setWorkspace 
  } = useChatStore()
  
  // Set workspace when hook is used
  useEffect(() => {
    setWorkspace(workspaceType)
  }, [workspaceType, setWorkspace])
  
  // Get workspace-specific data
  const messages = getMessages()
  const sessionId = getSessionId()

  const send = async (content: string) => {
    const response = await sendMessage(content, workspaceType)
    return response
  }

  const reset = () => {
    clearWorkspace(workspaceType)
  }

  return {
    messages,
    isLoading,
    send,
    reset,
    sessionId,
  }
}

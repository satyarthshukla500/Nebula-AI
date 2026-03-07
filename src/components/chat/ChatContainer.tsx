'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { PromptSuggestions } from './PromptSuggestions'
import { Card } from '@/components/ui/Card'

interface ChatContainerProps {
  workspaceType: string
  systemPrompt?: string
  enableFileUpload?: boolean
}

export function ChatContainer({ workspaceType, systemPrompt, enableFileUpload = false }: ChatContainerProps) {
  const { 
    getMessages, 
    isLoading, 
    sendMessage,
    sendFileMessage,
    setWorkspace 
  } = useChatStore()
  
  const [inputValue, setInputValue] = useState('')
  const chatInputRef = useRef<{ setMessage: (msg: string) => void } | null>(null)
  
  // Set workspace when component mounts or workspace changes
  useEffect(() => {
    setWorkspace(workspaceType)
  }, [workspaceType, setWorkspace])
  
  // Get messages for current workspace
  const messages = getMessages()

  const handleSendMessage = async (content: string, file?: File) => {
    if (file) {
      await sendFileMessage(content, file, workspaceType)
    } else {
      await sendMessage(content, workspaceType)
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <Card className="h-full flex flex-col">
      {messages.length === 0 ? (
        <PromptSuggestions onPromptSelect={handlePromptSelect} />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
        enableFileUpload={enableFileUpload}
        externalValue={inputValue}
        onValueChange={setInputValue}
      />
    </Card>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: 'transparent' }}>
      {messages.length === 0 && (
        <div className="text-center mt-8" style={{ color: '#8892b0' }}>
          <p className="text-lg">Start a conversation</p>
          <p className="text-sm">Type a message below to begin</p>
        </div>
      )}
      
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      <div ref={bottomRef} />
    </div>
  )
}

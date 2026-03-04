'use client'

import { useState, KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows={3}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="self-end"
        >
          Send
        </Button>
      </div>
    </div>
  )
}

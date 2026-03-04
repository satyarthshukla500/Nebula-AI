import { cn } from '@/lib/utils/cn'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className={cn('text-xs mt-1', isUser ? 'text-blue-100' : 'text-gray-500')}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

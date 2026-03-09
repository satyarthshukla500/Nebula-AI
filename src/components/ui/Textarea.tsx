import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, value, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    
    // Auto-resize logic
    useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    }, [value])
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={(node) => {
            textareaRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          value={value}
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none overflow-y-auto',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            height: 'auto',
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

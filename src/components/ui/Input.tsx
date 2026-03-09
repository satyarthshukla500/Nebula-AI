import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: '#8892b0', fontSize: '13px' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-lg transition-all',
            error ? 'border-red-500' : '',
            className
          )}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            borderRadius: '10px',
            outline: 'none',
            ...style
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#7c6bff'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,107,255,0.2)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.1)'
            e.currentTarget.style.boxShadow = 'none'
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

Input.displayName = 'Input'

'use client'

interface TypingIndicatorProps {
  variant?: 'dots' | 'wave' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
}

export function TypingIndicator({ variant = 'dots', size = 'md' }: TypingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const dotSize = sizeClasses[size]

  return (
    <div className="flex justify-start">
      <div 
        className="rounded-lg px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))',
        }}
      >
        <div className="flex space-x-2">
          <div 
            className={`${dotSize} rounded-full animate-bounce`}
            style={{ 
              backgroundColor: 'var(--color-text)',
              animationDelay: '0ms',
              opacity: 0.8,
            }} 
          />
          <div 
            className={`${dotSize} rounded-full animate-bounce`}
            style={{ 
              backgroundColor: 'var(--color-text)',
              animationDelay: '150ms',
              opacity: 0.8,
            }} 
          />
          <div 
            className={`${dotSize} rounded-full animate-bounce`}
            style={{ 
              backgroundColor: 'var(--color-text)',
              animationDelay: '300ms',
              opacity: 0.8,
            }} 
          />
        </div>
      </div>
    </div>
  )
}

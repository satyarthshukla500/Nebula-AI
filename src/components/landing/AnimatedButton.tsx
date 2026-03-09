'use client'

import { ReactNode, CSSProperties } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'outline'
  style?: CSSProperties
}

export function AnimatedButton({ children, variant = 'primary', style }: AnimatedButtonProps) {
  const baseStyle: CSSProperties = {
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    ...style
  }

  const primaryStyle: CSSProperties = {
    ...baseStyle,
    background: 'linear-gradient(135deg, #7c6bff, #00d4ff)',
    boxShadow: '0 4px 20px rgba(124,107,255,0.4)',
  }

  const outlineStyle: CSSProperties = {
    ...baseStyle,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
  }

  const buttonStyle = variant === 'primary' ? primaryStyle : outlineStyle

  return (
    <button
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,107,255,0.5)'
        } else {
          e.currentTarget.style.borderColor = '#7c6bff'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,107,255,0.4)'
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {children}
    </button>
  )
}

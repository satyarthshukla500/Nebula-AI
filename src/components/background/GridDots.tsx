/**
 * GridDots Component
 * 
 * Renders a dot pattern background using CSS. The dots use theme colors
 * and support both static and animated variants.
 * 
 * **Validates: Requirement 4.2**
 * 
 * @module components/background/GridDots
 */

'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================================================
// Component Props Interface
// ============================================================================

interface GridDotsProps {
  /** Enable animated variant (dots pulse/fade) */
  animated?: boolean
  /** Dot size in pixels */
  dotSize?: number
  /** Grid spacing in pixels */
  spacing?: number
  /** Opacity of dots (0-1) */
  opacity?: number
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// GridDots Component
// ============================================================================

/**
 * GridDots Component
 * 
 * Renders a repeating dot pattern background using CSS radial gradients.
 * Dots use theme colors and can be static or animated.
 * 
 * **Validates: Requirement 4.2**
 */
export function GridDots({
  animated = false,
  dotSize = 2,
  spacing = 30,
  opacity = 0.3,
  className = '',
}: GridDotsProps) {
  const { currentTheme } = useTheme()

  // Create dot pattern using radial gradient
  const dotPattern = `radial-gradient(circle, ${currentTheme.colors.accent} ${dotSize}px, transparent ${dotSize}px)`

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className} ${
        animated ? 'animate-pulse-slow' : ''
      }`}
      style={{
        backgroundImage: dotPattern,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: '0 0',
        opacity,
      }}
      aria-hidden="true"
    />
  )
}

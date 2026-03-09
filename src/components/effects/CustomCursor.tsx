'use client'

import { useEffect, useState, useRef } from 'react'

interface CustomCursorProps {
  dotSize?: number
  ringSize?: number
  lagSpeed?: number
}

interface CursorState {
  dotX: number
  dotY: number
  ringX: number
  ringY: number
  isHovering: boolean
  isClicking: boolean
}

export function CustomCursor({
  dotSize = 8,
  ringSize = 32,
  lagSpeed = 0.15,
}: CustomCursorProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const cursorStateRef = useRef<CursorState>({
    dotX: 0,
    dotY: 0,
    ringX: 0,
    ringY: 0,
    isHovering: false,
    isClicking: false,
  })
  const animationFrameRef = useRef<number>()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Detect mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('resize', checkMobile)
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  useEffect(() => {
    // Don't render cursor on mobile
    if (isMobile) return

    const state = cursorStateRef.current

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      state.dotX = e.clientX
      state.dotY = e.clientY

      // Check if hovering over interactive element
      const element = document.elementFromPoint(e.clientX, e.clientY)
      state.isHovering = element?.matches('a, button, input, textarea, select, [role="button"], [role="link"]') || false
    }

    // Mouse down handler
    const handleMouseDown = () => {
      state.isClicking = true
    }

    // Mouse up handler
    const handleMouseUp = () => {
      state.isClicking = false
    }

    // Animation loop
    const animate = () => {
      const effectiveLagSpeed = prefersReducedMotion ? 1 : lagSpeed

      // Update ring position with lag (lerp)
      state.ringX += (state.dotX - state.ringX) * effectiveLagSpeed
      state.ringY += (state.dotY - state.ringY) * effectiveLagSpeed

      // Apply transforms to cursor elements
      if (dotRef.current) {
        const dotScale = state.isClicking ? 0.8 : 1
        dotRef.current.style.transform = `translate(${state.dotX}px, ${state.dotY}px) scale(${dotScale})`
      }

      if (ringRef.current) {
        const ringScale = state.isHovering ? 1.5 : 1
        ringRef.current.style.transform = `translate(${state.ringX}px, ${state.ringY}px) scale(${ringScale})`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMobile, lagSpeed, prefersReducedMotion])

  // Don't render on mobile
  if (isMobile) return null

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          marginLeft: `-${dotSize / 2}px`,
          marginTop: `-${dotSize / 2}px`,
          backgroundColor: 'var(--color-accent)',
          borderRadius: '50%',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Cursor ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          marginLeft: `-${ringSize / 2}px`,
          marginTop: `-${ringSize / 2}px`,
          border: '2px solid var(--color-accent)',
          borderRadius: '50%',
          transition: 'transform 0.15s ease-out',
          opacity: 0.5,
        }}
      />
    </>
  )
}

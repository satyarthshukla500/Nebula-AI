/**
 * FloatingOrbs Component
 * 
 * Renders animated floating orbs using canvas with radial gradients and blur effects.
 * Orbs move across the canvas and bounce off boundaries with smooth animations.
 * Includes performance monitoring to automatically reduce orb count and disable blur
 * when FPS drops below 30.
 * 
 * **Validates: Requirements 4.4, 4.5, 4.6, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.2, 13.3, 13.4, 13.6**
 * 
 * @module components/background/FloatingOrbs
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import type { Orb } from '@/types/theme'

// ============================================================================
// Component Props Interface
// ============================================================================

interface FloatingOrbsProps {
  /** Canvas element to render on */
  canvas: HTMLCanvasElement | null
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
  /** Effect intensity (0-100) */
  intensity?: number
}

// ============================================================================
// Constants
// ============================================================================

const MIN_ORBS = 3
const MAX_ORBS = 8
const MIN_ORB_SIZE = 40
const MAX_ORB_SIZE = 120
const MIN_SPEED = 0.02
const MAX_SPEED = 0.05
const TARGET_FPS = 60
const FRAME_TIME_MS = 1000 / TARGET_FPS

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate random number between min and max
 */
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Initialize orbs with random positions, sizes, and velocities
 * 
 * **Validates: Requirement 5.1**
 */
function initializeOrbs(
  count: number,
  width: number,
  height: number,
  colors: string[]
): Orb[] {
  const orbs: Orb[] = []
  
  for (let i = 0; i < count; i++) {
    const size = random(MIN_ORB_SIZE, MAX_ORB_SIZE)
    const orb: Orb = {
      id: `orb-${i}`,
      x: random(size, width - size),
      y: random(size, height - size),
      size,
      color: colors[i % colors.length],
      speedX: random(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
      speedY: random(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
    }
    orbs.push(orb)
  }
  
  return orbs
}

/**
 * Update orb position and handle boundary collisions
 * 
 * **Validates: Requirements 5.2, 5.3**
 */
function updateOrb(orb: Orb, width: number, height: number, deltaTime: number): void {
  // Update position based on velocity and delta time
  orb.x += orb.speedX * deltaTime
  orb.y += orb.speedY * deltaTime
  
  // Boundary collision detection and bounce
  if (orb.x - orb.size < 0 || orb.x + orb.size > width) {
    orb.speedX *= -1
    // Clamp position to stay within bounds
    orb.x = Math.max(orb.size, Math.min(width - orb.size, orb.x))
  }
  
  if (orb.y - orb.size < 0 || orb.y + orb.size > height) {
    orb.speedY *= -1
    // Clamp position to stay within bounds
    orb.y = Math.max(orb.size, Math.min(height - orb.size, orb.y))
  }
}

/**
 * Render orb with radial gradient and blur effect
 * 
 * **Validates: Requirements 5.4, 5.5, 13.4**
 * 
 * @param ctx Canvas rendering context
 * @param orb Orb to render
 * @param disableBlur Whether to disable blur effects for performance
 */
function renderOrb(ctx: CanvasRenderingContext2D, orb: Orb, disableBlur: boolean = false): void {
  // Create radial gradient from theme color to transparent
  const gradient = ctx.createRadialGradient(
    orb.x, orb.y, 0,
    orb.x, orb.y, orb.size
  )
  gradient.addColorStop(0, orb.color)
  gradient.addColorStop(0.5, orb.color.replace(')', ', 0.5)').replace('rgb', 'rgba'))
  gradient.addColorStop(1, 'transparent')
  
  // Apply blur effect based on orb size (disabled if performance is degraded)
  if (!disableBlur) {
    const blurAmount = orb.size * 0.3
    ctx.filter = `blur(${blurAmount}px)`
  }
  
  // Draw orb
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2)
  ctx.fill()
  
  // Reset filter
  ctx.filter = 'none'
}

// ============================================================================
// FloatingOrbs Component
// ============================================================================

/**
 * FloatingOrbs Component
 * 
 * Manages floating orb animations on a canvas element.
 * Handles initialization, animation loop, cleanup, and performance monitoring.
 * Automatically reduces orb count and disables blur when FPS drops below 30.
 * 
 * **Validates: Requirements 4.4, 4.5, 4.6, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 13.2, 13.3, 13.4, 13.6**
 */
export function FloatingOrbs({ canvas, width, height, intensity = 60 }: FloatingOrbsProps) {
  const { currentTheme } = useTheme()
  const performanceMetrics = usePerformanceMonitor()
  const orbsRef = useRef<Orb[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)
  
  /**
   * Initialize and animate orbs
   */
  useEffect(() => {
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Calculate orb count based on intensity and performance
    // **Validates: Requirements 5.7, 13.3**
    const baseOrbCount = Math.max(
      MIN_ORBS,
      Math.min(MAX_ORBS, Math.floor((intensity / 100) * MAX_ORBS))
    )
    
    // Reduce orb count if performance is degraded
    const orbCount = Math.max(
      MIN_ORBS,
      Math.floor(baseOrbCount * performanceMetrics.orbReductionFactor)
    )
    
    // Get theme colors for orbs
    const orbColors = [
      currentTheme.colors.primary,
      currentTheme.colors.secondary,
      currentTheme.colors.accent,
      currentTheme.colors.glow,
    ]
    
    // Initialize orbs if not already initialized or if count changed
    if (orbsRef.current.length === 0 || orbsRef.current.length !== orbCount) {
      orbsRef.current = initializeOrbs(orbCount, width, height, orbColors)
    }
    
    /**
     * Animation loop
     * 
     * **Validates: Requirements 4.5, 5.6, 13.6**
     */
    function animate(currentTime: number) {
      if (!ctx || !canvas) return
      
      // Calculate delta time
      const deltaTime = lastFrameTimeRef.current === 0 
        ? FRAME_TIME_MS 
        : currentTime - lastFrameTimeRef.current
      
      lastFrameTimeRef.current = currentTime
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Update and render each orb
      // **Validates: Requirements 13.4**
      for (const orb of orbsRef.current) {
        updateOrb(orb, width, height, deltaTime)
        renderOrb(ctx, orb, performanceMetrics.disableBlur)
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate)
    
    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [canvas, width, height, intensity, currentTheme, performanceMetrics.orbReductionFactor, performanceMetrics.disableBlur])
  
  /**
   * Update orb colors when theme changes
   * 
   * **Validates: Requirement 4.8**
   */
  useEffect(() => {
    const orbColors = [
      currentTheme.colors.primary,
      currentTheme.colors.secondary,
      currentTheme.colors.accent,
      currentTheme.colors.glow,
    ]
    
    // Update existing orb colors
    orbsRef.current.forEach((orb, index) => {
      orb.color = orbColors[index % orbColors.length]
    })
  }, [currentTheme])
  
  return null
}

/**
 * ParticleSystem Component
 * 
 * Renders small animated particles on a canvas that spawn, move, fade out, and are removed.
 * Particles use theme colors and integrate into the AnimatedBackground container.
 * 
 * **Validates: Requirement 4.3**
 * 
 * @module components/background/ParticleSystem
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { Particle } from '@/types/theme'

// ============================================================================
// Component Props Interface
// ============================================================================

interface ParticleSystemProps {
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

const MIN_PARTICLES = 20
const MAX_PARTICLES = 100
const PARTICLE_SIZE = 2
const MIN_SPEED = 0.05
const MAX_SPEED = 0.15
const SPAWN_RATE = 0.02 // Probability of spawning a particle per frame
const LIFE_DECAY = 0.003 // How fast particles fade out
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
 * Create a new particle with random position and velocity
 */
function createParticle(width: number, height: number, color: string): Particle {
  return {
    id: `particle-${Date.now()}-${Math.random()}`,
    x: random(0, width),
    y: random(0, height),
    vx: random(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
    vy: random(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
    life: 1.0,
  }
}

/**
 * Update particle position and lifecycle
 */
function updateParticle(
  particle: Particle,
  width: number,
  height: number,
  deltaTime: number
): void {
  // Update position based on velocity and delta time
  particle.x += particle.vx * deltaTime
  particle.y += particle.vy * deltaTime
  
  // Wrap around boundaries (particles reappear on opposite side)
  if (particle.x < 0) particle.x = width
  if (particle.x > width) particle.x = 0
  if (particle.y < 0) particle.y = height
  if (particle.y > height) particle.y = 0
  
  // Decay life
  particle.life -= LIFE_DECAY * deltaTime
}

/**
 * Render particle with fade effect based on life
 */
function renderParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  color: string
): void {
  // Calculate opacity based on remaining life
  const opacity = Math.max(0, Math.min(1, particle.life))
  
  // Parse color and add alpha
  const colorWithAlpha = color.includes('rgb')
    ? color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
    : `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
  
  // Draw particle as a small circle
  ctx.fillStyle = colorWithAlpha
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, PARTICLE_SIZE, 0, Math.PI * 2)
  ctx.fill()
}

// ============================================================================
// ParticleSystem Component
// ============================================================================

/**
 * ParticleSystem Component
 * 
 * Manages particle animations on a canvas element.
 * Handles particle spawning, movement, fading, and removal.
 * 
 * **Validates: Requirement 4.3**
 */
export function ParticleSystem({
  canvas,
  width,
  height,
  intensity = 60,
}: ParticleSystemProps) {
  const { currentTheme } = useTheme()
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)
  const particleColorRef = useRef<string>(currentTheme.colors.accent)
  const containerRef = useRef<HTMLDivElement>(null)
  
  /**
   * Update particle color when theme changes
   */
  useEffect(() => {
    particleColorRef.current = currentTheme.colors.accent
  }, [currentTheme])
  
  /**
   * Spawn DOM-based rising particles
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    function spawnParticle() {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      const duration = Math.random() * 8 + 6
      const startX = Math.random() * 100
      p.style.cssText = `
        position:absolute;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:rgba(124,107,255,${Math.random() * 0.4 + 0.2});
        left:${startX}%;
        bottom:-10px;
        animation: particleRise ${duration}s linear forwards;
        box-shadow: 0 0 ${size * 2}px rgba(124,107,255,0.6);
        pointer-events: none;
      `
      container.appendChild(p)
      setTimeout(() => p.remove(), duration * 1000)
    }
    
    const interval = setInterval(spawnParticle, 400)
    return () => clearInterval(interval)
  }, [])
  
  /**
   * Initialize and animate particles
   */
  useEffect(() => {
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Calculate max particle count based on intensity
    const maxParticles = Math.max(
      MIN_PARTICLES,
      Math.min(MAX_PARTICLES, Math.floor((intensity / 100) * MAX_PARTICLES))
    )
    
    /**
     * Animation loop
     */
    function animate(currentTime: number) {
      if (!ctx || !canvas) return
      
      // Calculate delta time
      const deltaTime = lastFrameTimeRef.current === 0
        ? FRAME_TIME_MS
        : currentTime - lastFrameTimeRef.current
      
      lastFrameTimeRef.current = currentTime
      
      // Spawn new particles based on spawn rate and max count
      if (
        particlesRef.current.length < maxParticles &&
        Math.random() < SPAWN_RATE
      ) {
        const newParticle = createParticle(
          width,
          height,
          particleColorRef.current
        )
        particlesRef.current.push(newParticle)
      }
      
      // Update particles and remove dead ones
      particlesRef.current = particlesRef.current.filter((particle) => {
        updateParticle(particle, width, height, deltaTime)
        return particle.life > 0
      })
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Render all particles
      for (const particle of particlesRef.current) {
        renderParticle(ctx, particle, particleColorRef.current)
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
      particlesRef.current = []
    }
  }, [canvas, width, height, intensity])
  
  return <div ref={containerRef} id="bg-particles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
}

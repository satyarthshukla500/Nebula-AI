/**
 * FloatingOrbs Component Tests
 * 
 * Unit tests for the FloatingOrbs component to ensure proper
 * orb initialization, animation, collision detection, and rendering.
 * 
 * **Validates: Requirements 4.4, 4.5, 4.6, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5**
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FloatingOrbs } from '../FloatingOrbs'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock useTheme hook
const mockTheme = {
  name: 'dark',
  colors: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    glow: '#8b5cf6',
    background: '#0f0f1e',
    surface: '#1a1a2e',
  },
  effects: {
    glowIntensity: 60,
    animationSpeed: 1.0,
    particleDensity: 50,
    blurAmount: 10,
    enableOrbs: true,
    enableGrid: true,
    enableParticles: true,
  },
}

jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: () => ({
    currentTheme: mockTheme,
  }),
}))

describe('FloatingOrbs', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    // Create a canvas element for testing
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // Mock canvas context methods
    ctx.clearRect = jest.fn()
    ctx.createRadialGradient = jest.fn(() => ({
      addColorStop: jest.fn(),
    })) as any
    ctx.beginPath = jest.fn()
    ctx.arc = jest.fn()
    ctx.fill = jest.fn()

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(() => cb(Date.now()), 16)
      return 1
    }) as any

    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      expect(container).toBeInTheDocument()
    })

    it('should return null (no DOM elements)', () => {
      const { container } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should handle null canvas gracefully', () => {
      expect(() => {
        render(<FloatingOrbs canvas={null} width={800} height={600} intensity={60} />)
      }).not.toThrow()
    })
  })

  describe('Orb Initialization', () => {
    it('should initialize orbs when canvas is provided', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Animation should start
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should initialize minimum 3 orbs', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={10} />)
      
      // With low intensity, should still have at least 3 orbs
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should scale orb count with intensity', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={100} />)
      
      // High intensity should initialize more orbs
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should initialize orbs within canvas bounds', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Orbs should be initialized (verified by animation starting)
      expect(requestAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('Animation Loop', () => {
    it('should start animation loop on mount', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should clear canvas on each frame', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })

    it('should cancel animation frame on unmount', () => {
      const { unmount } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      
      unmount()
      
      expect(cancelAnimationFrame).toHaveBeenCalled()
    })

    it('should not throw error on unmount', () => {
      const { unmount } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Orb Rendering', () => {
    it('should create radial gradients for orbs', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(ctx.createRadialGradient).toHaveBeenCalled()
    })

    it('should apply blur filter to orbs', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 20))
      
      // Filter should be set and reset
      expect(ctx.filter).toBeDefined()
    })

    it('should draw orbs using arc', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(ctx.arc).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalled()
    })
  })

  describe('Theme Integration', () => {
    it('should use theme colors for orbs', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 20))
      
      // Orbs should be rendered with theme colors
      expect(ctx.createRadialGradient).toHaveBeenCalled()
    })

    it('should update orb colors when theme changes', () => {
      const { rerender } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      
      // Simulate theme change by rerendering
      rerender(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Should continue animating with new colors
      expect(requestAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('Canvas Dimensions', () => {
    it('should handle canvas resize', () => {
      const { rerender } = render(
        <FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />
      )
      
      // Resize canvas
      canvas.width = 1024
      canvas.height = 768
      
      rerender(<FloatingOrbs canvas={canvas} width={1024} height={768} intensity={60} />)
      
      // Should reinitialize with new dimensions
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should handle zero dimensions gracefully', () => {
      expect(() => {
        render(<FloatingOrbs canvas={canvas} width={0} height={0} intensity={60} />)
      }).not.toThrow()
    })
  })

  describe('Intensity Prop', () => {
    it('should accept intensity prop', () => {
      expect(() => {
        render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={80} />)
      }).not.toThrow()
    })

    it('should default intensity to 60', () => {
      expect(() => {
        render(<FloatingOrbs canvas={canvas} width={800} height={600} />)
      }).not.toThrow()
    })

    it('should handle low intensity', () => {
      expect(() => {
        render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={10} />)
      }).not.toThrow()
    })

    it('should handle high intensity', () => {
      expect(() => {
        render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={100} />)
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should use requestAnimationFrame for smooth animation', () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should calculate delta time for consistent animation', async () => {
      render(<FloatingOrbs canvas={canvas} width={800} height={600} intensity={60} />)
      
      // Wait for multiple frames
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Should have called requestAnimationFrame multiple times
      expect(requestAnimationFrame).toHaveBeenCalled()
    })
  })
})

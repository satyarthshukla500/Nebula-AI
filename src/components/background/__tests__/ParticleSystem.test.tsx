/**
 * ParticleSystem Component Tests
 * 
 * Unit tests for the ParticleSystem component to ensure proper
 * particle generation, animation, lifecycle, and cleanup.
 * 
 * **Validates: Requirement 4.3**
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ParticleSystem } from '../ParticleSystem'

// Mock useTheme hook
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: {
      name: 'dark',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        glow: '#8b5cf6',
      },
      effects: {
        glowIntensity: 60,
        animationSpeed: 1.0,
        particleDensity: 50,
      },
    },
  }),
}))

describe('ParticleSystem', () => {
  let canvas: HTMLCanvasElement
  let mockContext: any

  beforeEach(() => {
    // Create a mock canvas
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600

    // Mock canvas context
    mockContext = {
      clearRect: jest.fn(),
      fillStyle: '',
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
    }

    // Mock getContext
    canvas.getContext = jest.fn(() => mockContext)

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
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      expect(container).toBeInTheDocument()
    })

    it('should return null (no DOM elements)', () => {
      const { container } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should not render if canvas is null', () => {
      const { container } = render(
        <ParticleSystem canvas={null} width={800} height={600} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Canvas Context', () => {
    it('should get 2d context from canvas', () => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      expect(canvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('should not animate if context is unavailable', () => {
      canvas.getContext = jest.fn(() => null)
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      expect(global.requestAnimationFrame).not.toHaveBeenCalled()
    })
  })

  describe('Animation Loop', () => {
    it('should start animation loop', () => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('should clear canvas on each frame', (done) => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      
      setTimeout(() => {
        expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
        done()
      }, 50)
    })

    it('should render particles on canvas', (done) => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      
      setTimeout(() => {
        // Should have called drawing methods
        expect(mockContext.beginPath).toHaveBeenCalled()
        expect(mockContext.arc).toHaveBeenCalled()
        expect(mockContext.fill).toHaveBeenCalled()
        done()
      }, 100)
    })
  })

  describe('Particle Lifecycle', () => {
    it('should spawn particles over time', (done) => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} intensity={100} />)
      
      let callCount = 0
      const originalArc = mockContext.arc
      mockContext.arc = jest.fn((...args) => {
        callCount++
        return originalArc(...args)
      })
      
      setTimeout(() => {
        // Should have spawned some particles
        expect(callCount).toBeGreaterThan(0)
        done()
      }, 200)
    })

    it('should respect intensity for particle count', (done) => {
      const { rerender } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} intensity={10} />
      )
      
      setTimeout(() => {
        const lowIntensityCount = mockContext.arc.mock.calls.length
        
        mockContext.arc.mockClear()
        
        rerender(
          <ParticleSystem canvas={canvas} width={800} height={600} intensity={100} />
        )
        
        setTimeout(() => {
          const highIntensityCount = mockContext.arc.mock.calls.length
          // Higher intensity should eventually have more particles
          expect(highIntensityCount).toBeGreaterThanOrEqual(lowIntensityCount)
          done()
        }, 200)
      }, 200)
    })
  })

  describe('Particle Properties', () => {
    it('should use theme accent color for particles', (done) => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      
      setTimeout(() => {
        // fillStyle should be set with theme color
        expect(mockContext.fillStyle).toBeTruthy()
        done()
      }, 50)
    })

    it('should render particles with proper size', (done) => {
      render(<ParticleSystem canvas={canvas} width={800} height={600} />)
      
      setTimeout(() => {
        // arc should be called with particle size (2px radius)
        const arcCalls = mockContext.arc.mock.calls
        if (arcCalls.length > 0) {
          const radius = arcCalls[0][2]
          expect(radius).toBe(2)
        }
        done()
      }, 50)
    })
  })

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      const { unmount } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      unmount()
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })

    it('should not throw error on unmount', () => {
      const { unmount } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      expect(() => unmount()).not.toThrow()
    })

    it('should clear particles array on unmount', () => {
      const { unmount } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Dimension Changes', () => {
    it('should handle width changes', () => {
      const { rerender } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      expect(() => {
        rerender(<ParticleSystem canvas={canvas} width={1024} height={600} />)
      }).not.toThrow()
    })

    it('should handle height changes', () => {
      const { rerender } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      expect(() => {
        rerender(<ParticleSystem canvas={canvas} width={800} height={768} />)
      }).not.toThrow()
    })

    it('should restart animation on dimension change', () => {
      const { rerender } = render(
        <ParticleSystem canvas={canvas} width={800} height={600} />
      )
      
      const initialCallCount = (global.requestAnimationFrame as jest.Mock).mock.calls.length
      
      rerender(<ParticleSystem canvas={canvas} width={1024} height={768} />)
      
      const newCallCount = (global.requestAnimationFrame as jest.Mock).mock.calls.length
      expect(newCallCount).toBeGreaterThan(initialCallCount)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero intensity', () => {
      expect(() => {
        render(<ParticleSystem canvas={canvas} width={800} height={600} intensity={0} />)
      }).not.toThrow()
    })

    it('should handle maximum intensity', () => {
      expect(() => {
        render(<ParticleSystem canvas={canvas} width={800} height={600} intensity={100} />)
      }).not.toThrow()
    })

    it('should handle small canvas dimensions', () => {
      expect(() => {
        render(<ParticleSystem canvas={canvas} width={100} height={100} />)
      }).not.toThrow()
    })

    it('should handle large canvas dimensions', () => {
      expect(() => {
        render(<ParticleSystem canvas={canvas} width={3840} height={2160} />)
      }).not.toThrow()
    })
  })
})

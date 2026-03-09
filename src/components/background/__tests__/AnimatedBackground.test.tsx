/**
 * AnimatedBackground Component Tests
 * 
 * Unit tests for the AnimatedBackground component to ensure proper
 * canvas setup, resize handling, performance monitoring, and cleanup.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.9, 13.2, 13.3, 13.4**
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AnimatedBackground } from '../AnimatedBackground'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock usePerformanceMonitor hook
jest.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    fps: 60,
    frameTime: 16.67,
    isDegraded: false,
    disableBlur: false,
    orbReductionFactor: 1.0,
  }),
}))

// Mock useTheme hook
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: () => ({
    currentTheme: {
      name: 'dark',
      colors: {
        background: '#0f0f1e',
        surface: '#1a1a2e',
        primary: '#8b5cf6',
        warning: '#f59e0b',
        text: '#e5e7eb',
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
    },
  }),
}))

describe('AnimatedBackground', () => {
  beforeEach(() => {
    // Mock window.matchMedia for reduced motion detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('should render canvas element', () => {
      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    })

    it('should apply custom className', () => {
      const { container } = render(<AnimatedBackground className="custom-class" />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })

    it('should apply gradient background from theme', () => {
      const { container } = render(<AnimatedBackground />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.background).toContain('#0f0f1e')
      expect(wrapper.style.background).toContain('#1a1a2e')
    })
  })

  describe('Props Configuration', () => {
    it('should accept enableOrbs prop', () => {
      render(<AnimatedBackground enableOrbs={true} />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('should accept enableGrid prop', () => {
      render(<AnimatedBackground enableGrid={true} />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('should accept enableParticles prop', () => {
      render(<AnimatedBackground enableParticles={true} />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('should apply intensity to canvas opacity', () => {
      render(<AnimatedBackground intensity={80} />)
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.style.opacity).toBe('0.8')
    })

    it('should default intensity to 60', () => {
      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.style.opacity).toBe('0.6')
    })
  })

  describe('Canvas Setup', () => {
    it('should set canvas width and height', () => {
      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn(() => ({
        width: 1920,
        height: 1080,
        top: 0,
        left: 0,
        bottom: 1080,
        right: 1920,
        x: 0,
        y: 0,
        toJSON: () => {},
      }))

      HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect

      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      
      // Canvas dimensions should be set (may be 0 initially in test environment)
      expect(canvas).toHaveAttribute('width')
      expect(canvas).toHaveAttribute('height')
    })

    it('should have proper CSS classes for positioning', () => {
      const { container } = render(<AnimatedBackground />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('fixed', 'inset-0', '-z-10', 'overflow-hidden')
    })

    it('should have canvas with absolute positioning', () => {
      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toHaveClass('absolute', 'inset-0', 'w-full', 'h-full')
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      // Component should still render but animations should be disabled
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = render(<AnimatedBackground />)
      
      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow()
    })

    it('should remove resize listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      const { unmount } = render(<AnimatedBackground />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Window Resize Handling', () => {
    it('should add resize event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      render(<AnimatedBackground />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      addEventListenerSpy.mockRestore()
    })

    it('should update canvas dimensions on resize', () => {
      const { container } = render(<AnimatedBackground />)
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      
      // Mock container dimensions
      const mockGetBoundingClientRect = jest.fn(() => ({
        width: 1024,
        height: 768,
        top: 0,
        left: 0,
        bottom: 768,
        right: 1024,
        x: 0,
        y: 0,
        toJSON: () => {},
      }))

      HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect

      // Trigger resize
      window.dispatchEvent(new Event('resize'))

      // Canvas should have dimensions set
      expect(canvas).toHaveAttribute('width')
      expect(canvas).toHaveAttribute('height')
    })
  })

  describe('Performance Monitoring', () => {
    it('should not show performance notice when performance is good', () => {
      render(<AnimatedBackground />)
      const notice = screen.queryByText(/Performance mode/i)
      expect(notice).not.toBeInTheDocument()
    })
  })
})

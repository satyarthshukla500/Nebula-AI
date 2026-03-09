/**
 * GridDots Component Tests
 * 
 * Unit tests for the GridDots component.
 * 
 * @module components/background/__tests__/GridDots.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { GridDots } from '../GridDots'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock theme provider wrapper
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('GridDots', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toBeInTheDocument()
  })
  
  it('applies default props correctly', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveStyle({
      backgroundSize: '30px 30px',
      opacity: '0.3',
    })
  })
  
  it('applies custom spacing', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots spacing={50} />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveStyle({
      backgroundSize: '50px 50px',
    })
  })
  
  it('applies custom opacity', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots opacity={0.5} />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveStyle({
      opacity: '0.5',
    })
  })
  
  it('applies animated class when animated prop is true', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots animated={true} />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveClass('animate-pulse-slow')
  })
  
  it('does not apply animated class when animated prop is false', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots animated={false} />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).not.toHaveClass('animate-pulse-slow')
  })
  
  it('applies custom className', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots className="custom-class" />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveClass('custom-class')
  })
  
  it('has pointer-events-none to not interfere with interactions', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveClass('pointer-events-none')
  })
  
  it('is marked as aria-hidden for accessibility', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    expect(gridDots).toHaveAttribute('aria-hidden', 'true')
  })
  
  it('uses theme accent color for dots', () => {
    const { container } = render(
      <MockThemeProvider>
        <GridDots />
      </MockThemeProvider>
    )
    
    const gridDots = container.querySelector('div')
    const backgroundImage = gridDots?.style.backgroundImage
    
    // Check that backgroundImage contains radial-gradient
    expect(backgroundImage).toContain('radial-gradient')
  })
})

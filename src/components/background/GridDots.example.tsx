/**
 * GridDots Component Examples
 * 
 * Demonstrates various configurations of the GridDots component.
 * 
 * @module components/background/GridDots.example
 */

'use client'

import React from 'react'
import { GridDots } from './GridDots'

export default function GridDotsExample() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <h1 className="text-3xl font-bold text-text mb-8">GridDots Component Examples</h1>
      
      {/* Example 1: Static Grid Dots */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Static Grid Dots</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots animated={false} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-text-secondary">Static dot pattern</p>
          </div>
        </div>
      </div>
      
      {/* Example 2: Animated Grid Dots */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Animated Grid Dots</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots animated={true} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-text-secondary">Animated dot pattern (pulsing)</p>
          </div>
        </div>
      </div>
      
      {/* Example 3: Custom Spacing */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Custom Spacing</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots spacing={50} dotSize={3} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-text-secondary">Larger spacing (50px) and dot size (3px)</p>
          </div>
        </div>
      </div>
      
      {/* Example 4: High Opacity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">High Opacity</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots opacity={0.6} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-text-secondary">Higher opacity (0.6)</p>
          </div>
        </div>
      </div>
      
      {/* Example 5: Dense Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Dense Grid</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots spacing={20} dotSize={1} opacity={0.4} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-text-secondary">Dense grid with small dots</p>
          </div>
        </div>
      </div>
      
      {/* Example 6: Combined with Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text">Combined with Content</h2>
        <div className="relative h-64 bg-surface rounded-lg overflow-hidden">
          <GridDots animated={true} opacity={0.2} />
          <div className="relative z-10 p-8">
            <h3 className="text-2xl font-bold text-text mb-4">Card Title</h3>
            <p className="text-text-secondary">
              This demonstrates how GridDots can be used as a subtle background
              pattern behind content. The dots add visual interest without
              overwhelming the content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * AnimatedBackground Usage Examples
 * 
 * This file demonstrates various ways to use the AnimatedBackground component.
 * These examples can be used as reference or copied into your application.
 */

import React from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicExample() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">Welcome to Nebula AI</h1>
        <p className="mt-4 text-gray-300">
          This page has an animated background with default settings.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 2: Custom Configuration
// ============================================================================

export function CustomConfigExample() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground
        enableOrbs={true}
        enableGrid={false}
        enableParticles={true}
        intensity={80}
      />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">Custom Background</h1>
        <p className="mt-4 text-gray-300">
          This background has orbs and particles enabled, but no grid.
          Intensity is set to 80%.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 3: Theme-Aware Configuration
// ============================================================================

export function ThemeAwareExample() {
  const { currentTheme } = useTheme()
  
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground
        enableOrbs={currentTheme.effects.enableOrbs}
        enableGrid={currentTheme.effects.enableGrid}
        enableParticles={currentTheme.effects.enableParticles}
        intensity={currentTheme.effects.glowIntensity}
      />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">Theme-Aware Background</h1>
        <p className="mt-4 text-gray-300">
          This background automatically adjusts based on the current theme settings.
          Current theme: {currentTheme.name}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 4: Minimal Background (Performance Mode)
// ============================================================================

export function MinimalExample() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground
        enableOrbs={false}
        enableGrid={false}
        enableParticles={false}
        intensity={40}
      />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">Minimal Background</h1>
        <p className="mt-4 text-gray-300">
          This background has all effects disabled for maximum performance.
          Only the gradient background is visible.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 5: Dashboard Layout Integration
// ============================================================================

export function DashboardLayoutExample() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground
        enableOrbs={true}
        enableGrid={true}
        enableParticles={true}
        intensity={60}
        className="opacity-50"
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface/80 backdrop-blur-lg z-20">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white">Sidebar</h2>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="relative z-10 ml-64 p-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="mt-4 text-gray-300">
          The animated background sits behind the sidebar and main content.
        </p>
      </main>
    </div>
  )
}

// ============================================================================
// Example 6: Conditional Rendering Based on User Preference
// ============================================================================

export function ConditionalExample() {
  const [enableBackground, setEnableBackground] = React.useState(true)
  
  return (
    <div className="relative min-h-screen">
      {enableBackground && <AnimatedBackground />}
      
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">Conditional Background</h1>
        <p className="mt-4 text-gray-300">
          Toggle the background on/off based on user preference.
        </p>
        <button
          onClick={() => setEnableBackground(!enableBackground)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          {enableBackground ? 'Disable' : 'Enable'} Background
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Example 7: Multiple Sections with Different Intensities
// ============================================================================

export function MultiSectionExample() {
  return (
    <>
      {/* Hero Section - High Intensity */}
      <section className="relative min-h-screen">
        <AnimatedBackground intensity={90} />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <h1 className="text-6xl font-bold text-white">Hero Section</h1>
        </div>
      </section>
      
      {/* Content Section - Medium Intensity */}
      <section className="relative min-h-screen">
        <AnimatedBackground intensity={50} />
        <div className="relative z-10 p-8">
          <h2 className="text-4xl font-bold text-white">Content Section</h2>
          <p className="mt-4 text-gray-300">
            This section has a more subtle background.
          </p>
        </div>
      </section>
      
      {/* Footer Section - Low Intensity */}
      <section className="relative min-h-[50vh]">
        <AnimatedBackground intensity={20} />
        <div className="relative z-10 p-8">
          <h3 className="text-2xl font-bold text-white">Footer</h3>
          <p className="mt-4 text-gray-300">
            Minimal background for the footer.
          </p>
        </div>
      </section>
    </>
  )
}

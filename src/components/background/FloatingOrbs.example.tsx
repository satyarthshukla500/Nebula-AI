/**
 * FloatingOrbs Example Usage
 * 
 * Demonstrates how to use the FloatingOrbs component with AnimatedBackground.
 * This example shows the component in action with different intensity levels.
 * 
 * @module components/background/FloatingOrbs.example
 */

'use client'

import React from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { ThemeProvider } from '@/contexts/ThemeContext'

/**
 * Example 1: Basic Usage
 * 
 * FloatingOrbs with default settings (intensity 60)
 */
export function BasicFloatingOrbsExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={false}
          enableParticles={false}
          intensity={60}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">
            Floating Orbs Animation
          </h1>
        </div>
      </div>
    </ThemeProvider>
  )
}

/**
 * Example 2: High Intensity
 * 
 * FloatingOrbs with high intensity (more orbs, more visible)
 */
export function HighIntensityOrbsExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={false}
          enableParticles={false}
          intensity={100}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">
            High Intensity Orbs
          </h1>
        </div>
      </div>
    </ThemeProvider>
  )
}

/**
 * Example 3: Low Intensity
 * 
 * FloatingOrbs with low intensity (fewer orbs, more subtle)
 */
export function LowIntensityOrbsExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={false}
          enableParticles={false}
          intensity={30}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">
            Low Intensity Orbs
          </h1>
        </div>
      </div>
    </ThemeProvider>
  )
}

/**
 * Example 4: Combined with Content
 * 
 * FloatingOrbs as background for actual content
 */
export function OrbsWithContentExample() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={false}
          enableParticles={false}
          intensity={60}
        />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to Nebula AI
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Experience the beauty of animated floating orbs in the background
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Feature {i}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Beautiful animated orbs create an engaging visual experience
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

/**
 * Example 5: All Effects Combined
 * 
 * FloatingOrbs with grid and particles (when implemented)
 */
export function AllEffectsExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={true}
          enableParticles={true}
          intensity={70}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              All Effects Combined
            </h1>
            <p className="text-gray-200">
              Orbs, Grid, and Particles working together
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

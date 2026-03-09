/**
 * ParticleSystem Example Usage
 * 
 * Demonstrates how to use the ParticleSystem component with AnimatedBackground.
 * This example shows the component in action with different intensity levels.
 * 
 * @module components/background/ParticleSystem.example
 */

import React from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { ThemeProvider } from '@/contexts/ThemeContext'

// ============================================================================
// Example 1: Basic Particle System
// ============================================================================

export function BasicParticleExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={false}
          enableGrid={false}
          enableParticles={true}
          intensity={60}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Basic Particle System
            </h1>
            <p className="text-gray-300">
              Small animated particles moving across the screen
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

// ============================================================================
// Example 2: High Intensity Particles
// ============================================================================

export function HighIntensityParticleExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={false}
          enableGrid={false}
          enableParticles={true}
          intensity={100}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              High Intensity Particles
            </h1>
            <p className="text-gray-300">
              Maximum particle density for a more dynamic effect
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

// ============================================================================
// Example 3: Low Intensity Particles
// ============================================================================

export function LowIntensityParticleExample() {
  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={false}
          enableGrid={false}
          enableParticles={true}
          intensity={20}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Low Intensity Particles
            </h1>
            <p className="text-gray-300">
              Subtle particle effect for a more minimal look
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

// ============================================================================
// Example 4: Combined Effects
// ============================================================================

export function CombinedEffectsExample() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen w-full">
        <AnimatedBackground
          enableOrbs={true}
          enableGrid={true}
          enableParticles={true}
          intensity={70}
        />
        <div className="relative z-10 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6">
              All Effects Combined
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience the full animated background with floating orbs, grid dots, and particles working together.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Floating Orbs</h3>
                <p className="text-gray-400">
                  Large glowing orbs that bounce around the screen
                </p>
              </div>
              <div className="bg-surface/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Grid Dots</h3>
                <p className="text-gray-400">
                  Subtle dot pattern in the background
                </p>
              </div>
              <div className="bg-surface/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Particles</h3>
                <p className="text-gray-400">
                  Small particles that spawn, move, and fade away
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

// ============================================================================
// Example 5: Interactive Toggle
// ============================================================================

export function InteractiveParticleExample() {
  const [particlesEnabled, setParticlesEnabled] = React.useState(true)
  const [intensity, setIntensity] = React.useState(60)

  return (
    <ThemeProvider>
      <div className="relative h-screen w-full">
        <AnimatedBackground
          enableOrbs={false}
          enableGrid={false}
          enableParticles={particlesEnabled}
          intensity={intensity}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6">
              Interactive Particle Control
            </h1>
            
            <div className="bg-surface/50 backdrop-blur-sm p-6 rounded-lg space-y-4">
              <div>
                <label className="flex items-center justify-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={particlesEnabled}
                    onChange={(e) => setParticlesEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Enable Particles</span>
                </label>
              </div>
              
              <div>
                <label className="block text-white mb-2">
                  Intensity: {intensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

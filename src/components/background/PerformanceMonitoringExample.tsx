/**
 * Performance Monitoring Example
 * 
 * Demonstrates the performance monitoring system with AnimatedBackground.
 * Shows FPS, frame time, and automatic degradation in action.
 * 
 * **Validates: Requirements 5.6, 5.7, 13.2, 13.3, 13.4, 13.6**
 * 
 * @module components/background/PerformanceMonitoringExample
 */

'use client'

import React from 'react'
import { AnimatedBackground } from './AnimatedBackground'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Performance Monitoring Example Component
 * 
 * Displays the animated background with real-time performance metrics overlay.
 * Useful for testing and demonstrating the performance monitoring system.
 */
export function PerformanceMonitoringExample() {
  const performanceMetrics = usePerformanceMonitor()
  const { currentTheme } = useTheme()

  return (
    <div className="relative w-full h-screen">
      {/* Animated Background with Performance Monitoring */}
      <AnimatedBackground
        enableOrbs={true}
        enableGrid={true}
        enableParticles={true}
        intensity={60}
      />

      {/* Performance Metrics Overlay */}
      <div
        className="fixed top-4 left-4 z-50 p-4 rounded-lg shadow-lg font-mono text-sm"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          color: currentTheme.colors.text,
        }}
      >
        <h3 className="font-bold mb-2" style={{ color: currentTheme.colors.accent }}>
          Performance Metrics
        </h3>
        <div className="space-y-1">
          <div>
            <span style={{ color: currentTheme.colors.textSecondary }}>FPS: </span>
            <span
              style={{
                color: performanceMetrics.fps >= 60
                  ? currentTheme.colors.success
                  : performanceMetrics.fps >= 30
                  ? currentTheme.colors.warning
                  : currentTheme.colors.error,
              }}
            >
              {performanceMetrics.fps}
            </span>
          </div>
          <div>
            <span style={{ color: currentTheme.colors.textSecondary }}>Frame Time: </span>
            <span
              style={{
                color: performanceMetrics.frameTime <= 16.67
                  ? currentTheme.colors.success
                  : performanceMetrics.frameTime <= 33.33
                  ? currentTheme.colors.warning
                  : currentTheme.colors.error,
              }}
            >
              {performanceMetrics.frameTime.toFixed(2)}ms
            </span>
          </div>
          <div>
            <span style={{ color: currentTheme.colors.textSecondary }}>Status: </span>
            <span
              style={{
                color: performanceMetrics.isDegraded
                  ? currentTheme.colors.warning
                  : currentTheme.colors.success,
              }}
            >
              {performanceMetrics.isDegraded ? 'Degraded' : 'Normal'}
            </span>
          </div>
          <div>
            <span style={{ color: currentTheme.colors.textSecondary }}>Blur: </span>
            <span
              style={{
                color: performanceMetrics.disableBlur
                  ? currentTheme.colors.warning
                  : currentTheme.colors.success,
              }}
            >
              {performanceMetrics.disableBlur ? 'Disabled' : 'Enabled'}
            </span>
          </div>
          <div>
            <span style={{ color: currentTheme.colors.textSecondary }}>Orb Factor: </span>
            <span
              style={{
                color: performanceMetrics.orbReductionFactor < 1
                  ? currentTheme.colors.warning
                  : currentTheme.colors.success,
              }}
            >
              {(performanceMetrics.orbReductionFactor * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
            Target: 60 FPS (16.67ms)
          </p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
            Degradation: &lt;30 FPS
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div
          className="text-center p-8 rounded-lg"
          style={{
            backgroundColor: `${currentTheme.colors.surface}cc`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
            Performance Monitoring Demo
          </h1>
          <p className="text-lg" style={{ color: currentTheme.colors.textSecondary }}>
            Watch the metrics in the top-left corner
          </p>
          <p className="text-sm mt-2" style={{ color: currentTheme.colors.textMuted }}>
            Performance automatically adjusts when FPS drops below 30
          </p>
        </div>
      </div>
    </div>
  )
}

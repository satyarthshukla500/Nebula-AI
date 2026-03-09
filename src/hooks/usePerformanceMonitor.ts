/**
 * Performance Monitoring Hook
 * 
 * Tracks frame rate and provides automatic performance degradation
 * when FPS drops below acceptable thresholds.
 * 
 * **Validates: Requirements 5.6, 5.7, 13.2, 13.3, 13.4, 13.6**
 * 
 * @module hooks/usePerformanceMonitor
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================================================
// Constants
// ============================================================================

const TARGET_FPS = 60
const LOW_FPS_THRESHOLD = 30
const FPS_SAMPLE_SIZE = 60 // Number of frames to average
const TARGET_FRAME_TIME_MS = 1000 / TARGET_FPS // 16.67ms for 60 FPS

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetrics {
  /** Current frames per second */
  fps: number
  /** Average frame time in milliseconds */
  frameTime: number
  /** Whether performance is degraded (FPS < 30) */
  isDegraded: boolean
  /** Whether blur effects should be disabled */
  disableBlur: boolean
  /** Recommended orb count reduction factor (0-1) */
  orbReductionFactor: number
}

// ============================================================================
// usePerformanceMonitor Hook
// ============================================================================

/**
 * Performance monitoring hook
 * 
 * Tracks FPS and frame time, automatically adjusting performance settings
 * when frame rate drops below acceptable thresholds.
 * 
 * **Validates: Requirements 5.6, 5.7, 13.2, 13.3, 13.4, 13.6**
 * 
 * @returns Performance metrics and degradation flags
 */
export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: TARGET_FPS,
    frameTime: TARGET_FRAME_TIME_MS,
    isDegraded: false,
    disableBlur: false,
    orbReductionFactor: 1.0,
  })

  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const lowFpsCountRef = useRef<number>(0)

  /**
   * Monitor frame rate
   * 
   * **Validates: Requirement 13.2**
   */
  const monitorFrame = useCallback((currentTime: number) => {
    // Calculate frame time
    if (lastFrameTimeRef.current > 0) {
      const frameTime = currentTime - lastFrameTimeRef.current
      frameTimesRef.current.push(frameTime)

      // Keep only recent samples
      if (frameTimesRef.current.length > FPS_SAMPLE_SIZE) {
        frameTimesRef.current.shift()
      }

      // Calculate average frame time and FPS every 10 frames
      frameCountRef.current++
      if (frameCountRef.current % 10 === 0 && frameTimesRef.current.length > 0) {
        const avgFrameTime =
          frameTimesRef.current.reduce((sum, time) => sum + time, 0) /
          frameTimesRef.current.length

        const currentFps = Math.round(1000 / avgFrameTime)

        // Track consecutive low FPS frames
        if (currentFps < LOW_FPS_THRESHOLD) {
          lowFpsCountRef.current++
        } else {
          lowFpsCountRef.current = 0
        }

        // Determine if performance is degraded (sustained low FPS)
        const isDegraded = lowFpsCountRef.current >= 3

        /**
         * Automatic performance degradation
         * 
         * **Validates: Requirements 5.7, 13.3, 13.4**
         */
        const disableBlur = isDegraded
        const orbReductionFactor = isDegraded ? 0.5 : 1.0

        setMetrics({
          fps: currentFps,
          frameTime: avgFrameTime,
          isDegraded,
          disableBlur,
          orbReductionFactor,
        })
      }
    }

    lastFrameTimeRef.current = currentTime
    animationFrameRef.current = requestAnimationFrame(monitorFrame)
  }, [])

  /**
   * Start monitoring on mount
   */
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(monitorFrame)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [monitorFrame])

  return metrics
}

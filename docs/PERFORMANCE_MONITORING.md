# Performance Monitoring Implementation

## Overview

This document describes the performance monitoring and optimization system implemented for the Nebula AI animated background components. The system tracks frame rate in real-time and automatically adjusts visual effects to maintain smooth performance.

**Validates Requirements:** 5.6, 5.7, 13.2, 13.3, 13.4, 13.6

## Components

### 1. usePerformanceMonitor Hook

**Location:** `src/hooks/usePerformanceMonitor.ts`

A React hook that monitors animation performance by tracking FPS and frame time.

#### Features

- **FPS Tracking**: Monitors frames per second using `performance.now()`
- **Frame Time Calculation**: Calculates average frame time over 60 frame samples
- **Automatic Degradation**: Detects when FPS drops below 30 for 3+ consecutive measurements
- **Performance Metrics**: Returns comprehensive metrics for UI display and decision-making

#### Return Values

```typescript
interface PerformanceMetrics {
  fps: number                    // Current frames per second
  frameTime: number              // Average frame time in milliseconds
  isDegraded: boolean            // True when FPS < 30 for sustained period
  disableBlur: boolean           // True when blur effects should be disabled
  orbReductionFactor: number     // Factor to reduce orb count (0.5 when degraded, 1.0 normal)
}
```

#### Usage Example

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

function MyComponent() {
  const metrics = usePerformanceMonitor()
  
  return (
    <div>
      <p>FPS: {metrics.fps}</p>
      <p>Frame Time: {metrics.frameTime.toFixed(2)}ms</p>
      <p>Status: {metrics.isDegraded ? 'Degraded' : 'Normal'}</p>
    </div>
  )
}
```

### 2. Enhanced FloatingOrbs Component

**Location:** `src/components/background/FloatingOrbs.tsx`

The FloatingOrbs component now integrates performance monitoring to automatically adjust rendering quality.

#### Performance Optimizations

1. **Orb Count Reduction**
   - When FPS drops below 30, orb count is reduced by 50%
   - Minimum of 3 orbs maintained even in degraded mode
   - Calculation: `orbCount = baseOrbCount * orbReductionFactor`

2. **Blur Effect Disabling**
   - Blur effects are disabled when `disableBlur` flag is true
   - Significantly reduces GPU load
   - Maintains visual quality with gradient fills

3. **Frame Time Optimization**
   - Target: 16.67ms per frame (60 FPS)
   - Uses `requestAnimationFrame` for smooth animations
   - Delta time-based movement for consistent speed

#### Code Example

```typescript
// Automatic orb count adjustment
const baseOrbCount = Math.max(
  MIN_ORBS,
  Math.min(MAX_ORBS, Math.floor((intensity / 100) * MAX_ORBS))
)

const orbCount = Math.max(
  MIN_ORBS,
  Math.floor(baseOrbCount * performanceMetrics.orbReductionFactor)
)

// Conditional blur rendering
function renderOrb(ctx: CanvasRenderingContext2D, orb: Orb, disableBlur: boolean) {
  // ... gradient setup ...
  
  if (!disableBlur) {
    const blurAmount = orb.size * 0.3
    ctx.filter = `blur(${blurAmount}px)`
  }
  
  // ... render orb ...
}
```

### 3. Enhanced AnimatedBackground Component

**Location:** `src/components/background/AnimatedBackground.tsx`

The container component now displays performance notifications when degradation occurs.

#### Features

1. **Performance Notice**
   - Displays when `isDegraded` becomes true
   - Auto-hides after 5 seconds
   - Styled with theme colors
   - Positioned in bottom-right corner

2. **Integrated Monitoring**
   - Uses `usePerformanceMonitor` hook
   - Passes metrics to child components
   - Manages notification state

#### Performance Notice UI

```typescript
{showPerformanceNotice && (
  <div className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg">
    <span className="text-sm">
      ⚡ Performance mode: Effects reduced for smoother experience
    </span>
  </div>
)}
```

## Performance Thresholds

### Target Performance
- **FPS**: 60 frames per second
- **Frame Time**: 16.67ms per frame
- **Status**: Normal operation with all effects enabled

### Degraded Performance
- **FPS**: Below 30 frames per second (sustained for 3+ measurements)
- **Frame Time**: Above 33.33ms per frame
- **Status**: Automatic degradation triggered

### Degradation Actions

When performance degrades:

1. **Orb Count**: Reduced to 50% of original count
2. **Blur Effects**: Disabled completely
3. **User Notification**: Displayed for 5 seconds
4. **Recovery**: Automatic when FPS improves

## Testing

### Manual Testing

Use the `PerformanceMonitoringExample` component to visualize performance metrics:

```typescript
import { PerformanceMonitoringExample } from '@/components/background/PerformanceMonitoringExample'

// In your page or test component
<PerformanceMonitoringExample />
```

This displays:
- Real-time FPS counter
- Frame time measurement
- Degradation status
- Blur effect status
- Orb reduction factor

### Performance Testing Scenarios

1. **Normal Load**
   - Open page with animated background
   - Verify FPS stays at or near 60
   - Confirm all effects are enabled

2. **Heavy Load**
   - Open multiple browser tabs
   - Run CPU-intensive tasks
   - Verify automatic degradation when FPS drops
   - Confirm notification appears

3. **Recovery**
   - Close extra tabs or stop intensive tasks
   - Verify FPS recovers to 60
   - Confirm effects re-enable automatically

## Implementation Details

### FPS Calculation

```typescript
// Track frame times
const frameTime = currentTime - lastFrameTime
frameTimesRef.current.push(frameTime)

// Calculate average over 60 frames
const avgFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / 
                     frameTimesRef.current.length

// Convert to FPS
const currentFps = Math.round(1000 / avgFrameTime)
```

### Degradation Detection

```typescript
// Track consecutive low FPS frames
if (currentFps < LOW_FPS_THRESHOLD) {
  lowFpsCountRef.current++
} else {
  lowFpsCountRef.current = 0
}

// Trigger degradation after 3 consecutive low FPS measurements
const isDegraded = lowFpsCountRef.current >= 3
```

### Automatic Adjustments

```typescript
// Disable blur when degraded
const disableBlur = isDegraded

// Reduce orb count to 50% when degraded
const orbReductionFactor = isDegraded ? 0.5 : 1.0
```

## Browser Compatibility

The performance monitoring system uses standard Web APIs:

- `performance.now()`: Supported in all modern browsers
- `requestAnimationFrame`: Supported in all modern browsers
- Canvas 2D Context: Supported in all modern browsers

## Future Enhancements

Potential improvements for future iterations:

1. **Adaptive Thresholds**: Adjust degradation threshold based on device capabilities
2. **Particle Density**: Also reduce particle count when degraded
3. **Grid Simplification**: Reduce grid dot density in degraded mode
4. **User Preferences**: Allow users to manually set performance mode
5. **Performance History**: Track and display performance over time
6. **Device Detection**: Pre-adjust settings based on device type (mobile vs desktop)

## Troubleshooting

### Performance Not Improving

If performance remains poor even after degradation:

1. Check browser console for errors
2. Verify canvas element is properly sized
3. Ensure no other heavy animations are running
4. Check for memory leaks in browser DevTools
5. Try reducing `intensity` prop on AnimatedBackground

### Metrics Not Updating

If performance metrics appear frozen:

1. Verify `usePerformanceMonitor` hook is being called
2. Check that `requestAnimationFrame` is not being blocked
3. Ensure component is mounted and visible
4. Check browser console for errors

### Degradation Too Sensitive

If degradation triggers too easily:

1. Adjust `LOW_FPS_THRESHOLD` constant (currently 30)
2. Increase consecutive frame count requirement (currently 3)
3. Adjust `FPS_SAMPLE_SIZE` for smoother averaging (currently 60)

## References

- **Requirements**: See `requirements.md` sections 5.6, 5.7, 13.2-13.4, 13.6
- **Design**: See `design.md` Performance Optimization section
- **Tasks**: Task 4.5 in `tasks.md`

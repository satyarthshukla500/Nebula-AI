# Animated Background Components

This directory contains the animated background system for Nebula AI, including floating orbs, grid dots, and particle effects.

## Components

### AnimatedBackground

Container component that manages canvas setup, window resize handling, and renders all background effects.

**Props:**
- `enableOrbs` (boolean, default: true) - Enable floating orbs animation
- `enableGrid` (boolean, default: true) - Enable grid dots background
- `enableParticles` (boolean, default: true) - Enable particle system
- `intensity` (number, 0-100, default: 60) - Effect intensity
- `className` (string, optional) - Additional CSS classes

**Features:**
- Automatic canvas sizing and resize handling
- Reduced motion support (respects `prefers-reduced-motion`)
- Proper cleanup on unmount
- Theme-aware gradient background

**Example:**
```tsx
<AnimatedBackground
  enableOrbs={true}
  enableGrid={false}
  enableParticles={false}
  intensity={60}
/>
```

### FloatingOrbs

Renders animated floating orbs using canvas with radial gradients and blur effects. Orbs move across the canvas and bounce off boundaries.

**Props:**
- `canvas` (HTMLCanvasElement | null) - Canvas element to render on
- `width` (number) - Canvas width
- `height` (number) - Canvas height
- `intensity` (number, 0-100, default: 60) - Effect intensity

### GridDots

Renders a dot pattern background using CSS radial gradients. The dots use theme colors and support both static and animated variants.

**Props:**
- `animated` (boolean, default: false) - Enable animated variant (dots pulse/fade)
- `dotSize` (number, default: 2) - Dot size in pixels
- `spacing` (number, default: 30) - Grid spacing in pixels
- `opacity` (number, 0-1, default: 0.3) - Opacity of dots
- `className` (string, optional) - Additional CSS classes

**Features:**
- CSS-based dot pattern using radial gradients
- Theme-aware colors (uses accent color)
- Optional pulse animation
- Lightweight and performant
- No canvas required
- Accessibility compliant (aria-hidden)

**Example:**
```tsx
<GridDots
  animated={true}
  dotSize={2}
  spacing={30}
  opacity={0.3}
/>
```

**Validates Requirements:**
- 4.2: Render grid dots when enabled in theme

**Features:**
- Random orb initialization with varied sizes and velocities
- Smooth animation using `requestAnimationFrame`
- Radial gradient fills with theme colors
- Blur effects based on orb size
- Boundary collision detection and bounce
- Automatic color updates when theme changes
- Performance monitoring (FPS tracking)

**Implementation Details:**

#### Orb Initialization
- Minimum 3 orbs, maximum 8 orbs
- Orb count scales with intensity (0-100)
- Random positions within canvas bounds
- Random sizes between 40px and 120px
- Random velocities between 0.02 and 0.05 pixels per millisecond
- Uses theme colors (primary, secondary, accent, glow)

#### Animation Loop
- Uses `requestAnimationFrame` for smooth 60 FPS animation
- Calculates delta time for consistent animation speed
- Updates orb positions based on velocity and delta time
- Clears canvas before each frame
- Renders all orbs with gradients and blur

#### Collision Detection
- Detects when orb reaches canvas boundary
- Reverses velocity component (X or Y) on collision
- Clamps position to stay within bounds
- Maintains constant speed magnitude

#### Rendering
- Creates radial gradient from orb color to transparent
- Applies blur filter based on orb size (size * 0.3)
- Draws orb using canvas arc
- Resets filter after rendering

**Validates Requirements:**
- 4.4: Display at least 3 orbs with blur and glow effects
- 4.5: Animate smoothly at 60 FPS
- 4.6: Bounce orbs at canvas boundaries
- 4.8: Update orb colors when theme changes
- 5.1: Initialize orbs with random positions, sizes, velocities
- 5.2: Update positions based on velocity and delta time
- 5.3: Reverse velocity on boundary collision
- 5.4: Apply radial gradient fills from theme colors
- 5.5: Apply blur effects based on orb size

## Usage

### Basic Setup

```tsx
import { AnimatedBackground } from '@/components/background/AnimatedBackground'

function MyPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </div>
  )
}
```

### With Custom Settings

```tsx
<AnimatedBackground
  enableOrbs={true}
  enableGrid={false}
  enableParticles={false}
  intensity={80}
  className="custom-background"
/>
```

### Integration with Theme System

The components automatically use colors from the current theme via `useTheme()` hook:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AnimatedBackground } from '@/components/background/AnimatedBackground'

function App() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

## Performance Considerations

### Optimization Strategies
- Uses `requestAnimationFrame` for smooth animations
- Calculates delta time for consistent animation speed
- Limits orb count based on intensity (max 8 orbs)
- Tracks FPS for performance monitoring
- Cleans up animation frames on unmount
- Respects `prefers-reduced-motion` preference

### Performance Targets
- Target: 60 FPS (16ms per frame)
- Minimum: 30 FPS
- Orb count: 3-8 based on intensity
- Canvas operations optimized for GPU acceleration

### Future Optimizations (Task 4.5)
- Automatic orb count reduction if FPS drops below 30
- Disable blur effects if performance degrades
- Object pooling for particles
- IntersectionObserver for off-screen animation pausing

## Accessibility

### Reduced Motion Support
The components respect the user's `prefers-reduced-motion` preference:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Animations are disabled
  // Static gradient background is shown instead
}
```

### Implementation
- Detects `prefers-reduced-motion` media query
- Disables all animations when user prefers reduced motion
- Maintains visual design with static gradient background
- No functionality is lost, only animations are disabled

## Testing

### Unit Tests
Tests are located in `__tests__/FloatingOrbs.test.tsx` and cover:

- Component rendering
- Orb initialization
- Animation loop
- Orb rendering with gradients and blur
- Theme integration and color updates
- Canvas dimension handling
- Intensity prop variations
- Performance (requestAnimationFrame usage)

### Running Tests
```bash
npm test -- FloatingOrbs.test.tsx
```

Note: Jest is not currently configured in the project. Tests are written but require Jest setup to run.

## Browser Compatibility

### Supported Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Required APIs
- Canvas API (2D context)
- `requestAnimationFrame`
- `matchMedia` (for reduced motion detection)

### Fallbacks
- If Canvas API is unavailable, falls back to CSS gradient background
- If `requestAnimationFrame` is unavailable, uses `setTimeout` fallback
- Graceful degradation for older browsers

## File Structure

```
background/
├── AnimatedBackground.tsx       # Container component
├── AnimatedBackground.example.tsx # AnimatedBackground usage examples
├── FloatingOrbs.tsx             # Floating orbs implementation
├── FloatingOrbs.example.tsx     # FloatingOrbs usage examples
├── GridDots.tsx                 # Grid dots implementation
├── GridDots.example.tsx         # GridDots usage examples
├── README.md                    # This file
└── __tests__/
    ├── AnimatedBackground.test.tsx
    ├── FloatingOrbs.test.tsx
    └── GridDots.test.tsx
```

## Future Enhancements

### Planned Features (from tasks.md)
- **ParticleSystem component** (Task 4.4) - Animated particles
- **Performance monitoring** (Task 4.5) - FPS tracking and auto-optimization
- **Integration with DashboardLayout** (Task 4.7) - Add to main layout

### Potential Improvements
- WebGL renderer for better performance
- More orb shapes (squares, triangles, custom paths)
- Orb interaction (mouse attraction/repulsion)
- Orb collision with each other
- Customizable orb behaviors per theme
- Export animation as video/GIF

## Contributing

When modifying these components:

1. Maintain 60 FPS performance target
2. Ensure proper cleanup (cancel animation frames, remove listeners)
3. Respect `prefers-reduced-motion` preference
4. Update tests to cover new functionality
5. Document new props and features
6. Validate against requirements in design.md

## Related Documentation

- [Design Document](../../../.kiro/specs/nebula-ui-redesign/design.md)
- [Requirements](../../../.kiro/specs/nebula-ui-redesign/requirements.md)
- [Tasks](../../../.kiro/specs/nebula-ui-redesign/tasks.md)
- [Theme System](../../contexts/ThemeContext.tsx)
- [Theme Types](../../types/theme.ts)

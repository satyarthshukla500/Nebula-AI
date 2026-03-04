# Nebula AI Theme & Animation Refactor - Implementation Plan

## ✅ Completed

### Theme System Foundation
- [x] Created `/src/themes/` folder structure
- [x] Implemented `types.ts` with TypeScript interfaces
- [x] Created `minimalTheme.ts` (Chat, Explain, Summary)
- [x] Created `cyberTheme.ts` (Debug, Cybersecurity)
- [x] Created `academicTheme.ts` (Study Focus)
- [x] Created `wellnessTheme.ts` (Mental Wellness)
- [x] Created theme index with dynamic imports
- [x] Created `AnimatedCard` component
- [x] Created `MotionWrapper` utilities (FadeIn, SlideUp)

## 🔄 Next Steps

### 1. Theme Context & Provider
**File:** `src/contexts/ThemeContext.tsx`
```typescript
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { Theme, ThemeName } from '@/themes'

// Create context for global theme switching
// Store in localStorage
// Provide useTheme hook
```

### 2. Workspace Theme Mapping
**File:** `src/config/workspaceThemes.ts`
```typescript
export const workspaceThemes = {
  'chat': 'minimal',
  'explain': 'minimal',
  'summarize': 'minimal',
  'debug': 'cyber',
  'cyber-safety': 'cyber',
  'study': 'academic',
  'wellness': 'wellness',
  'quiz': 'minimal', // with mode toggle
}
```

### 3. Animation Configurations
**File:** `src/animations/configs.ts`
```typescript
export const minimalAnimations = {
  fadeIn: { duration: 0.2 },
  cardHover: { y: -2, duration: 0.15 },
  slideUp: { y: 10, duration: 0.2 },
}

export const cyberAnimations = {
  glow: { duration: 2, repeat: Infinity },
  pulse: { scale: [1, 1.02, 1], duration: 2 },
  gradientBorder: '20s linear infinite',
}

export const academicAnimations = {
  gentleFade: { duration: 0.3 },
  progressBar: { duration: 0.4 },
}

export const wellnessAnimations = {
  breathing: { duration: 8, repeat: Infinity },
  float: { y: [-10, 10], duration: 6 },
  scale: { scale: [1, 1.03, 1], duration: 0.3 },
}
```

### 4. CSS Animations
**File:** `src/styles/animations.css`
```css
@keyframes cyber-glow {
  0%, 100% { box-shadow: 0 0 5px var(--glow-color); }
  50% { box-shadow: 0 0 20px var(--glow-color); }
}

@keyframes gradient-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes wellness-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes breathing-bg {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes grid-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(20px); }
}
```

### 5. Redesign Workspace Layouts

#### Chat Workspace
**File:** `src/app/dashboard/workspaces/chat/page.tsx`
- Apply minimal theme
- Add fade-in animation
- Implement card hover lift
- Smooth message slide-up

#### Debug Workspace  
**File:** `src/app/dashboard/workspaces/debug/page.tsx`
- Apply cyber theme
- Add neon glow borders
- Implement gradient border animation
- Add subtle grid background
- Use monospace font

#### Study Workspace
**File:** `src/app/dashboard/workspaces/study/page.tsx`
- Apply academic theme
- Add gentle fade + slide-up
- Implement calm progress bar
- Paper-like card UI

#### Wellness Workspace
**File:** `src/app/dashboard/workspaces/wellness/page.tsx`
- Apply wellness theme
- Add breathing background animation
- Implement floating shapes
- Add "Ambient Mode" toggle (UI only)
- Rounded 20px cards

#### Quiz Workspace (Merged)
**File:** `src/app/dashboard/workspaces/quiz/page.tsx`
- Merge Quiz Arena + Interactive Quiz
- Add mode selector: Professional / Game
- Professional: Clean UI, timer, score summary
- Game: XP indicator, leaderboard UI, animations

### 6. Redesign Sidebar
**File:** `src/components/layout/Sidebar.tsx`
- Replace icons with Lucide React
- Modern SaaS style
- Add hover animations
- Remove childish elements

**Icons to use:**
```typescript
import {
  MessageSquare,    // Chat
  BookOpen,         // Explain
  FileText,         // Summary
  Bug,              // Debug
  Shield,           // Cyber Safety
  GraduationCap,    // Study
  Heart,            // Wellness
  Trophy,           // Quiz
} from 'lucide-react'
```

### 7. Profile Dropdown
**File:** `src/components/layout/ProfileDropdown.tsx`
- Move Sign Out to top-right
- Add avatar circle placeholder
- Dropdown menu with:
  - Profile
  - Settings
  - Theme Switcher
  - Sign Out

### 8. Global Theme Switcher
**File:** `src/components/layout/ThemeSwitcher.tsx`
- Light / Dark / Cyber / Calm modes
- Store in localStorage
- Apply globally
- Smooth transition

### 9. Animated Background Component
**File:** `src/components/backgrounds/AnimatedBackground.tsx`
```typescript
// CSS-based gradient animation
// No heavy libraries
// Performance-optimized
// Different per theme
```

### 10. Reusable Components

**AnimatedButton**
```typescript
// Smooth hover transitions
// Theme-aware colors
// 150ms duration
```

**AnimatedProgress**
```typescript
// Smooth fill animation
// Theme-aware colors
// Academic: calm, Game: dynamic
```

**GlowCard** (Cyber theme)
```typescript
// Neon border glow
// Pulse effect
// Gradient border animation
```

**FloatingShape** (Wellness theme)
```typescript
// CSS keyframe animation
// Blurred background shapes
// Slow movement
```

## Implementation Order

1. ✅ Theme system (DONE)
2. ✅ Animation components (DONE)
3. Theme Context & Provider
4. Animation configs
5. CSS animations
6. Sidebar redesign
7. Profile dropdown
8. Workspace layouts (one by one)
9. Quiz merge & mode selector
10. Global theme switcher
11. Animated backgrounds
12. Testing & optimization

## Performance Checklist

- [ ] All animations under 300ms (except background loops)
- [ ] Use `will-change` for animated properties
- [ ] Implement `React.memo` for heavy components
- [ ] Use CSS transforms (GPU-accelerated)
- [ ] Avoid layout shifts
- [ ] Test on low-end devices
- [ ] Monitor frame rate
- [ ] Lazy load theme assets

## File Structure

```
src/
├── themes/
│   ├── types.ts ✅
│   ├── minimalTheme.ts ✅
│   ├── cyberTheme.ts ✅
│   ├── academicTheme.ts ✅
│   ├── wellnessTheme.ts ✅
│   └── index.ts ✅
├── contexts/
│   └── ThemeContext.tsx
├── components/
│   ├── animations/
│   │   ├── AnimatedCard.tsx ✅
│   │   ├── MotionWrapper.tsx ✅
│   │   ├── AnimatedButton.tsx
│   │   ├── AnimatedProgress.tsx
│   │   ├── GlowCard.tsx
│   │   └── FloatingShape.tsx
│   ├── backgrounds/
│   │   └── AnimatedBackground.tsx
│   └── layout/
│       ├── Sidebar.tsx (redesign)
│       ├── ProfileDropdown.tsx (new)
│       └── ThemeSwitcher.tsx (new)
├── animations/
│   └── configs.ts
├── config/
│   └── workspaceThemes.ts
└── styles/
    └── animations.css
```

## Testing Plan

1. Test each workspace theme individually
2. Verify animations don't cause jank
3. Test theme switching
4. Verify localStorage persistence
5. Test on different screen sizes
6. Performance profiling
7. Accessibility check

## Notes

- Keep backend logic untouched
- Maintain all existing routes
- No breaking changes to functionality
- Focus on UI/UX enhancement
- Professional production-level code
- Clean, modular, scalable architecture

---

**Status:** Foundation complete, ready for full implementation
**Next:** Create ThemeContext and start workspace refactoring

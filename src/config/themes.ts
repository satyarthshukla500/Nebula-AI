/**
 * Built-in Theme Presets
 * 
 * This file contains all built-in theme configurations for the Nebula AI redesign.
 * Each theme includes complete ThemeConfig objects with colors, effects, typography,
 * spacing, borderRadius, and shadows properties.
 * 
 * Themes:
 * - dark: Default purple/pink gradient theme with high glow intensity
 * - light: Light theme with adjusted colors and reduced effects
 * - aurora: Blue/green gradient theme inspired by northern lights
 * - sunset: Orange/red gradient theme with warm tones
 * 
 * @module config/themes
 */

import { ThemeConfig } from '@/types/theme'

/**
 * Dark Theme (Default)
 * Purple/pink gradient theme with high glow intensity and all effects enabled
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: '#0f0f1e',
    surface: '#1a1a2e',
    surfaceHover: '#252540',
    text: '#e5e7eb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: '#374151',
    borderHover: '#4b5563',
    glow: '#8b5cf6',
    gradient1: '#8b5cf6',
    gradient2: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  effects: {
    glowIntensity: 60,
    animationSpeed: 1.0,
    particleDensity: 50,
    blurAmount: 10,
    enableOrbs: true,
    enableGrid: true,
    enableParticles: true,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeight: 1.5,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(139, 92, 246, 0.6)',
  },
}

/**
 * Light Theme
 * Light background with purple accents and reduced effects
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    text: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    glow: '#7c3aed',
    gradient1: '#7c3aed',
    gradient2: '#ec4899',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  effects: {
    glowIntensity: 40,
    animationSpeed: 1.0,
    particleDensity: 30,
    blurAmount: 8,
    enableOrbs: true,
    enableGrid: false,
    enableParticles: false,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeight: 1.5,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(124, 58, 237, 0.4)',
  },
}

/**
 * Aurora Theme
 * Blue/green gradient theme inspired by northern lights
 */
export const auroraTheme: ThemeConfig = {
  name: 'aurora',
  colors: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    background: '#0c1222',
    surface: '#1a2332',
    surfaceHover: '#243447',
    text: '#e0f2fe',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    borderHover: '#475569',
    glow: '#06b6d4',
    gradient1: '#06b6d4',
    gradient2: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },
  effects: {
    glowIntensity: 70,
    animationSpeed: 0.8,
    particleDensity: 60,
    blurAmount: 12,
    enableOrbs: true,
    enableGrid: true,
    enableParticles: true,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeight: 1.5,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 25px rgba(6, 182, 212, 0.7)',
  },
}

/**
 * Sunset Theme
 * Orange/red gradient theme with warm tones
 */
export const sunsetTheme: ThemeConfig = {
  name: 'sunset',
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: '#1a0f0a',
    surface: '#2a1810',
    surfaceHover: '#3a2418',
    text: '#fef3c7',
    textSecondary: '#fbbf24',
    textMuted: '#d97706',
    border: '#78350f',
    borderHover: '#92400e',
    glow: '#f97316',
    gradient1: '#f97316',
    gradient2: '#dc2626',
    success: '#10b981',
    warning: '#fbbf24',
    error: '#dc2626',
    info: '#3b82f6',
  },
  effects: {
    glowIntensity: 65,
    animationSpeed: 1.2,
    particleDensity: 55,
    blurAmount: 11,
    enableOrbs: true,
    enableGrid: true,
    enableParticles: true,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeight: 1.5,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 22px rgba(249, 115, 22, 0.65)',
  },
}

/**
 * Array of all built-in themes
 * Used by ThemeProvider to populate theme selection
 */
export const BUILT_IN_THEMES: ThemeConfig[] = [
  darkTheme,
  lightTheme,
  auroraTheme,
  sunsetTheme,
]

/**
 * Get a theme by name
 * @param name - Theme name to retrieve
 * @returns ThemeConfig or undefined if not found
 */
export function getThemeByName(name: string): ThemeConfig | undefined {
  return BUILT_IN_THEMES.find(theme => theme.name === name)
}

/**
 * Get all theme names
 * @returns Array of theme names
 */
export function getThemeNames(): string[] {
  return BUILT_IN_THEMES.map(theme => theme.name)
}

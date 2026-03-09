/**
 * Theme Validation Tests
 * 
 * Tests for the theme validation module to ensure proper validation
 * of theme configurations, colors, and effects.
 */

import { validateThemeConfig, isValidColor, validatePartialTheme } from '../validation'
import type { ThemeConfig } from '@/types/theme'

describe('Theme Validation', () => {
  // Valid theme configuration for testing
  const validTheme: ThemeConfig = {
    name: 'test-theme',
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
      fontFamily: 'Inter, system-ui, sans-serif',
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
      glow: '0 0 20px #8b5cf6',
    },
  }

  describe('validateThemeConfig', () => {
    it('should validate a correct theme configuration', () => {
      const result = validateThemeConfig(validTheme)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject theme with missing name', () => {
      const invalidTheme = { ...validTheme, name: '' }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'name')).toBe(true)
    })

    it('should reject theme with invalid color format', () => {
      const invalidTheme = {
        ...validTheme,
        colors: { ...validTheme.colors, primary: 'not-a-color' },
      }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'colors.primary')).toBe(true)
    })

    it('should reject theme with glowIntensity out of range', () => {
      const invalidTheme = {
        ...validTheme,
        effects: { ...validTheme.effects, glowIntensity: 150 },
      }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'effects.glowIntensity')).toBe(true)
    })

    it('should reject theme with animationSpeed out of range', () => {
      const invalidTheme = {
        ...validTheme,
        effects: { ...validTheme.effects, animationSpeed: 3.0 },
      }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'effects.animationSpeed')).toBe(true)
    })

    it('should reject theme with particleDensity out of range', () => {
      const invalidTheme = {
        ...validTheme,
        effects: { ...validTheme.effects, particleDensity: -10 },
      }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'effects.particleDensity')).toBe(true)
    })

    it('should reject theme with missing colors object', () => {
      const invalidTheme = { ...validTheme, colors: undefined as any }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'colors')).toBe(true)
    })

    it('should reject theme with missing effects object', () => {
      const invalidTheme = { ...validTheme, effects: undefined as any }
      const result = validateThemeConfig(invalidTheme)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'effects')).toBe(true)
    })
  })

  describe('isValidColor', () => {
    it('should validate hex colors', () => {
      expect(isValidColor('#8b5cf6')).toBe(true)
      expect(isValidColor('#fff')).toBe(true)
      expect(isValidColor('#ffffff')).toBe(true)
    })

    it('should validate rgb colors', () => {
      expect(isValidColor('rgb(139, 92, 246)')).toBe(true)
      expect(isValidColor('rgba(139, 92, 246, 0.5)')).toBe(true)
    })

    it('should validate hsl colors', () => {
      expect(isValidColor('hsl(258, 90%, 66%)')).toBe(true)
      expect(isValidColor('hsla(258, 90%, 66%, 0.5)')).toBe(true)
    })

    it('should reject invalid colors', () => {
      expect(isValidColor('not-a-color')).toBe(false)
      expect(isValidColor('12345')).toBe(false)
      expect(isValidColor('')).toBe(false)
    })
  })

  describe('validatePartialTheme', () => {
    it('should validate partial theme with only colors', () => {
      const partial = {
        colors: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
        },
      }
      const result = validatePartialTheme(partial)
      expect(result.isValid).toBe(true)
    })

    it('should reject partial theme with invalid color', () => {
      const partial = {
        colors: {
          primary: 'invalid-color',
        },
      }
      const result = validatePartialTheme(partial)
      expect(result.isValid).toBe(false)
    })

    it('should validate partial theme with only effects', () => {
      const partial = {
        effects: {
          glowIntensity: 75,
        },
      }
      const result = validatePartialTheme(partial)
      expect(result.isValid).toBe(true)
    })

    it('should reject partial theme with out of range effect', () => {
      const partial = {
        effects: {
          glowIntensity: 150,
        },
      }
      const result = validatePartialTheme(partial)
      expect(result.isValid).toBe(false)
    })
  })
})

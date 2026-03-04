import { Theme } from './types'

export const wellnessTheme: Theme = {
  name: 'wellness',
  colors: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c084fc',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#3f3f46',
    textSecondary: '#71717a',
    border: '#e9d5ff',
    success: '#10b981',
    error: '#f87171',
    warning: '#fbbf24',
  },
  animation: {
    duration: {
      fast: 300,
      normal: 500,
      slow: 8000,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    effects: {
      glow: false,
      gradient: true,
      float: true,
      pulse: false,
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
  shadow: {
    sm: '0 2px 8px rgba(139, 92, 246, 0.1)',
    md: '0 4px 12px rgba(139, 92, 246, 0.15)',
    lg: '0 8px 24px rgba(139, 92, 246, 0.2)',
  },
}

import { Theme } from './types'

export const academicTheme: Theme = {
  name: 'academic',
  colors: {
    primary: '#2563eb',
    secondary: '#475569',
    accent: '#3b82f6',
    background: '#fafaf9',
    surface: '#ffffff',
    text: '#1c1917',
    textSecondary: '#78716c',
    border: '#e7e5e4',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#ea580c',
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 400,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    effects: {
      glow: false,
      gradient: false,
      float: false,
      pulse: false,
    },
  },
  typography: {
    fontFamily: 'Georgia, Cambria, serif',
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
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadow: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
    md: '0 2px 4px 0 rgb(0 0 0 / 0.06)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
  },
}

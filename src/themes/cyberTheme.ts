import { Theme } from './types'

export const cyberTheme: Theme = {
  name: 'cyber',
  colors: {
    primary: '#00ff9f',
    secondary: '#00d4ff',
    accent: '#ff00ff',
    background: '#0a0e1a',
    surface: '#131827',
    text: '#e0e7ff',
    textSecondary: '#94a3b8',
    border: '#1e293b',
    success: '#00ff9f',
    error: '#ff0055',
    warning: '#ffaa00',
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 2000,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    effects: {
      glow: true,
      gradient: true,
      float: false,
      pulse: true,
    },
  },
  typography: {
    fontFamily: 'JetBrains Mono, Consolas, monospace',
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
    sm: '0 0 10px rgba(0, 255, 159, 0.1)',
    md: '0 0 20px rgba(0, 255, 159, 0.2)',
    lg: '0 0 30px rgba(0, 255, 159, 0.3)',
  },
}

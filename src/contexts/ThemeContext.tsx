'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ThemeName = 'dark' | 'light' | 'aurora' | 'sunset'

const THEME_VARS: Record<ThemeName, Record<string, string>> = {
  dark: {
    '--accent':     '#7c6bff',
    '--accent2':    '#00d4ff',
    '--accent3':    '#ff6b9d',
    '--nebula1':    '#7c6bff',
    '--nebula2':    '#00d4ff',
    '--nebula3':    '#ff6b9d',
    '--bg':         '#060818',
    '--bg2':        '#0d1225',
    '--surface':    'rgba(255,255,255,0.04)',
    '--border':     'rgba(255,255,255,0.08)',
    '--text':       '#f0f4ff',
    '--text-muted': '#8892b0',
    '--sidebar-bg': '#080b1a',
    '--card-bg':    'rgba(13,18,37,0.9)',
    '--input-bg':   'rgba(255,255,255,0.05)',
  },
  light: {
    '--accent':     '#5b4de8',
    '--accent2':    '#0099cc',
    '--accent3':    '#e8336d',
    '--nebula1':    '#5b4de8',
    '--nebula2':    '#0099cc',
    '--nebula3':    '#e8336d',
    '--bg':         '#f0f2ff',
    '--bg2':        '#e8eaff',
    '--surface':    'rgba(0,0,0,0.03)',
    '--border':     'rgba(0,0,0,0.08)',
    '--text':       '#0d1225',
    '--text-muted': '#6b7280',
    '--sidebar-bg': '#ffffff',
    '--card-bg':    '#ffffff',
    '--input-bg':   'rgba(0,0,0,0.04)',
  },
  aurora: {
    '--accent':     '#00ff88',
    '--accent2':    '#00ccff',
    '--accent3':    '#88ff00',
    '--nebula1':    '#00ff88',
    '--nebula2':    '#00ccff',
    '--nebula3':    '#88ff00',
    '--bg':         '#011a0e',
    '--bg2':        '#021f12',
    '--surface':    'rgba(0,255,128,0.04)',
    '--border':     'rgba(0,255,128,0.1)',
    '--text':       '#e0fff0',
    '--text-muted': '#5a9e78',
    '--sidebar-bg': '#010f08',
    '--card-bg':    'rgba(2,31,18,0.9)',
    '--input-bg':   'rgba(0,255,128,0.05)',
  },
  sunset: {
    '--accent':     '#ff6b6b',
    '--accent2':    '#ffa500',
    '--accent3':    '#ff00aa',
    '--nebula1':    '#ff6b6b',
    '--nebula2':    '#ffa500',
    '--nebula3':    '#ff00aa',
    '--bg':         '#1a0810',
    '--bg2':        '#200d15',
    '--surface':    'rgba(255,100,100,0.04)',
    '--border':     'rgba(255,100,100,0.1)',
    '--text':       '#fff0f0',
    '--text-muted': '#b06060',
    '--sidebar-bg': '#100508',
    '--card-bg':    'rgba(32,13,21,0.9)',
    '--input-bg':   'rgba(255,100,100,0.05)',
  },
}

// Apply CSS variables directly to :root — this is the ONLY correct way
function applyThemeVars(name: ThemeName) {
  // Guard: if name is invalid, fall back to 'dark'
  const safeName: ThemeName = THEME_VARS[name] ? name : 'dark'
  const vars = THEME_VARS[safeName]
  
  // Guard: if vars is still undefined somehow, stop
  if (!vars) return
  
  const root = document.documentElement
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
  
  document.body.style.backgroundColor = vars['--bg'] || '#060818'
  document.body.style.color = vars['--text'] || '#f0f4ff'
  root.setAttribute('data-theme', safeName)
  localStorage.setItem('nebula-theme', safeName)
}

interface ThemeCtx {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('dark')
  
  useEffect(() => {
    const saved = localStorage.getItem('nebula-theme')
    // Only use saved value if it's a valid theme name
    const validThemes = ['dark', 'light', 'aurora', 'sunset']
    const safeTheme: ThemeName = validThemes.includes(saved || '') ? (saved as ThemeName) : 'dark'
    setThemeState(safeTheme)
    applyThemeVars(safeTheme)
  }, [])
  
  function setTheme(t: ThemeName) {
    setThemeState(t)
    applyThemeVars(t)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

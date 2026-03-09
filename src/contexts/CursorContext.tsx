'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface CursorSettings {
  cursorType: string
  cursorColor: string
  dotSize: number
  ringSize: number
  trailLength: number
  glowEnabled: boolean
  selectedEmoji: string
}

const defaults: CursorSettings = {
  cursorType: 'dot-ring',
  cursorColor: '#7c6bff',
  dotSize: 8,
  ringSize: 40,
  trailLength: 8,
  glowEnabled: true,
  selectedEmoji: '🚀',
}

const CursorContext = createContext<{
  settings: CursorSettings
  updateSettings: (s: Partial<CursorSettings>) => void
}>({ settings: defaults, updateSettings: () => {} })

export function CursorProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CursorSettings>(defaults)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nebula-cursor')
      if (saved) setSettings({ ...defaults, ...JSON.parse(saved) })
    } catch {}
  }, [])

  function updateSettings(s: Partial<CursorSettings>) {
    setSettings(prev => {
      const next = { ...prev, ...s }
      localStorage.setItem('nebula-cursor', JSON.stringify(next))
      return next
    })
  }

  return (
    <CursorContext.Provider value={{ settings, updateSettings }}>
      {children}
    </CursorContext.Provider>
  )
}

export const useCursor = () => useContext(CursorContext)

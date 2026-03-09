'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
  const { theme, setTheme } = useTheme()
  const [accentColor, setAccentColor] = useState('#7c6bff')
  const [secondaryColor, setSecondaryColor] = useState('#00d4ff')
  const [highlightColor, setHighlightColor] = useState('#ff6b9d')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [enableOrbs, setEnableOrbs] = useState(true)
  const [enableParticles, setEnableParticles] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const presetThemes = [
    { id: 'dark', name: '🌌 Cosmic', colors: { accent: '#7c6bff', secondary: '#00d4ff', highlight: '#ff6b9d', bg: '#060818' } },
    { id: 'light', name: '☀️ Light', colors: { accent: '#5b4de8', secondary: '#00d4ff', highlight: '#ff6b9d', bg: '#f0f2ff' } },
    { id: 'aurora', name: '🌿 Aurora', colors: { accent: '#00ff88', secondary: '#00ccff', highlight: '#00ff88', bg: '#011a0e' } },
    { id: 'sunset', name: '🌅 Sunset', colors: { accent: '#ff6b6b', secondary: '#ffa500', highlight: '#ff6b6b', bg: '#1a0810' } },
  ]

  const handlePresetClick = (preset: typeof presetThemes[0]) => {
    setTheme(preset.id as any)
    setAccentColor(preset.colors.accent)
    setSecondaryColor(preset.colors.secondary)
    setHighlightColor(preset.colors.highlight)
  }

  const handleColorChange = (type: 'accent' | 'secondary' | 'highlight', value: string) => {
    if (type === 'accent') {
      setAccentColor(value)
      document.documentElement.style.setProperty('--accent', value)
      document.documentElement.style.setProperty('--nebula1', value)
    } else if (type === 'secondary') {
      setSecondaryColor(value)
      document.documentElement.style.setProperty('--accent2', value)
      document.documentElement.style.setProperty('--nebula2', value)
    } else {
      setHighlightColor(value)
      document.documentElement.style.setProperty('--accent3', value)
      document.documentElement.style.setProperty('--nebula3', value)
    }
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setBackgroundImage(base64)
        document.body.style.backgroundImage = `url(${base64})`
        document.body.style.backgroundSize = 'cover'
        document.body.style.backgroundPosition = 'center'
        localStorage.setItem('nebula-bg-image', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearBackground = () => {
    setBackgroundImage(null)
    document.body.style.backgroundImage = 'none'
    localStorage.removeItem('nebula-bg-image')
  }

  const toggleOrbs = () => {
    setEnableOrbs(!enableOrbs)
    localStorage.setItem('nebula-orbs', String(!enableOrbs))
    // Trigger re-render of AnimatedBackground
    window.dispatchEvent(new CustomEvent('theme-animation-change', { detail: { orbs: !enableOrbs } }))
  }

  const toggleParticles = () => {
    setEnableParticles(!enableParticles)
    localStorage.setItem('nebula-particles', String(!enableParticles))
    window.dispatchEvent(new CustomEvent('theme-animation-change', { detail: { particles: !enableParticles } }))
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className="fixed top-0 h-screen overflow-y-auto transition-all duration-400 z-[1000]"
        style={{
          right: isOpen ? '0' : '-320px',
          width: '300px',
          background: '#0d1225',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          padding: '24px',
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            🎨 Custom Theme
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Preset Themes */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">
            Pick a preset or customize your own colors
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetThemes.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-2 text-sm text-white rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Custom Colors */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">Custom Colors</label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Accent Color</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Secondary Color</span>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Highlight Color</span>
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => handleColorChange('highlight', e.target.value)}
                className="w-12 h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Custom Background Image */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">Custom Background Image</label>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 text-sm text-white rounded-lg transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              📁 Upload Background Image
            </button>
            <button
              onClick={handleClearBackground}
              className="w-full px-4 py-2 text-sm text-white rounded-lg transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              ✕ Clear Background
            </button>
          </div>
        </div>

        {/* Section 4: Animations */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-3">Animations</label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Floating Orbs</span>
              <button
                onClick={toggleOrbs}
                className="relative w-10 h-6 rounded-full transition-all"
                style={{
                  background: enableOrbs ? '#7c6bff' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                  style={{
                    left: enableOrbs ? '20px' : '4px',
                  }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Particles</span>
              <button
                onClick={toggleParticles}
                className="relative w-10 h-6 rounded-full transition-all"
                style={{
                  background: enableParticles ? '#7c6bff' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                  style={{
                    left: enableParticles ? '20px' : '4px',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

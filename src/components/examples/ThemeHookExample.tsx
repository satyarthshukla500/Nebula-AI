/**
 * Example component demonstrating useTheme hook usage
 * 
 * This component shows how to use the useTheme hook to:
 * - Access current theme
 * - Switch between themes
 * - View available themes
 * - Create custom themes
 * 
 * **Validates: Requirements 1.1, 1.7**
 */

'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeHookExample() {
  const {
    currentTheme,
    builtInThemes,
    customThemes,
    setTheme,
    updateCustomTheme,
    saveCustomTheme,
    deleteCustomTheme,
  } = useTheme()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Current Theme</h2>
        <p>Name: {currentTheme.name}</p>
        <p>Primary Color: {currentTheme.colors.primary}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Built-in Themes</h2>
        <div className="flex gap-2">
          {builtInThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className="px-4 py-2 rounded bg-surface hover:bg-surface-hover"
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Custom Themes</h2>
        {customThemes.length === 0 ? (
          <p>No custom themes yet</p>
        ) : (
          <div className="flex gap-2">
            {customThemes.map((theme) => (
              <div key={theme.name} className="flex gap-1">
                <button
                  onClick={() => setTheme(theme.name)}
                  className="px-4 py-2 rounded bg-surface hover:bg-surface-hover"
                >
                  {theme.name}
                </button>
                <button
                  onClick={() => deleteCustomTheme(theme.name)}
                  className="px-2 py-2 rounded bg-error hover:bg-error/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Create Custom Theme</h2>
        <div className="space-y-2">
          <div>
            <label className="block mb-1">Primary Color</label>
            <input
              type="color"
              value={currentTheme.colors.primary}
              onChange={(e) => updateCustomTheme('colors.primary', e.target.value)}
              className="w-20 h-10"
            />
          </div>
          <button
            onClick={() => {
              const name = prompt('Enter theme name:')
              if (name) saveCustomTheme(name)
            }}
            className="px-4 py-2 rounded bg-accent hover:bg-accent/80"
          >
            Save as Custom Theme
          </button>
        </div>
      </div>
    </div>
  )
}

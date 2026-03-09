/**
 * Sanitize theme name to prevent XSS
 */
export function sanitizeThemeName(name: string): string {
  // Remove HTML tags and script content
  return name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 50) // Limit length
}

/**
 * Validate color value format
 */
export function isValidColor(color: string): boolean {
  // Hex color pattern
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  
  // RGB pattern
  const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  
  // RGBA pattern
  const rgbaPattern = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/
  
  // HSL pattern
  const hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
  
  // HSLA pattern
  const hslaPattern = /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/

  return (
    hexPattern.test(color) ||
    rgbPattern.test(color) ||
    rgbaPattern.test(color) ||
    hslPattern.test(color) ||
    hslaPattern.test(color)
  )
}

/**
 * Validate numeric range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Sanitize and validate theme configuration
 */
export function sanitizeThemeConfig(config: any): any {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid theme configuration')
  }

  // Sanitize name
  if (config.name) {
    config.name = sanitizeThemeName(config.name)
  }

  // Validate colors
  if (config.colors && typeof config.colors === 'object') {
    for (const [key, value] of Object.entries(config.colors)) {
      if (typeof value === 'string' && !isValidColor(value)) {
        throw new Error(`Invalid color value for ${key}: ${value}`)
      }
    }
  }

  // Validate effects
  if (config.effects && typeof config.effects === 'object') {
    if (config.effects.glowIntensity !== undefined) {
      if (!isInRange(config.effects.glowIntensity, 0, 100)) {
        throw new Error('glowIntensity must be between 0 and 100')
      }
    }
    if (config.effects.animationSpeed !== undefined) {
      if (!isInRange(config.effects.animationSpeed, 0.5, 2.0)) {
        throw new Error('animationSpeed must be between 0.5 and 2.0')
      }
    }
    if (config.effects.particleDensity !== undefined) {
      if (!isInRange(config.effects.particleDensity, 0, 100)) {
        throw new Error('particleDensity must be between 0 and 100')
      }
    }
  }

  return config
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

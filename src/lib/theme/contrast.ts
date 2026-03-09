/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    return 1
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * Normal text: 4.5:1
 * Large text: 3:1
 */
export function meetsWCAGAA(
  textColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(textColor, bgColor)
  const threshold = isLargeText ? 3 : 4.5
  return ratio >= threshold
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * Normal text: 7:1
 * Large text: 4.5:1
 */
export function meetsWCAGAAA(
  textColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(textColor, bgColor)
  const threshold = isLargeText ? 4.5 : 7
  return ratio >= threshold
}

/**
 * Get contrast level description
 */
export function getContrastLevel(ratio: number): 'fail' | 'aa-large' | 'aa' | 'aaa' {
  if (ratio >= 7) return 'aaa'
  if (ratio >= 4.5) return 'aa'
  if (ratio >= 3) return 'aa-large'
  return 'fail'
}

/**
 * Suggest alternative colors when contrast is poor
 */
export function suggestBetterContrast(
  textColor: string,
  bgColor: string
): { lighten: string; darken: string } | null {
  const rgb = hexToRgb(textColor)
  if (!rgb) return null

  // Simple suggestions: lighten or darken by 20%
  const lighten = `#${Math.min(255, rgb.r + 51)
    .toString(16)
    .padStart(2, '0')}${Math.min(255, rgb.g + 51)
    .toString(16)
    .padStart(2, '0')}${Math.min(255, rgb.b + 51)
    .toString(16)
    .padStart(2, '0')}`

  const darken = `#${Math.max(0, rgb.r - 51)
    .toString(16)
    .padStart(2, '0')}${Math.max(0, rgb.g - 51)
    .toString(16)
    .padStart(2, '0')}${Math.max(0, rgb.b - 51)
    .toString(16)
    .padStart(2, '0')}`

  return { lighten, darken }
}

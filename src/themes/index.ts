export { minimalTheme } from './minimalTheme'
export { cyberTheme } from './cyberTheme'
export { academicTheme } from './academicTheme'
export { wellnessTheme } from './wellnessTheme'
export type { Theme, ThemeColors, ThemeAnimation, ThemeTypography } from './types'

export const themes = {
  minimal: () => import('./minimalTheme').then(m => m.minimalTheme),
  cyber: () => import('./cyberTheme').then(m => m.cyberTheme),
  academic: () => import('./academicTheme').then(m => m.academicTheme),
  wellness: () => import('./wellnessTheme').then(m => m.wellnessTheme),
}

export type ThemeName = keyof typeof themes

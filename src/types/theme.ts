/**
 * Theme System Type Definitions
 * 
 * This file contains all TypeScript interfaces for the Nebula AI theme system.
 * It defines types for theme configuration, colors, effects, typography, context values,
 * and validation.
 * 
 * @module types/theme
 */

// ============================================================================
// Theme Configuration Interfaces
// ============================================================================

/**
 * Complete theme configuration object
 * Defines all visual properties for a theme including colors, effects, typography, etc.
 */
export interface ThemeConfig {
  /** Unique name identifier for the theme */
  name: string
  /** Color palette configuration */
  colors: ThemeColors
  /** Visual effects configuration */
  effects: ThemeEffects
  /** Typography settings */
  typography: ThemeTypography
  /** Spacing scale */
  spacing: ThemeSpacing
  /** Border radius values */
  borderRadius: ThemeBorderRadius
  /** Shadow definitions */
  shadows: ThemeShadows
}

/**
 * Theme color palette
 * Contains all color values used throughout the application
 */
export interface ThemeColors {
  // Base colors
  /** Primary brand color */
  primary: string
  /** Secondary brand color */
  secondary: string
  /** Accent color for highlights and CTAs */
  accent: string
  
  // Surface colors
  /** Main background color */
  background: string
  /** Surface/card background color */
  surface: string
  /** Surface color on hover state */
  surfaceHover: string
  
  // Text colors
  /** Primary text color */
  text: string
  /** Secondary text color (less emphasis) */
  textSecondary: string
  /** Muted text color (least emphasis) */
  textMuted: string
  
  // Border colors
  /** Default border color */
  border: string
  /** Border color on hover state */
  borderHover: string
  
  // Effect colors
  /** Glow effect color */
  glow: string
  /** First gradient color */
  gradient1: string
  /** Second gradient color */
  gradient2: string
  
  // Semantic colors
  /** Success state color */
  success: string
  /** Warning state color */
  warning: string
  /** Error state color */
  error: string
  /** Info state color */
  info: string
}

/**
 * Visual effects configuration
 * Controls animation and visual effect parameters
 */
export interface ThemeEffects {
  /** Glow intensity (0-100) */
  glowIntensity: number
  /** Animation speed multiplier (0.5-2.0) */
  animationSpeed: number
  /** Particle density (0-100) */
  particleDensity: number
  /** Blur amount in pixels (0-20) */
  blurAmount: number
  /** Enable floating orbs animation */
  enableOrbs: boolean
  /** Enable grid dots background */
  enableGrid: boolean
  /** Enable particle system */
  enableParticles: boolean
}

/**
 * Typography configuration
 * Defines font properties and text styling
 */
export interface ThemeTypography {
  /** Font family stack */
  fontFamily: string
  /** Base font size */
  fontSizeBase: string
  /** Normal font weight */
  fontWeightNormal: number
  /** Medium font weight */
  fontWeightMedium: number
  /** Bold font weight */
  fontWeightBold: number
  /** Line height ratio */
  lineHeight: number
}

/**
 * Spacing scale
 * Defines consistent spacing values
 */
export interface ThemeSpacing {
  /** Extra small spacing */
  xs: string
  /** Small spacing */
  sm: string
  /** Medium spacing */
  md: string
  /** Large spacing */
  lg: string
  /** Extra large spacing */
  xl: string
}

/**
 * Border radius values
 * Defines corner rounding for different component sizes
 */
export interface ThemeBorderRadius {
  /** Small border radius */
  sm: string
  /** Medium border radius */
  md: string
  /** Large border radius */
  lg: string
  /** Extra large border radius */
  xl: string
  /** Fully rounded (pill shape) */
  full: string
}

/**
 * Shadow definitions
 * Defines elevation shadows and glow effects
 */
export interface ThemeShadows {
  /** Small shadow */
  sm: string
  /** Medium shadow */
  md: string
  /** Large shadow */
  lg: string
  /** Extra large shadow */
  xl: string
  /** Glow shadow effect */
  glow: string
}

// ============================================================================
// Theme Context Interfaces
// ============================================================================

/**
 * Theme context value
 * Provides theme state and methods to all components via React context
 */
export interface ThemeContextValue {
  /** Currently active theme configuration */
  currentTheme: ThemeConfig
  /** Array of built-in theme presets */
  builtInThemes: ThemeConfig[]
  /** Array of user-created custom themes */
  customThemes: ThemeConfig[]
  /** Switch to a different theme by name */
  setTheme: (themeName: string) => void
  /** Update a property in the current custom theme */
  updateCustomTheme: (key: string, value: string | number | boolean) => void
  /** Save the current custom theme with a name */
  saveCustomTheme: (name: string) => void
  /** Delete a custom theme by name */
  deleteCustomTheme: (name: string) => void
  /** Export theme as JSON string */
  exportTheme: (themeName: string) => string
  /** Import theme from JSON string */
  importTheme: (themeJson: string) => void
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Theme validation result
 * Contains validation status and any error messages
 */
export interface ThemeValidationResult {
  /** Whether the theme configuration is valid */
  isValid: boolean
  /** Array of validation error messages */
  errors: ThemeValidationError[]
}

/**
 * Theme validation error
 * Describes a specific validation failure
 */
export interface ThemeValidationError {
  /** Field path that failed validation (e.g., "colors.primary") */
  field: string
  /** Error message describing the validation failure */
  message: string
  /** Type of validation error */
  type: ValidationErrorType
}

/**
 * Types of validation errors
 */
export enum ValidationErrorType {
  /** Required field is missing */
  MISSING_FIELD = 'MISSING_FIELD',
  /** Value is of incorrect type */
  INVALID_TYPE = 'INVALID_TYPE',
  /** Color value is not a valid CSS color */
  INVALID_COLOR = 'INVALID_COLOR',
  /** Numeric value is out of valid range */
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  /** String value is empty when it shouldn't be */
  EMPTY_STRING = 'EMPTY_STRING',
  /** Theme name already exists */
  DUPLICATE_NAME = 'DUPLICATE_NAME',
}

/**
 * Color contrast validation result
 * Used to ensure accessibility compliance
 */
export interface ContrastValidationResult {
  /** Contrast ratio value (e.g., 4.5) */
  ratio: number
  /** Whether contrast meets WCAG AA standard (4.5:1) */
  meetsAA: boolean
  /** Whether contrast meets WCAG AAA standard (7:1) */
  meetsAAA: boolean
  /** Text color being tested */
  textColor: string
  /** Background color being tested */
  backgroundColor: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial theme configuration for updates
 * Allows updating only specific theme properties
 */
export type PartialThemeConfig = Partial<ThemeConfig>

/**
 * Theme preset name
 * Union type of built-in theme names
 */
export type ThemePresetName = 'dark' | 'light' | 'aurora' | 'sunset'

/**
 * CSS variable name mapping
 * Maps theme property paths to CSS variable names
 */
export type CSSVariableMap = Record<string, string>

/**
 * Theme storage key
 * Keys used for localStorage persistence
 */
export enum ThemeStorageKey {
  /** Current active theme */
  CURRENT_THEME = 'nebula-theme',
  /** Array of custom themes */
  CUSTOM_THEMES = 'nebula-custom-themes',
  /** User preferences */
  PREFERENCES = 'nebula-theme-preferences',
}

/**
 * Theme preferences
 * User preferences for theme behavior
 */
export interface ThemePreferences {
  /** Whether to respect system color scheme preference */
  respectSystemTheme: boolean
  /** Whether to enable animations */
  enableAnimations: boolean
  /** Whether to enable reduced motion mode */
  reducedMotion: boolean
  /** Performance mode (auto-adjust effects based on FPS) */
  performanceMode: boolean
}

// ============================================================================
// Animation & Effect Types
// ============================================================================

/**
 * Orb configuration for floating orbs animation
 */
export interface Orb {
  /** Unique identifier */
  id: string
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Orb size (radius) */
  size: number
  /** Orb color */
  color: string
  /** Horizontal velocity */
  speedX: number
  /** Vertical velocity */
  speedY: number
}

/**
 * Particle configuration for particle system
 */
export interface Particle {
  /** Unique identifier */
  id: string
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Horizontal velocity */
  vx: number
  /** Vertical velocity */
  vy: number
  /** Remaining lifetime (0-1) */
  life: number
}

/**
 * Canvas bounds for animations
 */
export interface Bounds {
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Theme change event detail
 * Payload for custom theme change events
 */
export interface ThemeChangeEventDetail {
  /** Previous theme configuration */
  previousTheme: ThemeConfig
  /** New theme configuration */
  currentTheme: ThemeConfig
  /** Timestamp of the change */
  timestamp: number
}

/**
 * Custom theme change event
 */
export interface ThemeChangeEvent extends CustomEvent<ThemeChangeEventDetail> {
  type: 'themechange'
}

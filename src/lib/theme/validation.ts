/**
 * Theme Validation Module
 * 
 * Provides comprehensive validation for theme configurations to ensure
 * all color values are valid CSS colors and numeric values are within
 * acceptable ranges. Uses the colord library for robust color validation.
 * 
 * @module lib/theme/validation
 */

import { colord } from 'colord'
import type {
  ThemeConfig,
  ThemeValidationResult,
  ThemeValidationError,
  ValidationErrorType,
} from '@/types/theme'

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Numeric range constraints for theme effects
 */
const VALIDATION_RANGES = {
  glowIntensity: { min: 0, max: 100 },
  animationSpeed: { min: 0.5, max: 2.0 },
  particleDensity: { min: 0, max: 100 },
  blurAmount: { min: 0, max: 20 },
} as const

/**
 * Required color fields in ThemeColors interface
 */
const REQUIRED_COLOR_FIELDS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'surfaceHover',
  'text',
  'textSecondary',
  'textMuted',
  'border',
  'borderHover',
  'glow',
  'gradient1',
  'gradient2',
  'success',
  'warning',
  'error',
  'info',
] as const

/**
 * Required effect fields in ThemeEffects interface
 */
const REQUIRED_EFFECT_FIELDS = [
  'glowIntensity',
  'animationSpeed',
  'particleDensity',
  'blurAmount',
  'enableOrbs',
  'enableGrid',
  'enableParticles',
] as const

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates a complete theme configuration
 * 
 * Checks all required fields exist, validates color formats using colord,
 * and ensures numeric values are within acceptable ranges.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 * 
 * @param config - Theme configuration to validate
 * @returns Validation result with isValid flag and array of errors
 * 
 * @example
 * ```typescript
 * const result = validateThemeConfig(myTheme)
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors)
 * }
 * ```
 */
export function validateThemeConfig(config: ThemeConfig): ThemeValidationResult {
  const errors: ThemeValidationError[] = []

  // Validate theme name
  if (!config.name || typeof config.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Theme name is required and must be a non-empty string',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  } else if (config.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Theme name cannot be empty',
      type: 'EMPTY_STRING' as ValidationErrorType,
    })
  }

  // Validate colors object exists
  if (!config.colors || typeof config.colors !== 'object') {
    errors.push({
      field: 'colors',
      message: 'Colors configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  } else {
    // Validate each required color field
    errors.push(...validateColors(config.colors as unknown as Record<string, unknown>))
  }

  // Validate effects object exists
  if (!config.effects || typeof config.effects !== 'object') {
    errors.push({
      field: 'effects',
      message: 'Effects configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  } else {
    // Validate each effect field
    errors.push(...validateEffects(config.effects as unknown as Record<string, unknown>))
  }

  // Validate typography object exists
  if (!config.typography || typeof config.typography !== 'object') {
    errors.push({
      field: 'typography',
      message: 'Typography configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  }

  // Validate spacing object exists
  if (!config.spacing || typeof config.spacing !== 'object') {
    errors.push({
      field: 'spacing',
      message: 'Spacing configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  }

  // Validate borderRadius object exists
  if (!config.borderRadius || typeof config.borderRadius !== 'object') {
    errors.push({
      field: 'borderRadius',
      message: 'Border radius configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  }

  // Validate shadows object exists
  if (!config.shadows || typeof config.shadows !== 'object') {
    errors.push({
      field: 'shadows',
      message: 'Shadows configuration is required',
      type: 'MISSING_FIELD' as ValidationErrorType,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// Color Validation Functions
// ============================================================================

/**
 * Validates all color fields in the theme colors configuration
 * 
 * Uses colord library to validate that each color is a valid CSS color
 * in hex, rgb, or hsl format.
 * 
 * @param colors - Theme colors object to validate
 * @returns Array of validation errors (empty if all valid)
 */
function validateColors(colors: Record<string, unknown>): ThemeValidationError[] {
  const errors: ThemeValidationError[] = []

  for (const field of REQUIRED_COLOR_FIELDS) {
    const value = colors[field]

    // Check if field exists
    if (value === undefined || value === null) {
      errors.push({
        field: `colors.${field}`,
        message: `Color field '${field}' is required`,
        type: 'MISSING_FIELD' as ValidationErrorType,
      })
      continue
    }

    // Check if field is a string
    if (typeof value !== 'string') {
      errors.push({
        field: `colors.${field}`,
        message: `Color field '${field}' must be a string`,
        type: 'INVALID_TYPE' as ValidationErrorType,
      })
      continue
    }

    // Validate color format using colord
    if (!isValidColor(value)) {
      errors.push({
        field: `colors.${field}`,
        message: `Color '${value}' is not a valid CSS color (hex, rgb, or hsl)`,
        type: 'INVALID_COLOR' as ValidationErrorType,
      })
    }
  }

  return errors
}

/**
 * Validates if a string is a valid CSS color
 * 
 * Supports hex, rgb, rgba, hsl, and hsla formats.
 * 
 * @param color - Color string to validate
 * @returns True if valid CSS color, false otherwise
 * 
 * @example
 * ```typescript
 * isValidColor('#8b5cf6')  // true
 * isValidColor('rgb(139, 92, 246)')  // true
 * isValidColor('hsl(258, 90%, 66%)')  // true
 * isValidColor('invalid')  // false
 * ```
 */
export function isValidColor(color: string): boolean {
  return colord(color).isValid()
}

// ============================================================================
// Effects Validation Functions
// ============================================================================

/**
 * Validates all effect fields in the theme effects configuration
 * 
 * Ensures numeric values are within acceptable ranges and boolean
 * values are of correct type.
 * 
 * @param effects - Theme effects object to validate
 * @returns Array of validation errors (empty if all valid)
 */
function validateEffects(effects: Record<string, unknown>): ThemeValidationError[] {
  const errors: ThemeValidationError[] = []

  for (const field of REQUIRED_EFFECT_FIELDS) {
    const value = effects[field]

    // Check if field exists
    if (value === undefined || value === null) {
      errors.push({
        field: `effects.${field}`,
        message: `Effect field '${field}' is required`,
        type: 'MISSING_FIELD' as ValidationErrorType,
      })
      continue
    }

    // Validate numeric fields
    if (field in VALIDATION_RANGES) {
      errors.push(...validateNumericRange(field, value))
    }

    // Validate boolean fields
    if (field.startsWith('enable')) {
      if (typeof value !== 'boolean') {
        errors.push({
          field: `effects.${field}`,
          message: `Effect field '${field}' must be a boolean`,
          type: 'INVALID_TYPE' as ValidationErrorType,
        })
      }
    }
  }

  return errors
}

/**
 * Validates a numeric value is within the acceptable range
 * 
 * @param field - Field name being validated
 * @param value - Value to validate
 * @returns Array of validation errors (empty if valid)
 */
function validateNumericRange(
  field: string,
  value: unknown
): ThemeValidationError[] {
  const errors: ThemeValidationError[] = []

  // Check if value is a number
  if (typeof value !== 'number') {
    errors.push({
      field: `effects.${field}`,
      message: `Effect field '${field}' must be a number`,
      type: 'INVALID_TYPE' as ValidationErrorType,
    })
    return errors
  }

  // Check if value is finite (not NaN, Infinity, or -Infinity)
  if (!Number.isFinite(value)) {
    errors.push({
      field: `effects.${field}`,
      message: `Effect field '${field}' must be a finite number`,
      type: 'INVALID_TYPE' as ValidationErrorType,
    })
    return errors
  }

  // Get range constraints for this field
  const range = VALIDATION_RANGES[field as keyof typeof VALIDATION_RANGES]
  if (!range) {
    return errors
  }

  // Validate range
  if (value < range.min || value > range.max) {
    errors.push({
      field: `effects.${field}`,
      message: `Effect field '${field}' must be between ${range.min} and ${range.max} (got ${value})`,
      type: 'OUT_OF_RANGE' as ValidationErrorType,
    })
  }

  return errors
}

// ============================================================================
// Utility Validation Functions
// ============================================================================

/**
 * Validates multiple theme configurations at once
 * 
 * Useful for batch validation of custom themes.
 * 
 * @param configs - Array of theme configurations to validate
 * @returns Map of theme names to validation results
 * 
 * @example
 * ```typescript
 * const results = validateMultipleThemes([theme1, theme2, theme3])
 * for (const [name, result] of results) {
 *   if (!result.isValid) {
 *     console.error(`Theme '${name}' is invalid:`, result.errors)
 *   }
 * }
 * ```
 */
export function validateMultipleThemes(
  configs: ThemeConfig[]
): Map<string, ThemeValidationResult> {
  const results = new Map<string, ThemeValidationResult>()

  for (const config of configs) {
    const result = validateThemeConfig(config)
    results.set(config.name, result)
  }

  return results
}

/**
 * Checks if a theme name is unique among existing themes
 * 
 * @param name - Theme name to check
 * @param existingThemes - Array of existing theme configurations
 * @returns True if name is unique, false if duplicate
 */
export function isUniqueThemeName(
  name: string,
  existingThemes: ThemeConfig[]
): boolean {
  return !existingThemes.some((theme) => theme.name === name)
}

/**
 * Validates a partial theme configuration for updates
 * 
 * Only validates fields that are present in the partial config.
 * Useful for validating theme customization updates.
 * 
 * @param partial - Partial theme configuration to validate
 * @returns Validation result with errors for invalid fields
 */
export function validatePartialTheme(
  partial: Partial<ThemeConfig>
): ThemeValidationResult {
  const errors: ThemeValidationError[] = []

  // Validate name if present
  if ('name' in partial) {
    if (!partial.name || typeof partial.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Theme name must be a non-empty string',
        type: 'INVALID_TYPE' as ValidationErrorType,
      })
    } else if (partial.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Theme name cannot be empty',
        type: 'EMPTY_STRING' as ValidationErrorType,
      })
    }
  }

  // Validate colors if present
  if (partial.colors) {
    for (const [key, value] of Object.entries(partial.colors)) {
      if (typeof value === 'string' && !isValidColor(value)) {
        errors.push({
          field: `colors.${key}`,
          message: `Color '${value}' is not a valid CSS color`,
          type: 'INVALID_COLOR' as ValidationErrorType,
        })
      }
    }
  }

  // Validate effects if present
  if (partial.effects) {
    for (const [key, value] of Object.entries(partial.effects)) {
      if (key in VALIDATION_RANGES && typeof value === 'number') {
        const range = VALIDATION_RANGES[key as keyof typeof VALIDATION_RANGES]
        if (value < range.min || value > range.max) {
          errors.push({
            field: `effects.${key}`,
            message: `Effect field '${key}' must be between ${range.min} and ${range.max}`,
            type: 'OUT_OF_RANGE' as ValidationErrorType,
          })
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

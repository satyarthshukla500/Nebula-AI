# Theme Validation Module

This module provides comprehensive validation for theme configurations in the Nebula AI application. It ensures that all theme values are valid before they are applied to the UI, preventing runtime errors and maintaining a consistent user experience.

## Features

- ✅ **Color Validation**: Validates hex, rgb, rgba, hsl, and hsla color formats using the `colord` library
- ✅ **Range Validation**: Ensures numeric values are within acceptable ranges
- ✅ **Type Checking**: Validates that all fields have the correct data types
- ✅ **Detailed Error Messages**: Provides specific error messages for each validation failure
- ✅ **Partial Validation**: Supports validating partial theme updates for real-time feedback
- ✅ **Batch Validation**: Can validate multiple themes at once

## Validation Rules

### Color Validation

All color fields must be valid CSS colors in one of these formats:
- Hex: `#8b5cf6`, `#fff`, `#ffffff`
- RGB: `rgb(139, 92, 246)`, `rgba(139, 92, 246, 0.5)`
- HSL: `hsl(258, 90%, 66%)`, `hsla(258, 90%, 66%, 0.5)`

### Numeric Range Validation

| Field | Minimum | Maximum | Description |
|-------|---------|---------|-------------|
| `glowIntensity` | 0 | 100 | Glow effect intensity percentage |
| `animationSpeed` | 0.5 | 2.0 | Animation speed multiplier |
| `particleDensity` | 0 | 100 | Particle density percentage |
| `blurAmount` | 0 | 20 | Blur effect in pixels |

### Required Fields

All theme configurations must include:
- `name`: Non-empty string
- `colors`: Object with all 18 required color fields
- `effects`: Object with all 7 required effect fields
- `typography`: Typography configuration object
- `spacing`: Spacing scale object
- `borderRadius`: Border radius values object
- `shadows`: Shadow definitions object

## Usage

### Basic Validation

```typescript
import { validateThemeConfig } from '@/lib/theme/validation'
import type { ThemeConfig } from '@/types/theme'

const myTheme: ThemeConfig = {
  // ... theme configuration
}

const result = validateThemeConfig(myTheme)

if (result.isValid) {
  console.log('✅ Theme is valid!')
} else {
  console.error('❌ Validation errors:')
  result.errors.forEach(error => {
    console.error(`  ${error.field}: ${error.message}`)
  })
}
```

### Color Validation

```typescript
import { isValidColor } from '@/lib/theme/validation'

// Validate individual colors
if (isValidColor('#8b5cf6')) {
  console.log('Valid hex color')
}

if (isValidColor('rgb(139, 92, 246)')) {
  console.log('Valid RGB color')
}

if (isValidColor('hsl(258, 90%, 66%)')) {
  console.log('Valid HSL color')
}
```

### Partial Theme Validation

```typescript
import { validatePartialTheme } from '@/lib/theme/validation'

// Validate only the fields being updated
const partial = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
  },
  effects: {
    glowIntensity: 75,
  },
}

const result = validatePartialTheme(partial)

if (result.isValid) {
  // Apply the partial update
  updateTheme(partial)
}
```

### Batch Validation

```typescript
import { validateMultipleThemes } from '@/lib/theme/validation'

const themes = [theme1, theme2, theme3]
const results = validateMultipleThemes(themes)

for (const [name, result] of results) {
  if (!result.isValid) {
    console.error(`Theme '${name}' is invalid:`, result.errors)
  }
}
```

### Theme Name Uniqueness

```typescript
import { isUniqueThemeName } from '@/lib/theme/validation'

const existingThemes = [darkTheme, lightTheme, auroraTheme]

if (isUniqueThemeName('my-custom-theme', existingThemes)) {
  console.log('Theme name is unique')
} else {
  console.error('Theme name already exists')
}
```

## Validation Error Types

The validation module returns errors with the following types:

- `MISSING_FIELD`: Required field is missing
- `INVALID_TYPE`: Value is of incorrect type
- `INVALID_COLOR`: Color value is not a valid CSS color
- `OUT_OF_RANGE`: Numeric value is outside acceptable range
- `EMPTY_STRING`: String value is empty when it shouldn't be
- `DUPLICATE_NAME`: Theme name already exists

## Examples

See the `__tests__/validation-examples.ts` file for comprehensive examples of:
- Validating before saving
- Real-time validation for color pickers
- Validating partial updates
- Batch validation of imported themes
- Theme name validation
- Effect value validation with user-friendly messages
- Detailed validation feedback
- Safe theme application with fallback

## Testing

Run the manual test to verify the validation functions:

```bash
npx tsx src/lib/theme/__tests__/manual-validation-test.ts
```

## Requirements Validated

This module validates the following requirements from the design document:

- **Requirement 2.1**: Validates all required fields exist
- **Requirement 2.2**: Verifies all color values are valid CSS colors (hex, rgb, or hsl)
- **Requirement 2.3**: Ensures glowIntensity is between 0 and 100
- **Requirement 2.4**: Ensures animationSpeed is between 0.5 and 2.0
- **Requirement 2.5**: Ensures particleDensity is between 0 and 100

## API Reference

### `validateThemeConfig(config: ThemeConfig): ThemeValidationResult`

Validates a complete theme configuration.

**Parameters:**
- `config`: Theme configuration to validate

**Returns:**
- `ThemeValidationResult` with `isValid` boolean and `errors` array

### `isValidColor(color: string): boolean`

Validates if a string is a valid CSS color.

**Parameters:**
- `color`: Color string to validate

**Returns:**
- `true` if valid, `false` otherwise

### `validatePartialTheme(partial: Partial<ThemeConfig>): ThemeValidationResult`

Validates a partial theme configuration for updates.

**Parameters:**
- `partial`: Partial theme configuration

**Returns:**
- `ThemeValidationResult` with validation status

### `validateMultipleThemes(configs: ThemeConfig[]): Map<string, ThemeValidationResult>`

Validates multiple theme configurations at once.

**Parameters:**
- `configs`: Array of theme configurations

**Returns:**
- Map of theme names to validation results

### `isUniqueThemeName(name: string, existingThemes: ThemeConfig[]): boolean`

Checks if a theme name is unique.

**Parameters:**
- `name`: Theme name to check
- `existingThemes`: Array of existing themes

**Returns:**
- `true` if unique, `false` if duplicate

## Dependencies

- **colord** (^2.9.3): Lightweight color manipulation library for color validation

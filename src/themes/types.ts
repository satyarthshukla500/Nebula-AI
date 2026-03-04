export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  error: string
  warning: string
}

export interface ThemeAnimation {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: string
  effects: {
    glow: boolean
    gradient: boolean
    float: boolean
    pulse: boolean
  }
}

export interface ThemeTypography {
  fontFamily: string
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
}

export interface Theme {
  name: string
  colors: ThemeColors
  animation: ThemeAnimation
  typography: ThemeTypography
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadow: {
    sm: string
    md: string
    lg: string
  }
}

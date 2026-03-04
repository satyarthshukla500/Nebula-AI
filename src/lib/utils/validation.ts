// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export function validateFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

export function validateFileSize(
  size: number,
  maxSizeMB: number
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

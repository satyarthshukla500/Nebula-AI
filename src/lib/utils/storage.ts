/**
 * Safe localStorage wrapper with error handling and fallback
 */

// In-memory fallback storage
const memoryStorage: Record<string, string> = {}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Get item from localStorage with fallback
 */
export function getItem(key: string): string | null {
  try {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key)
    }
    return memoryStorage[key] || null
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error)
    return memoryStorage[key] || null
  }
}

/**
 * Set item in localStorage with fallback
 */
export function setItem(key: string, value: string): boolean {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value)
      // Also store in memory as backup
      memoryStorage[key] = value
      return true
    }
    // Fallback to memory storage
    memoryStorage[key] = value
    console.warn('localStorage not available, using memory storage')
    return false
  } catch (error) {
    console.error(`Failed to set item in localStorage: ${key}`, error)
    // Fallback to memory storage
    memoryStorage[key] = value
    return false
  }
}

/**
 * Remove item from localStorage with fallback
 */
export function removeItem(key: string): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key)
    }
    delete memoryStorage[key]
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error)
    delete memoryStorage[key]
  }
}

/**
 * Clear all items from localStorage with fallback
 */
export function clear(): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.clear()
    }
    Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key])
  } catch (error) {
    console.warn('Failed to clear localStorage', error)
    Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key])
  }
}

/**
 * Get JSON item from storage
 */
export function getJSON<T>(key: string, defaultValue: T): T {
  try {
    const item = getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to parse JSON from storage: ${key}`, error)
    return defaultValue
  }
}

/**
 * Set JSON item in storage
 */
export function setJSON<T>(key: string, value: T): boolean {
  try {
    return setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to stringify JSON for storage: ${key}`, error)
    return false
  }
}

/**
 * Retry localStorage access after delay
 */
export async function retrySetItem(
  key: string,
  value: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const success = setItem(key, value)
    if (success) return true

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  return false
}

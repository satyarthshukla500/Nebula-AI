/**
 * Browser compatibility detection and fallbacks
 */

export interface BrowserCapabilities {
  canvas: boolean
  requestAnimationFrame: boolean
  webGL: boolean
  localStorage: boolean
  serviceWorker: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  isModernBrowser: boolean
  browserName: string
  browserVersion: string
}

/**
 * Detect browser capabilities
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return {
      canvas: false,
      requestAnimationFrame: false,
      webGL: false,
      localStorage: false,
      serviceWorker: false,
      intersectionObserver: false,
      resizeObserver: false,
      isModernBrowser: false,
      browserName: 'unknown',
      browserVersion: 'unknown',
    }
  }

  const canvas = !!document.createElement('canvas').getContext
  const requestAnimationFrame = 'requestAnimationFrame' in window
  const localStorage = (() => {
    try {
      const test = '__test__'
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  })()

  const webGL = (() => {
    try {
      const canvas = document.createElement('canvas')
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )
    } catch (e) {
      return false
    }
  })()

  const serviceWorker = 'serviceWorker' in navigator
  const intersectionObserver = 'IntersectionObserver' in window
  const resizeObserver = 'ResizeObserver' in window

  const { browserName, browserVersion } = detectBrowser()

  const isModernBrowser =
    canvas &&
    requestAnimationFrame &&
    localStorage &&
    intersectionObserver &&
    !isIE()

  return {
    canvas,
    requestAnimationFrame,
    webGL,
    localStorage,
    serviceWorker,
    intersectionObserver,
    resizeObserver,
    isModernBrowser,
    browserName,
    browserVersion,
  }
}

/**
 * Detect browser name and version
 */
function detectBrowser(): { browserName: string; browserVersion: string } {
  if (typeof window === 'undefined') {
    return { browserName: 'unknown', browserVersion: 'unknown' }
  }

  const ua = navigator.userAgent
  let browserName = 'unknown'
  let browserVersion = 'unknown'

  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'unknown'
  } else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge'
    browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'unknown'
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome'
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'unknown'
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari'
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'unknown'
  } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
    browserName = 'IE'
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || 'unknown'
  }

  return { browserName, browserVersion }
}

/**
 * Check if browser is Internet Explorer
 */
export function isIE(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1
}

/**
 * Check if browser is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * RequestAnimationFrame polyfill
 */
export function getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
  if (typeof window === 'undefined') {
    return (callback) => setTimeout(callback, 16) as unknown as number
  }

  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    ((callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number)
  )
}

/**
 * CancelAnimationFrame polyfill
 */
export function getCancelAnimationFrame(): (handle: number) => void {
  if (typeof window === 'undefined') {
    return (handle) => clearTimeout(handle)
  }

  return (
    window.cancelAnimationFrame ||
    (window as any).webkitCancelAnimationFrame ||
    (window as any).mozCancelAnimationFrame ||
    (window as any).oCancelAnimationFrame ||
    (window as any).msCancelAnimationFrame ||
    clearTimeout
  )
}

/**
 * Show unsupported browser warning
 */
export function showUnsupportedBrowserWarning(): void {
  if (isIE()) {
    const message = `
      Your browser (Internet Explorer) is not supported.
      Please use a modern browser like Chrome, Firefox, Safari, or Edge for the best experience.
    `
    console.warn(message)
    
    // You could also show a UI warning here
    if (typeof document !== 'undefined') {
      const warning = document.createElement('div')
      warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, sans-serif;
      `
      warning.textContent = 'Your browser is not supported. Please use Chrome, Firefox, Safari, or Edge.'
      document.body.appendChild(warning)
    }
  }
}

/**
 * Accessibility utilities and helpers
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  // Find or create live region
  let liveRegion = document.getElementById('screen-reader-announcements')
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'screen-reader-announcements'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', 'status')
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(liveRegion)
  }

  // Update priority if different
  if (liveRegion.getAttribute('aria-live') !== priority) {
    liveRegion.setAttribute('aria-live', priority)
  }

  // Clear and set new message
  liveRegion.textContent = ''
  setTimeout(() => {
    liveRegion!.textContent = message
  }, 100)
}

/**
 * Create focus trap for modal/panel
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  document.addEventListener('keydown', handleTab)

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTab)
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  return Array.from(elements)
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  )
}

/**
 * Get next focusable element
 */
export function getNextFocusableElement(
  current: HTMLElement,
  container: HTMLElement = document.body
): HTMLElement | null {
  const focusable = getFocusableElements(container)
  const currentIndex = focusable.indexOf(current)
  
  if (currentIndex === -1) return null
  
  const nextIndex = (currentIndex + 1) % focusable.length
  return focusable[nextIndex]
}

/**
 * Get previous focusable element
 */
export function getPreviousFocusableElement(
  current: HTMLElement,
  container: HTMLElement = document.body
): HTMLElement | null {
  const focusable = getFocusableElements(container)
  const currentIndex = focusable.indexOf(current)
  
  if (currentIndex === -1) return null
  
  const prevIndex = currentIndex === 0 ? focusable.length - 1 : currentIndex - 1
  return focusable[prevIndex]
}

/**
 * Manage focus restoration
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  save(): void {
    this.previousFocus = document.activeElement as HTMLElement
  }

  restore(): void {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus()
    }
    this.previousFocus = null
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Add skip link to page
 */
export function addSkipLink(targetId: string, text: string = 'Skip to main content'): void {
  if (typeof document === 'undefined') return

  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'skip-link'
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary, #8b5cf6);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    z-index: 10000;
    transition: top 0.2s;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  document.body.insertBefore(skipLink, document.body.firstChild)
}

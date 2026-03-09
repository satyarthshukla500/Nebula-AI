'use client'

import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemePanel from '@/components/ThemePanel'

interface TopBarProps {
  title?: string
  subtitle?: string
  showWave?: boolean
}

export function TopBar({ title = 'Dashboard', subtitle, showWave = true }: TopBarProps) {
  const { user, signOut } = useAuthStore()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showThemePanel, setShowThemePanel] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Scroll-based show/hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.header
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(var(--color-surface-rgb, 26, 26, 46), 0.8)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p 
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Theme Button */}
                <button
                  onClick={() => setShowThemePanel(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  title="Customize theme"
                >
                  🎨
                </button>

                {/* User Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>

                {user?.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/dashboard')}
                  >
                    Admin Panel
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Animated Wave SVG */}
            {showWave && (
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '20px' }}>
                <svg
                  className="absolute bottom-0 w-full"
                  viewBox="0 0 1200 20"
                  preserveAspectRatio="none"
                  style={{ height: '20px' }}
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0.6 }} />
                      <stop offset="50%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0.6 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,10 Q300,0 600,10 T1200,10 L1200,20 L0,20 Z"
                    fill="url(#waveGradient)"
                    className="animate-wave"
                  />
                </svg>
              </div>
            )}
          </motion.header>
        )}
      </AnimatePresence>
      
      <ThemePanel isOpen={showThemePanel} onClose={() => setShowThemePanel(false)} />
    </>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AnimatedBackground from '@/components/AnimatedBackground'
import NebulaBackground from '@/components/NebulaBackground'
import { CursorProvider } from '@/contexts/CursorContext'
import CursorEngine from '@/components/CursorEngine'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nebula AI - Your AI Assistant Platform',
  description: 'Production-grade AI assistant for learning, debugging, wellness, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CursorProvider>
          <div id="c-dot" style={{position:'fixed',pointerEvents:'none',zIndex:99999,transform:'translate(-50%,-50%)'}} />
          <div id="c-ring" style={{position:'fixed',pointerEvents:'none',zIndex:99998,transform:'translate(-50%,-50%)'}} />
          <canvas id="c-canvas" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:99985,display:'none'}} />
          <CursorEngine />
          <NebulaBackground />
          <ThemeProvider>
            <AnimatedBackground />
            <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
              {children}
            </div>
          </ThemeProvider>
        </CursorProvider>
      </body>
    </html>
  )
}

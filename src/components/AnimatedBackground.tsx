'use client'

import { useEffect } from 'react'

export default function AnimatedBackground() {
  useEffect(() => {
    const container = document.getElementById('nebula-particles')
    if (!container) return
    
    function spawn() {
      if (!container) return
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      const duration = Math.random() * 8 + 6
      const left = Math.random() * 100
      p.style.cssText = `
        position:absolute;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:rgba(124,107,255,${Math.random() * 0.5 + 0.2});
        left:${left}%;
        bottom:0px;
        pointer-events:none;
        animation:particleRise ${duration}s linear forwards;
        box-shadow:0 0 ${size * 3}px rgba(124,107,255,0.8);
      `
      container.appendChild(p)
      setTimeout(() => p?.remove(), duration * 1000)
    }
    
    const interval = setInterval(spawn, 350)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Orb 1 */}
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'var(--nebula1, #7c6bff)',
        filter: 'blur(80px)',
        opacity: 0.18,
        top: '-100px', left: '-100px',
        animation: 'orbFloat 10s ease-in-out infinite',
      }} />
      {/* Orb 2 */}
      <div style={{
        position: 'absolute',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'var(--nebula2, #00d4ff)',
        filter: 'blur(80px)',
        opacity: 0.14,
        top: '30%', right: '-80px',
        animation: 'orbFloat 10s ease-in-out infinite',
        animationDelay: '-3s',
      }} />
      {/* Orb 3 */}
      <div style={{
        position: 'absolute',
        width: '350px', height: '350px',
        borderRadius: '50%',
        background: 'var(--nebula3, #ff6b9d)',
        filter: 'blur(80px)',
        opacity: 0.12,
        bottom: '-80px', left: '30%',
        animation: 'orbFloat 10s ease-in-out infinite',
        animationDelay: '-6s',
      }} />
      {/* Grid dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        opacity: 0.5,
      }} />
      {/* Particle container */}
      <div id="nebula-particles" style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}

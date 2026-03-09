'use client'

import { useEffect } from 'react'

export default function NebulaBackground() {
  useEffect(() => {
    const container = document.getElementById('nebula-particles')
    if (!container || (container as any)._started) return;
    (container as any)._started = true
    
    function spawn() {
      if (!container) return
      const p = document.createElement('div')
      const sz = Math.random() * 5 + 2
      const d = Math.random() * 8 + 6
      const cursorColor = '#7c6bff'
      
      p.style.cssText = `position:fixed;width:${sz * 2}px;height:${sz * 2}px;border-radius:50%;background:radial-gradient(circle, white 0%, ${cursorColor || '#7c6bff'} 40%, transparent 70%);left:${Math.random() * 100}%;bottom:0;pointer-events:none;z-index:9999;opacity:0.9;animation:particleRise ${d}s linear forwards;box-shadow:0 0 ${sz * 6}px 2px rgba(124,107,255,1), 0 0 ${sz * 12}px 4px rgba(0,212,255,0.8);`
      
      container.appendChild(p)
      setTimeout(() => p.remove(), d * 1000)
    }
    
    const interval = setInterval(spawn, 150)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <>
      <div id="nebula-orb3" style={{
        position:'fixed',
        width:'350px',
        height:'350px',
        borderRadius:'50%',
        background:'var(--nebula3,#ff6b9d)',
        filter:'blur(80px)',
        opacity:0.13,
        bottom:'-80px',
        left:'30%',
        zIndex:0,
        pointerEvents:'none',
        animation:'orbFloat 10s ease-in-out infinite',
        animationDelay:'-6s'
      }} />
      <div id="nebula-grid" style={{
        position:'fixed',
        inset:0,
        zIndex:0,
        pointerEvents:'none',
        backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize:'36px 36px',
        opacity:0.5
      }} />
      <div id="nebula-particles" style={{
        position:'fixed',
        inset:0,
        zIndex:9,
        pointerEvents:'none',
        overflow:'hidden'
      }} />
    </>
  )
}

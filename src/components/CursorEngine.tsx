'use client'

import { useEffect, useRef } from 'react'
import { useCursor } from '@/contexts/CursorContext'

export default function CursorEngine() {
  const { settings } = useCursor()
  const { cursorType, cursorColor, dotSize, ringSize, trailLength, glowEnabled, selectedEmoji } = settings
  
  const rafRef = useRef<number>()
  const mx = useRef(0), my = useRef(0)
  const rx = useRef(0), ry = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const dot = document.getElementById('c-dot') as HTMLElement
    const ring = document.getElementById('c-ring') as HTMLElement
    const canvas = document.getElementById('c-canvas') as HTMLCanvasElement
    
    if (!dot || !ring || !canvas) return
    
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    // Apply cursor type styles
    dot.innerHTML = ''
    ring.innerHTML = ''
    canvas.style.display = 'none'
    document.body.style.cursor = 'none'
    
    const glow = glowEnabled ? `box-shadow:0 0 12px ${cursorColor}80;` : ''
    
    switch (cursorType) {
      case 'dot-ring':
        dot.style.cssText = `position:fixed;width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:white;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;`
        ring.style.cssText = `position:fixed;width:${ringSize}px;height:${ringSize}px;border:1.5px solid ${cursorColor};border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width 0.35s,height 0.35s;${glow}`
        break
      case 'glow-trail':
        dot.style.cssText = `position:fixed;width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${cursorColor};pointer-events:none;z-index:99999;transform:translate(-50%,-50%);${glow}`
        ring.style.display = 'none'
        break
      case 'magnetic-blob':
        dot.style.display = 'none'
        ring.style.display = 'none'
        canvas.style.display = 'block'
        break
      case 'neon-arrow':
        dot.innerHTML = '➤'
        dot.style.cssText = `position:fixed;font-size:22px;pointer-events:none;z-index:99999;transform:translate(-4px,-4px);color:${cursorColor};filter:drop-shadow(0 0 8px ${cursorColor});`
        ring.style.display = 'none'
        break
      case 'crosshair':
        dot.style.display = 'none'
        ring.innerHTML = `<svg width="32" height="32"><line x1="16" y1="0" x2="16" y2="32" stroke="${cursorColor}" stroke-width="1.5"/><line x1="0" y1="16" x2="32" y2="16" stroke="${cursorColor}" stroke-width="1.5"/><circle cx="16" cy="16" r="4" fill="none" stroke="${cursorColor}" stroke-width="1.5"/></svg>`
        ring.style.cssText = `position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);`
        break
      case 'ripple':
        dot.style.cssText = `position:fixed;width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:white;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);mix-blend-mode:difference;`
        ring.style.cssText = `position:fixed;width:${ringSize}px;height:${ringSize}px;border:1.5px solid ${cursorColor};border-radius:50%;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);${glow}`
        canvas.style.display = 'block'
        break
      case 'spotlight':
        dot.style.display = 'none'
        ring.style.display = 'none'
        canvas.style.display = 'block'
        break
      case 'stardust':
        dot.style.cssText = `position:fixed;width:6px;height:6px;border-radius:50%;background:white;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);`
        ring.style.display = 'none'
        break
      case 'snake':
        dot.style.display = 'none'
        ring.style.display = 'none'
        canvas.style.display = 'block'
        break
      case 'ring-only':
        dot.style.display = 'none'
        ring.style.cssText = `position:fixed;width:${ringSize}px;height:${ringSize}px;border-radius:50%;border:2px solid ${cursorColor};pointer-events:none;z-index:99998;transform:translate(-50%,-50%);${glow}`
        break
      case 'emoji':
        dot.innerHTML = selectedEmoji
        dot.style.cssText = `position:fixed;font-size:22px;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);`
        ring.style.display = 'none'
        break
      case 'default':
        document.body.style.cursor = 'auto'
        dot.style.display = 'none'
        ring.style.display = 'none'
        break
    }

    // Blob points for magnetic
    const blobs = Array.from({length:5},(_,i)=>({x:400,y:300,lag:0.06+i*0.04}))
    
    // Snake points
    const snake: {x:number,y:number}[] = Array(20).fill({x:0,y:0})
    
    let lastTrail = 0, lastStar = 0, isHover = false

    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX; my.current = e.clientY
      
      const dot = document.getElementById('c-dot')!
      dot.style.left = mx.current + 'px'
      dot.style.top = my.current + 'px'

      // Glow trail
      if (cursorType === 'glow-trail') {
        const now = Date.now()
        if (now - lastTrail > 25) {
          lastTrail = now
          const t = document.createElement('div')
          const sz = Math.random()*16+8
          t.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;background:radial-gradient(circle,${cursorColor}99,transparent);pointer-events:none;z-index:99990;left:${e.clientX}px;top:${e.clientY}px;transform:translate(-50%,-50%);animation:trailFade 0.6s ease-out forwards;`
          document.body.appendChild(t)
          setTimeout(()=>t.remove(),650)
        }
      }

      // Stardust
      if (cursorType === 'stardust') {
        const now = Date.now()
        if (now - lastStar > 60) {
          lastStar = now
          const stars = ['✦','✧','·','★','*']
          const colors = [cursorColor,'#ffd700','#ff6b9d','#00d4ff','white']
          const t = document.createElement('div')
          t.textContent = stars[Math.floor(Math.random()*stars.length)]
          const sz = Math.random()*8+8
          t.style.cssText = `position:fixed;font-size:${sz}px;color:${colors[Math.floor(Math.random()*colors.length)]};pointer-events:none;z-index:99990;left:${e.clientX+(Math.random()-0.5)*20}px;top:${e.clientY+(Math.random()-0.5)*20}px;transform:translate(-50%,-50%);animation:trailFade 0.8s ease-out forwards;`
          document.body.appendChild(t)
          setTimeout(()=>t.remove(),900)
        }
      }

      // Snake update
      if (cursorType === 'snake') {
        snake.unshift({x:e.clientX,y:e.clientY})
        snake.splice(trailLength+2)
      }
    }

    // Hover detection
    const addHover = () => {
      document.querySelectorAll('button,a,.card,[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => { isHover = true })
        el.addEventListener('mouseleave', () => { isHover = false })
      })
    }
    setTimeout(addHover, 1000)

    // Ripple on click
    const onClick = (e: MouseEvent) => {
      if (cursorType !== 'ripple') return
      let r = 0
      const iv = setInterval(() => {
        ctx.clearRect(0,0,canvas.width,canvas.height)
        r += 4
        ctx.beginPath(); ctx.arc(e.clientX,e.clientY,r,0,Math.PI*2)
        const alpha = Math.max(0,1-r/80)
        ctx.strokeStyle = `rgba(124,107,255,${alpha})`
        ctx.lineWidth = 2; ctx.stroke()
        if(r>80) clearInterval(iv)
      },16)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('mousemove', onMove)

    // Animation loop
    function animate() {
      const ring = document.getElementById('c-ring')!
      
      rx.current += (mx.current - rx.current) * 0.10
      ry.current += (my.current - ry.current) * 0.10
      
      if (cursorType !== 'crosshair' && cursorType !== 'neon-arrow' && cursorType !== 'emoji' && cursorType !== 'default') {
        ring.style.left = rx.current + 'px'
        ring.style.top = ry.current + 'px'
      }

      // Hover expand ring
      if (cursorType === 'dot-ring' || cursorType === 'ring-only' || cursorType === 'ripple') {
        if (isHover) {
          ring.style.width = (ringSize * 1.6) + 'px'
          ring.style.height = (ringSize * 1.6) + 'px'
          ring.style.background = `${cursorColor}15`
        } else {
          ring.style.width = ringSize + 'px'
          ring.style.height = ringSize + 'px'
          ring.style.background = 'transparent'
        }
      }

      // Blob
      if (cursorType === 'magnetic-blob') {
        ctx.clearRect(0,0,canvas.width,canvas.height)
        blobs.forEach((b,i) => {
          b.x += (mx.current - b.x) * b.lag
          b.y += (my.current - b.y) * b.lag
          
          const grad = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,22-i*3)
          const hex = cursorColor.replace('#','')
          const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), bl = parseInt(hex.slice(4,6),16)
          grad.addColorStop(0,`rgba(${r},${g},${bl},${0.6-i*0.08})`)
          grad.addColorStop(1,'transparent')
          
          ctx.save(); ctx.filter='blur(10px)'; ctx.globalAlpha=0.7
          ctx.beginPath(); ctx.arc(b.x,b.y,22-i*3,0,Math.PI*2)
          ctx.fillStyle=grad; ctx.fill(); ctx.restore()
        })
      }

      // Spotlight
      if (cursorType === 'spotlight') {
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle='rgba(0,0,0,0.6)'
        ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.save()
        ctx.globalCompositeOperation='destination-out'
        ctx.beginPath(); ctx.arc(mx.current,my.current,120,0,Math.PI*2)
        ctx.fillStyle='rgba(0,0,0,1)'; ctx.fill()
        ctx.restore()
      }

      // Snake
      if (cursorType === 'snake') {
        ctx.clearRect(0,0,canvas.width,canvas.height)
        snake.forEach((p,i) => {
          if(!p) return
          const sz = Math.max(1, dotSize - i*0.5)
          const alpha = 1 - i/snake.length
          const hex = cursorColor.replace('#','')
          const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16)
          ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,Math.PI*2)
          ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`
          if(glowEnabled){ctx.shadowColor=cursorColor;ctx.shadowBlur=8}
          ctx.fill(); ctx.shadowBlur=0
        })
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [settings])

  return null
}

'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemePanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme, setTheme } = useTheme()

  function applyCustomColor(prop: string, val: string) {
    document.documentElement.style.setProperty(prop, val)
    if (prop === '--accent') {
      document.documentElement.style.setProperty('--nebula1', val)
      document.documentElement.style.setProperty('--glow', val + '50')
    }
    if (prop === '--accent2') document.documentElement.style.setProperty('--nebula2', val)
    if (prop === '--accent3') document.documentElement.style.setProperty('--nebula3', val)
  }

  function setBgImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const el = document.getElementById('nebula-bg-canvas')
      if (el) el.style.backgroundImage = `url('${ev.target?.result}')`
    }
    reader.readAsDataURL(file)
  }

  function clearBg() {
    const el = document.getElementById('nebula-bg-canvas')
    if (el) el.style.backgroundImage = ''
  }

  function toggleOrbs(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget
    el.classList.toggle('on')
    document.querySelectorAll('.nebula-orb').forEach((o: any) => {
      o.style.display = el.classList.contains('on') ? '' : 'none'
    })
  }

  function toggleParticles(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget
    el.classList.toggle('on')
    const container = document.getElementById('nebula-particles')
    if (container) container.style.display = el.classList.contains('on') ? '' : 'none'
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0,
        right: isOpen ? 0 : '-320px',
        width: '300px', height: '100vh',
        background: 'var(--bg2, #0d1225)',
        borderLeft: '1px solid var(--border, rgba(255,255,255,0.08))',
        zIndex: 1000,
        padding: '24px',
        overflowY: 'auto',
        transition: 'right 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'16px', fontWeight:700, color:'var(--text,#f0f4ff)', margin:0 }}>
            🎨 Custom Theme
          </h3>
          <button onClick={onClose} style={{
            background:'var(--surface,rgba(255,255,255,0.04))',
            border:'1px solid var(--border,rgba(255,255,255,0.08))',
            borderRadius:'8px', padding:'6px 10px', cursor:'pointer',
            color:'var(--text-muted,#8892b0)', fontSize:'13px'
          }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize:'12px', color:'var(--text-muted,#8892b0)', marginBottom:'16px' }}>
          Pick a preset or customize your own colors
        </p>

        {/* Preset buttons */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          {[
            { key:'dark',   label:'🌌 Cosmic' },
            { key:'light',  label:'☀️ Light' },
            { key:'aurora', label:'🌿 Aurora' },
            { key:'sunset', label:'🌅 Sunset' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTheme(key as any)}
              style={{
                fontSize:'12px', padding:'7px 12px',
                background: theme === key ? 'var(--accent,#7c6bff)' : 'var(--surface,rgba(255,255,255,0.04))',
                border:`1px solid ${theme === key ? 'var(--accent,#7c6bff)' : 'var(--border,rgba(255,255,255,0.08))'}`,
                borderRadius:'8px', color:'white', cursor:'pointer',
                transition:'all 0.2s', fontFamily:'DM Sans,sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop:'1px solid var(--border,rgba(255,255,255,0.08))', paddingTop:'16px', marginBottom:'16px' }}>
          <p style={{ fontSize:'12px', color:'var(--text-muted,#8892b0)', marginBottom:'12px' }}>
            Custom Colors
          </p>
          {[
            { label:'Accent Color',    prop:'--accent',  id:'accentColor',  def:'#7c6bff' },
            { label:'Secondary Color', prop:'--accent2', id:'accent2Color', def:'#00d4ff' },
            { label:'Highlight Color', prop:'--accent3', id:'accent3Color', def:'#ff6b9d' },
          ].map(({ label, prop, id, def }) => (
            <div key={id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px', fontSize:'13px', color:'var(--text-muted,#8892b0)' }}>
              {label}
              <input
                type="color"
                id={id}
                defaultValue={def}
                onChange={(e) => applyCustomColor(prop, e.target.value)}
                style={{ width:'32px', height:'26px', border:'1px solid var(--border,rgba(255,255,255,0.1))', borderRadius:'6px', cursor:'pointer', background:'none', padding:'2px' }}
              />
            </div>
          ))}
        </div>

        {/* Background image */}
        <div style={{ borderTop:'1px solid var(--border,rgba(255,255,255,0.08))', paddingTop:'16px', marginBottom:'16px' }}>
          <p style={{ fontSize:'12px', color:'var(--text-muted,#8892b0)', marginBottom:'12px' }}>
            Custom Background Image
          </p>
          <input type="file" id="bgUpload" accept="image/*" style={{ display:'none' }} onChange={setBgImage} />
          <button onClick={() => document.getElementById('bgUpload')?.click()} style={{
            width:'100%', fontSize:'12px', padding:'9px',
            background:'var(--surface,rgba(255,255,255,0.04))',
            border:'1px solid var(--border,rgba(255,255,255,0.08))',
            borderRadius:'8px', color:'var(--text,#f0f4ff)',
            cursor:'pointer', marginBottom:'8px', fontFamily:'DM Sans,sans-serif'
          }}>
            📁 Upload Background Image
          </button>
          <button onClick={clearBg} style={{
            width:'100%', fontSize:'12px', padding:'9px',
            background:'var(--surface,rgba(255,255,255,0.04))',
            border:'1px solid var(--border,rgba(255,255,255,0.08))',
            borderRadius:'8px', color:'var(--text,#f0f4ff)',
            cursor:'pointer', fontFamily:'DM Sans,sans-serif'
          }}>
            ✕ Clear Background
          </button>
        </div>

        {/* Animation toggles */}
        <div style={{ borderTop:'1px solid var(--border,rgba(255,255,255,0.08))', paddingTop:'16px' }}>
          <p style={{ fontSize:'12px', color:'var(--text-muted,#8892b0)', marginBottom:'12px' }}>
            Animations
          </p>
          {['Floating Orbs', 'Particles'].map((label) => (
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px', fontSize:'13px', color:'var(--text-muted,#8892b0)' }}>
              {label}
              <div
                onClick={label === 'Floating Orbs' ? toggleOrbs : toggleParticles}
                className="on"
                style={{
                  width:'40px', height:'22px',
                  background:'var(--accent,#7c6bff)',
                  borderRadius:'20px', cursor:'pointer',
                  position:'relative', transition:'background 0.3s',
                }}
              >
                <div style={{
                  position:'absolute', top:'4px', left:'4px',
                  width:'14px', height:'14px',
                  borderRadius:'50%', background:'white',
                  transition:'transform 0.3s',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

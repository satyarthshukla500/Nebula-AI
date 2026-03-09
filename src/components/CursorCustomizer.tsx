'use client'

import { useCursor } from '@/contexts/CursorContext'

const CURSORS = [
  { type:'dot-ring',      name:'Dot + Ring',      desc:'Classic premium',     icon:'⊙' },
  { type:'glow-trail',    name:'Glow Trail',       desc:'Purple fading trail', icon:'✦' },
  { type:'magnetic-blob', name:'Magnetic Blob',    desc:'Fluid metaball',      icon:'◉' },
  { type:'neon-arrow',    name:'Neon Arrow',       desc:'Glowing arrow',       icon:'➤' },
  { type:'crosshair',     name:'Crosshair',        desc:'Precision target',    icon:'⊕' },
  { type:'ripple',        name:'Ripple',           desc:'Click ripples',       icon:'◎' },
  { type:'spotlight',     name:'Spotlight',        desc:'Dark overlay light',  icon:'☀' },
  { type:'stardust',      name:'Stardust',         desc:'Star sparkles',       icon:'✧' },
  { type:'snake',         name:'Snake',            desc:'Chain of dots',       icon:'〰' },
  { type:'ring-only',     name:'Ring Only',        desc:'Hollow ring',         icon:'○' },
  { type:'emoji',         name:'Emoji',            desc:'Custom emoji',        icon:'🚀' },
  { type:'default',       name:'Default',          desc:'System cursor',       icon:'↖' },
]

export default function CursorCustomizer() {
  const { settings, updateSettings } = useCursor()

  return (
    <div style={{ padding:'24px', color:'var(--text,#f0f4ff)' }}>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:800, marginBottom:'6px' }}>
        🖱️ Cursor Customizer
      </h2>
      <p style={{ fontSize:'13px', color:'var(--text-muted,#8892b0)', marginBottom:'24px' }}>
        Choose your cursor style — move your mouse to preview live
      </p>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' }}>
        {CURSORS.map(c => (
          <div
            key={c.type}
            onClick={() => updateSettings({ cursorType: c.type })}
            style={{
              background: settings.cursorType === c.type
                ? `rgba(124,107,255,0.15)`
                : 'var(--surface,rgba(255,255,255,0.04))',
              border: `1px solid ${settings.cursorType === c.type ? 'var(--accent,#7c6bff)' : 'var(--border,rgba(255,255,255,0.08))'}`,
              borderRadius:'14px', 
              padding:'16px 12px',
              textAlign:'center', 
              cursor:'pointer',
              transition:'all 0.25s', 
              position:'relative',
              boxShadow: settings.cursorType === c.type 
                ? '0 0 0 1px rgba(124,107,255,0.3),0 8px 24px rgba(124,107,255,0.15)' 
                : 'none',
            }}
          >
            {settings.cursorType === c.type && (
              <div style={{ 
                position:'absolute', 
                top:'6px', 
                right:'8px', 
                background:'var(--accent,#7c6bff)', 
                borderRadius:'10px', 
                padding:'1px 7px', 
                fontSize:'9px', 
                color:'white', 
                fontWeight:600 
              }}>
                ✓ Active
              </div>
            )}
            <div style={{ fontSize:'26px', marginBottom:'8px' }}>{c.icon}</div>
            <div style={{ fontSize:'12px', fontWeight:600, marginBottom:'3px' }}>{c.name}</div>
            <div style={{ fontSize:'10px', color:'var(--text-muted,#8892b0)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Customize Panel */}
      <div style={{ 
        background:'var(--surface,rgba(255,255,255,0.04))', 
        border:'1px solid var(--border,rgba(255,255,255,0.08))', 
        borderRadius:'16px', 
        padding:'20px' 
      }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>
          ⚙️ Customize
        </div>

        {[
          { label:'Cursor Size', min:6, max:24, val:settings.dotSize, key:'dotSize' as const },
          { label:'Ring Size',   min:20, max:80, val:settings.ringSize, key:'ringSize' as const },
          { label:'Trail Length',min:3,  max:20, val:settings.trailLength, key:'trailLength' as const },
        ].map(({ label, min, max, val, key }) => (
          <div key={key} style={{ 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'space-between', 
            marginBottom:'14px', 
            fontSize:'13px', 
            color:'var(--text-muted,#8892b0)' 
          }}>
            {label}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <input 
                type="range" 
                min={min} 
                max={max} 
                value={val}
                onChange={e => updateSettings({ [key]: parseInt(e.target.value) } as any)}
                style={{ 
                  width:'140px', 
                  accentColor:'var(--accent,#7c6bff)', 
                  cursor:'pointer' 
                }}
              />
              <span style={{ fontSize:'11px', color:'var(--accent,#7c6bff)', width:'28px' }}>
                {val}
              </span>
            </div>
          </div>
        ))}

        <div style={{ 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'space-between', 
          marginBottom:'14px', 
          fontSize:'13px', 
          color:'var(--text-muted,#8892b0)' 
        }}>
          Cursor Color
          <input 
            type="color" 
            value={settings.cursorColor}
            onChange={e => updateSettings({ cursorColor: e.target.value })}
            style={{ 
              width:'36px', 
              height:'28px', 
              border:'1px solid var(--border)', 
              borderRadius:'6px', 
              cursor:'pointer', 
              background:'none', 
              padding:'2px' 
            }}
          />
        </div>

        <div style={{ 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'space-between', 
          marginBottom:'14px', 
          fontSize:'13px', 
          color:'var(--text-muted,#8892b0)' 
        }}>
          Glow Effect
          <div 
            onClick={() => updateSettings({ glowEnabled: !settings.glowEnabled })}
            style={{ 
              width:'40px', 
              height:'22px', 
              background: settings.glowEnabled ? 'var(--accent,#7c6bff)' : 'rgba(255,255,255,0.1)', 
              borderRadius:'20px', 
              cursor:'pointer', 
              position:'relative', 
              transition:'background 0.3s' 
            }}
          >
            <div style={{ 
              position:'absolute', 
              top:'4px', 
              left: settings.glowEnabled ? '22px' : '4px', 
              width:'14px', 
              height:'14px', 
              borderRadius:'50%', 
              background:'white', 
              transition:'left 0.3s' 
            }} />
          </div>
        </div>

        <div style={{ 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'space-between', 
          fontSize:'13px', 
          color:'var(--text-muted,#8892b0)' 
        }}>
          Emoji Cursor
          <select 
            value={settings.selectedEmoji}
            onChange={e => updateSettings({ selectedEmoji: e.target.value })}
            style={{ 
              background:'var(--surface,rgba(255,255,255,0.05))', 
              border:'1px solid var(--border)', 
              borderRadius:'8px', 
              padding:'4px 10px', 
              color:'var(--text)', 
              fontSize:'16px', 
              cursor:'pointer' 
            }}
          >
            {['🚀','⚡','✨','🔮','🎯','🌟','💜','🤖','🎨','🔥','💎','🌈'].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

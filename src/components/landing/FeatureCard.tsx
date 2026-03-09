'use client'

import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#7c6bff'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(124,107,255,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#8892b0' }}>
        {description}
      </p>
    </div>
  )
}

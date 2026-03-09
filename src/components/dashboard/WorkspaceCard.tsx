'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface WorkspaceCardProps {
  name: string
  description: string
  icon: string
  href: string
  gradient?: [string, string]
  delay?: number
}

export function WorkspaceCard({
  name,
  description,
  icon,
  href,
  gradient,
  delay = 0,
}: WorkspaceCardProps) {
  const router = useRouter()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = (y - centerY) / 10
    const tiltY = (centerX - x) / 10

    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleClick = () => {
    router.push(href)
  }

  const gradientStyle = gradient
    ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
    : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="cursor-pointer rounded-xl p-6 transition-all duration-200"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), var(--shadow-glow)',
      }}
    >
      {/* Icon with Gradient Background */}
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4"
        style={{
          background: gradientStyle,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        {icon}
      </div>

      {/* Workspace Name */}
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
    </motion.div>
  )
}

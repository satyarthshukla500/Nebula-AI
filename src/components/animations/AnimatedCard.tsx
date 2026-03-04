'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Theme } from '@/themes/types'

interface AnimatedCardProps {
  children: ReactNode
  theme: Theme
  className?: string
  delay?: number
}

export function AnimatedCard({ children, theme, className = '', delay = 0 }: AnimatedCardProps) {
  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: theme.animation.duration.normal / 1000,
        delay,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    }
  }

  const hoverVariants = theme.animation.effects.glow 
    ? { scale: 1.02, boxShadow: theme.shadow.lg }
    : { y: -2, boxShadow: theme.shadow.md }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      whileHover={hoverVariants}
      transition={{ duration: theme.animation.duration.fast / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

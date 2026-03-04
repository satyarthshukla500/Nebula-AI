'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function MotionWrapper({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.2 
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideUp({ 
  children, 
  className = '', 
  delay = 0 
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.2 
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

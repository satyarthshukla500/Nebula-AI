'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate sending reset link
    setTimeout(() => {
      setSuccess(true)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: '#060818' }}>
      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Orb 1 */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: '#7c6bff',
          filter: 'blur(80px)',
          opacity: 0.15,
          top: '-100px',
          left: '-100px',
          animation: 'orbFloat 10s ease-in-out infinite'
        }} />
        {/* Orb 2 */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: '#00d4ff',
          filter: 'blur(80px)',
          opacity: 0.12,
          top: '30%',
          right: '-80px',
          animation: 'orbFloat 10s ease-in-out infinite',
          animationDelay: '-3s'
        }} />
        {/* Orb 3 */}
        <div style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: '#ff6b9d',
          filter: 'blur(80px)',
          opacity: 0.10,
          bottom: '-80px',
          left: '30%',
          animation: 'orbFloat 10s ease-in-out infinite',
          animationDelay: '-6s'
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }} />
      </div>

      <div 
        className="w-full max-w-md relative z-10"
        style={{
          background: 'rgba(13,18,37,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: '1px solid #7c6bff',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 0 30px rgba(124,107,255,0.2)'
        }}
      >
        <div className="text-center mb-8">
          <div className="relative w-40 h-28 mx-auto mb-4">
            <Image 
              src="/nebula-logo.png" 
              alt="Nebula AI" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 
            className="text-2xl font-bold mb-1"
            style={{ 
              color: 'white',
              fontFamily: 'Syne, sans-serif'
            }}
          >
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: '#8892b0' }}>
            Enter your email to receive reset instructions
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Reset link sent!</p>
            <p className="text-sm mt-1">Check your email for password reset instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Button type="submit" className="w-full" isLoading={isLoading} style={{
              background: 'linear-gradient(135deg, #7c6bff, #00d4ff)',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              padding: '12px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              Send Reset Link
            </Button>
            
            <div className="text-center text-sm" style={{ color: '#8892b0' }}>
              Remember your password?{' '}
              <Link href="/auth/login" style={{ color: '#7c6bff' }} className="hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

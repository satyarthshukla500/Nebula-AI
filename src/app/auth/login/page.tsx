import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'

export default function LoginPage() {
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
            Welcome to Nebula AI
          </h1>
          <p className="text-sm" style={{ color: '#8892b0' }}>
            Sign in to continue
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}

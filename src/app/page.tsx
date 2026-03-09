import Link from 'next/link'
import Image from 'next/image'
import { AnimatedButton } from '@/components/landing/AnimatedButton'
import { FeatureCard } from '@/components/landing/FeatureCard'

export default function HomePage() {
  return (
    <div className="min-h-screen relative" style={{ background: '#060818' }}>
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
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative w-48 h-32 mx-auto mb-8">
            <Image 
              src="/nebula-logo.png" 
              alt="Nebula AI" 
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 
            className="text-6xl font-bold mb-6"
            style={{
              fontFamily: 'Syne, sans-serif',
              background: 'linear-gradient(135deg, #7c6bff, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Welcome to Nebula AI
          </h1>
          
          <p className="text-xl mb-12" style={{ color: '#8892b0' }}>
            Your comprehensive AI assistant platform for learning, debugging, wellness, and productivity
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link href="/auth/register">
              <AnimatedButton variant="outline">
                Get Started
              </AnimatedButton>
            </Link>
            <Link href="/auth/login">
              <AnimatedButton variant="outline">
                Sign In
              </AnimatedButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon="🚀"
              title="9 Workspaces"
              description="From general chat to cyber safety, all your AI needs in one place"
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Private"
              description="Enterprise-grade security with encrypted wellness logs"
            />
            <FeatureCard
              icon="⚡"
              title="Powered by AWS"
              description="Claude 3, Rekognition, and Transcribe for best-in-class AI"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

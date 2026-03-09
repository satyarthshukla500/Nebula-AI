'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Debug logging
      console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔍 Attempting signup for:', formData.email)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('✅ Signup response:', data)
      console.log('❌ Signup error:', signUpError)

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError('User creation failed - no user returned')
        setIsLoading(false)
        return
      }

      console.log('✅ User created successfully:', data.user.id)
      setSuccess(true)
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        setTimeout(() => {
          setError('')
          setSuccess(false)
          alert('Please check your email to verify your account before logging in.')
          router.push('/auth/login')
        }, 2000)
      } else {
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Registration successful!</p>
        <p className="text-sm mt-1">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
        disabled={isLoading}
        placeholder="John Doe"
      />

      <Input
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        disabled={isLoading}
        placeholder="your@email.com"
      />
      
      <Input
        type="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        disabled={isLoading}
        placeholder="At least 8 characters"
      />

      <Input
        type="password"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
        disabled={isLoading}
        placeholder="Re-enter password"
      />

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading} style={{
        background: 'linear-gradient(135deg, #7c6bff, #00d4ff)',
        borderRadius: '12px',
        fontWeight: '600',
        border: 'none',
        padding: '12px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}>
        Create Account
      </Button>

      <div className="text-center text-sm" style={{ color: '#8892b0' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: '#7c6bff' }} className="hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}

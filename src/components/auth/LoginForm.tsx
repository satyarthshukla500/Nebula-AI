'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      console.log('🔍 Attempting login for:', email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('✅ Login response:', data)
      console.log('❌ Login error:', signInError)

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError('Login failed - no user returned')
        setIsLoading(false)
        return
      }

      console.log('✅ User logged in successfully:', data.user.id)
      router.push('/dashboard')
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
        placeholder="your@email.com"
      />
      
      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        placeholder="Enter your password"
      />

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>

      <div className="text-center text-sm">
        <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}

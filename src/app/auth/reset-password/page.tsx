'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="relative w-40 h-28 mx-auto mb-4">
              <Image 
                src="/nebula-logo.png" 
                alt="Nebula AI" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm text-gray-600 mt-1">Enter your email to receive reset instructions</p>
          </div>
        </CardHeader>
        <CardBody>
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
              
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

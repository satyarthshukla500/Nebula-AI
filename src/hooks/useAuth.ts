'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const { user, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, requireAuth, router])

  return { user, isLoading }
}

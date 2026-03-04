'use client'

import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, signOut } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
        </div>

        <div className="flex items-center space-x-4">
          {user?.role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
            >
              Admin Panel
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

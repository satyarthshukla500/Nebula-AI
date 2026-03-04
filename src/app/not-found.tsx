import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <p className="text-2xl text-gray-600 mt-4 mb-8">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}

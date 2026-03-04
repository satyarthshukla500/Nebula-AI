import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-8" />
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to Nebula AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Your comprehensive AI assistant platform for learning, debugging, wellness, and productivity
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link href="/auth/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">9 Workspaces</h3>
              <p className="text-gray-600 text-sm">
                From general chat to cyber safety, all your AI needs in one place
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade security with encrypted wellness logs
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Powered by AWS</h3>
              <p className="text-gray-600 text-sm">
                Claude 3, Rekognition, and Transcribe for best-in-class AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Nebula AI</h1>
            <p className="text-sm text-gray-600 mt-1">Sign in to continue</p>
          </div>
        </CardHeader>
        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
    </div>
  )
}

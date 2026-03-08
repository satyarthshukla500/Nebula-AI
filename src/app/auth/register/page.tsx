import { RegisterForm } from '@/components/auth/RegisterForm'
import Image from 'next/image'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

export default function RegisterPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-600 mt-1">Join Nebula AI today</p>
          </div>
        </CardHeader>
        <CardBody>
          <RegisterForm />
        </CardBody>
      </Card>
    </div>
  )
}

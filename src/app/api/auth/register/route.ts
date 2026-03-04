// User registration API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validatePassword } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Create user with Supabase
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        requiresEmailVerification: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

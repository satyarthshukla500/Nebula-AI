// Update password API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePassword } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

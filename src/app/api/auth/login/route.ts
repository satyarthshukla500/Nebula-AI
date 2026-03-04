// User login API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    // Check account status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', data.user.id)
      .single()

    if ((profile as any)?.status === 'suspended') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended' },
        { status: 403 }
      )
    }

    if ((profile as any)?.status === 'deleted') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: (profile as any)?.role || 'user',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

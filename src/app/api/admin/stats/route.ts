// Admin - Dashboard statistics
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get statistics
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalSessions },
      { count: totalQuizzes },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('learning_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSessions: totalSessions || 0,
        totalQuizzes: totalQuizzes || 0,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
})

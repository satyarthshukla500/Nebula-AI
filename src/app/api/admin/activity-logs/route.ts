// Admin - View activity logs
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const action = searchParams.get('action')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('activity_logs')
      .select('*, profiles(email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (action) {
      query = query.eq('action', action)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      },
    })
  } catch (error) {
    console.error('Admin activity logs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
})

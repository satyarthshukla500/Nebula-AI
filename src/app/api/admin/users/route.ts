// Admin - List all users
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const profileResult = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Base query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    // Search filter
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%`
      )
    }

    const { data, error, count } = await (query as any)

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
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})

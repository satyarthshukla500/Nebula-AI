// List user uploads
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const workspaceType = searchParams.get('workspace')

    let query = (supabase as any)
      .from('upload_metadata')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (workspaceType) {
      query = query.eq('workspace_type', workspaceType);
    }

    const { data, error } = await query;

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('List uploads error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list uploads' },
      { status: 500 }
    )
  }
})

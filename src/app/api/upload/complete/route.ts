// Mark file upload as complete
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { uploadId } = body

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID is required' },
        { status: 400 }
      )
    }

    // Update upload status
    const { data, error } = await (supabase as any)
      .from('upload_metadata')
      .update({
        status: 'completed',
        upload_progress: 100,
      })
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Upload complete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark upload as complete' },
      { status: 500 }
    )
  }
})

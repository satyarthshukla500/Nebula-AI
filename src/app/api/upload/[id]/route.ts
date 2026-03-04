// Delete upload
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { AuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteFile } from '@/lib/aws/s3'

export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  context: { params: { id: string } }
) => {
  try {
    const supabase = await createClient()

    const uploadId = context.params.id

    // Get upload metadata
    const { data: upload, error: fetchError } = await (supabase as any)
      .from('upload_metadata')
      .select('s3_key')
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single();

    const uploadData = upload as any;

    if (fetchError || !uploadData) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Delete from S3
    await deleteFile(uploadData.s3_key)

    // Delete from database
    const { error: deleteError } = await supabase
      .from('upload_metadata')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Upload deleted successfully',
    })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete upload' },
      { status: 500 }
    )
  }
})

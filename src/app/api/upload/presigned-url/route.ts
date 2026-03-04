// Generate S3 presigned URL for file upload
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generatePresignedUploadUrl, generateS3Key } from '@/lib/aws/s3'
import { validateFileType, validateFileSize } from '@/lib/utils/validation'

const ALLOWED_FILE_TYPES = [
  'jpg', 'jpeg', 'png', 'gif', // Images
  'mp4', 'mov', // Videos
  'pdf', 'docx', 'pptx', 'txt', // Documents
  'zip', // Archives
]

const MAX_FILE_SIZE_MB = 100

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { fileName, fileSize, fileType, workspaceType } = body

    // Validation
    if (!fileName || !fileSize || !fileType || !workspaceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validateFileType(fileName, ALLOWED_FILE_TYPES)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    if (!validateFileSize(fileSize, MAX_FILE_SIZE_MB)) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      )
    }

    // Check upload limit (10 files per workspace)
    const { count } = await (supabase as any)
      .from('upload_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('workspace_type', workspaceType)
      .eq('status', 'completed');

    if (count && count >= 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 files per workspace reached' },
        { status: 400 }
      )
    }

    // Generate S3 key and presigned URL
    const s3Key = generateS3Key(user.id, workspaceType, fileName)
    const presignedUrl = await generatePresignedUploadUrl(s3Key, fileType, 3600)

    // Create upload metadata record
    const { data: uploadRecord, error: dbError } = await (supabase as any)
      .from('upload_metadata')
      .insert({
        user_id: user.id,
        workspace_type: workspaceType,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        s3_key: s3Key,
        s3_url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    const uploadData = uploadRecord as any;

    return NextResponse.json({
      success: true,
      data: {
        uploadId: uploadData.id,
        presignedUrl,
        s3Key,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error('Presigned URL error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
})

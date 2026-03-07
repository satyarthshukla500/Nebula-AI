/**
 * File Upload API Endpoint
 * 
 * Handles direct file uploads with multipart form data.
 * Uses FileUploadService for validation, S3 upload, and metadata storage.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { fileUploadService } from '@/lib/upload/file-service'

/**
 * POST /api/upload/file
 * 
 * Accepts multipart form data with:
 * - file: File buffer
 * - workspace: Workspace type
 * - sessionId: Optional session ID
 * 
 * Returns:
 * - fileId: Unique file identifier
 * - s3Url: Public S3 URL
 * - analysis: Workspace-specific file analysis
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('[Upload API] Processing file upload request')

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const workspace = formData.get('workspace') as string | null
    const sessionId = formData.get('sessionId') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace is required' },
        { status: 400 }
      )
    }

    console.log('[Upload API] File details:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      workspace,
      sessionId: sessionId || 'none'
    })

    // Validate file format and size
    const validation = fileUploadService.validateFile(file.name, file.size)
    if (!validation.valid) {
      console.log('[Upload API] Validation failed:', validation.error)
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('[Upload API] File converted to buffer, uploading...')

    // Upload file using FileUploadService
    const uploadResult = await fileUploadService.uploadFile(
      buffer,
      file.name,
      user.id,
      workspace,
      sessionId || undefined
    )

    console.log('[Upload API] File uploaded successfully:', uploadResult.fileId)

    // Process file based on workspace
    const processingResult = await fileUploadService.processFile(
      uploadResult.fileId,
      workspace
    )

    console.log('[Upload API] File processed:', processingResult.fileId)

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        fileId: uploadResult.fileId,
        s3Url: uploadResult.s3Url,
        s3Key: uploadResult.s3Key,
        fileName: file.name,
        fileSize: file.size,
        workspace,
        analysis: processingResult.analysis,
        metadata: processingResult.metadata,
      },
    })
  } catch (error: any) {
    console.error('[Upload API] Upload failed:', error.message)
    console.error('[Upload API] Error stack:', error.stack)

    // Determine appropriate error response
    if (error.message.includes('File size exceeds')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 413 } // Payload Too Large
      )
    }

    if (error.message.includes('not supported')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 } // Bad Request
      )
    }

    if (error.message.includes('S3') || error.message.includes('upload')) {
      return NextResponse.json(
        { success: false, error: 'File upload to storage failed. Please try again.' },
        { status: 500 } // Internal Server Error
      )
    }

    if (error.message.includes('metadata') || error.message.includes('MongoDB')) {
      return NextResponse.json(
        { success: false, error: 'Failed to save file information. Please try again.' },
        { status: 500 } // Internal Server Error
      )
    }

    // Generic error response
    return NextResponse.json(
      { success: false, error: 'File upload failed. Please try again.' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/upload/file
 * 
 * Get user's uploaded files
 * 
 * Query parameters:
 * - workspace: Optional workspace filter
 * 
 * Returns:
 * - files: Array of file metadata
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const workspace = searchParams.get('workspace')

    console.log('[Upload API] Fetching user files:', {
      userId: user.id,
      workspace: workspace || 'all'
    })

    // Get user files
    const files = await fileUploadService.getUserFiles(
      user.id,
      workspace || undefined
    )

    console.log('[Upload API] Found files:', files.length)

    return NextResponse.json({
      success: true,
      data: {
        files,
        count: files.length
      },
    })
  } catch (error: any) {
    console.error('[Upload API] Failed to fetch files:', error.message)

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve files' },
      { status: 500 }
    )
  }
})

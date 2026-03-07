// API route for uploading and processing documents for RAG
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { storeDocument } from '@/lib/rag'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[RAG Upload] Processing file:', fileName || file.name)
    console.log('[RAG Upload] File size:', file.size)
    console.log('[RAG Upload] File type:', file.type)

    // Read file content
    const text = await file.text()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty or could not be read' },
        { status: 400 }
      )
    }

    console.log('[RAG Upload] Text length:', text.length)

    // Store document with embeddings
    const documentIds = await storeDocument(text, {
      fileName: fileName || file.name,
      metadata: {
        userId: user.id,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    })

    console.log('[RAG Upload] Stored', documentIds.length, 'chunks')

    return NextResponse.json({
      success: true,
      data: {
        fileName: fileName || file.name,
        chunksStored: documentIds.length,
        textLength: text.length,
        documentIds,
      },
    })
  } catch (error: any) {
    console.error('[RAG Upload] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process document' },
      { status: 500 }
    )
  }
})

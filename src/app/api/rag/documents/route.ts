// API route for managing RAG documents
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { listDocuments, deleteDocument, getDocumentStats } from '@/lib/rag'

// GET - List all documents
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (fileName) {
      // Get stats for specific document
      const stats = await getDocumentStats(fileName)
      return NextResponse.json({
        success: true,
        data: { fileName, ...stats },
      })
    } else {
      // List all documents
      const documents = await listDocuments()
      const stats = await getDocumentStats()
      
      return NextResponse.json({
        success: true,
        data: {
          documents,
          stats,
        },
      })
    }
  } catch (error: any) {
    console.error('[RAG Documents] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list documents' },
      { status: 500 }
    )
  }
})

// DELETE - Delete a document
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName parameter is required' },
        { status: 400 }
      )
    }

    const deletedCount = await deleteDocument(fileName)

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        deletedChunks: deletedCount,
      },
    })
  } catch (error: any) {
    console.error('[RAG Documents] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
})

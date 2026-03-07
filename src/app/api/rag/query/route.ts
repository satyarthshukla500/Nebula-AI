// API route for RAG queries
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { retrieveRelevantChunks } from '@/lib/rag'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { query, topK = 5, minSimilarity = 0.5, fileName } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log('[RAG Query] Query:', query)
    console.log('[RAG Query] Options:', { topK, minSimilarity, fileName })

    const chunks = await retrieveRelevantChunks(query, {
      topK,
      minSimilarity,
      fileName,
    })

    return NextResponse.json({
      success: true,
      data: {
        query,
        chunks,
        count: chunks.length,
      },
    })
  } catch (error: any) {
    console.error('[RAG Query] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to query documents' },
      { status: 500 }
    )
  }
})

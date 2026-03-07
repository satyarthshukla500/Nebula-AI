// API route for checking RAG system status
import { NextRequest, NextResponse } from 'next/server'
import { getRAGStatus } from '@/lib/rag'

/**
 * GET /api/rag/status
 * Check if RAG system is available and properly configured
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[RAG Status] Checking RAG system status...')
    
    // Get RAG system status
    const ragStatus = await getRAGStatus()
    
    console.log('[RAG Status] Status retrieved:', ragStatus)
    
    return NextResponse.json({
      success: true,
      ragStatus,
    })
  } catch (error: any) {
    console.error('[RAG Status] Error checking RAG system:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'RAG system check failed',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

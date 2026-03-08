/**
 * GET /api/chat/session/list
 * 
 * Returns list of chat sessions for a user
 * 
 * Requirements: 2.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { chatHistoryService } from '@/lib/chat/history'
import { SessionListItem } from '@/lib/db/schemas/chatSession.schema'

export const dynamic = 'force-dynamic'

interface ListSessionsResponse {
  success: boolean
  data?: {
    sessions: SessionListItem[]
  }
  error?: string
  code?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')
    const limit = searchParams.get('limit')
    
    // Fallback: get userId from JWT if not in query params
    if (!userId) {
      try {
        const authHeader = request.headers.get('authorization')
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '')
          const decoded = JSON.parse(atob(token.split('.')[1]))
          userId = decoded.sub || decoded.id || decoded.userId
          console.log('[Session List] Got userId from JWT:', userId)
        }
      } catch (authError) {
        console.error('[Session List] Failed to decode JWT:', authError)
      }
    }
    
    // If still no userId, return empty array instead of error
    if (!userId) {
      console.warn('[Session List] No userId available, returning empty sessions')
      return NextResponse.json<ListSessionsResponse>(
        {
          success: true,
          data: { sessions: [] }
        },
        { status: 200 }
      )
    }
    
    // Parse limit if provided
    const parsedLimit = limit ? parseInt(limit, 10) : 100
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
      return NextResponse.json<ListSessionsResponse>(
        {
          success: false,
          error: 'limit must be a number between 1 and 1000',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      )
    }
    
    // Get sessions - handle null/empty gracefully
    let sessions: SessionListItem[] = []
    try {
      sessions = await chatHistoryService.getSessionList(userId, parsedLimit)
      // Ensure sessions is always an array
      if (!sessions || !Array.isArray(sessions)) {
        sessions = []
      }
    } catch (serviceError) {
      console.error('Service error getting sessions:', serviceError)
      // Return empty array instead of failing
      sessions = []
    }
    
    return NextResponse.json<ListSessionsResponse>(
      {
        success: true,
        data: { sessions }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('List sessions error:', error)
    
    return NextResponse.json<ListSessionsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sessions',
        code: 'LIST_SESSIONS_ERROR'
      },
      { status: 500 }
    )
  }
}

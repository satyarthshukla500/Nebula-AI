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
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit')
    
    // Validate userId
    if (!userId) {
      return NextResponse.json<ListSessionsResponse>(
        {
          success: false,
          error: 'userId query parameter is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
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
    
    // Get sessions
    const sessions = await chatHistoryService.getSessionList(userId, parsedLimit)
    
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

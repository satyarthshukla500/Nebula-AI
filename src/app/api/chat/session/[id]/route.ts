/**
 * GET /api/chat/session/:id
 * DELETE /api/chat/session/:id
 * 
 * Get or delete a specific chat session with messages
 * 
 * Requirements: 2.3, 2.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { chatHistoryService, SessionWithMessages } from '@/lib/chat/history'

export const dynamic = 'force-dynamic'

interface GetSessionResponse {
  success: boolean
  data?: SessionWithMessages
  error?: string
  code?: string
}

interface DeleteSessionResponse {
  success: boolean
  error?: string
  code?: string
}

/**
 * GET /api/chat/session/:id
 * Returns a session with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    if (!sessionId) {
      return NextResponse.json<GetSessionResponse>(
        {
          success: false,
          error: 'sessionId is required',
          code: 'MISSING_SESSION_ID'
        },
        { status: 400 }
      )
    }
    
    // Get session with messages
    const sessionWithMessages = await chatHistoryService.getSession(sessionId)
    
    if (!sessionWithMessages) {
      return NextResponse.json<GetSessionResponse>(
        {
          success: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json<GetSessionResponse>(
      {
        success: true,
        data: sessionWithMessages
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get session error:', error)
    
    return NextResponse.json<GetSessionResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
        code: 'GET_SESSION_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chat/session/:id
 * Deletes a session and all associated messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!sessionId) {
      return NextResponse.json<DeleteSessionResponse>(
        {
          success: false,
          error: 'sessionId is required',
          code: 'MISSING_SESSION_ID'
        },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json<DeleteSessionResponse>(
        {
          success: false,
          error: 'userId query parameter is required for authorization',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      )
    }
    
    // Delete session (includes authorization check)
    await chatHistoryService.deleteSession(sessionId, userId)
    
    return NextResponse.json<DeleteSessionResponse>(
      {
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete session error:', error)
    
    // Check if it's an authorization error
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
    const isAuthError = errorMessage.includes('not found') || errorMessage.includes('unauthorized')
    
    return NextResponse.json<DeleteSessionResponse>(
      {
        success: false,
        error: errorMessage,
        code: isAuthError ? 'UNAUTHORIZED' : 'DELETE_SESSION_ERROR'
      },
      { status: isAuthError ? 403 : 500 }
    )
  }
}

/**
 * POST /api/chat/session/create
 * 
 * Creates a new chat session with auto-generated title
 * 
 * Requirements: 2.1
 */

import { NextRequest, NextResponse } from 'next/server'
import { chatHistoryService } from '@/lib/chat/history'

export const dynamic = 'force-dynamic'

interface CreateSessionRequest {
  userId: string
  workspace: string
  firstMessage?: string
}

interface CreateSessionResponse {
  success: boolean
  data?: {
    sessionId: string
  }
  error?: string
  code?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json()
    
    // Validate required fields
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json<CreateSessionResponse>(
        {
          success: false,
          error: 'userId is required and must be a string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      )
    }
    
    if (!body.workspace || typeof body.workspace !== 'string') {
      return NextResponse.json<CreateSessionResponse>(
        {
          success: false,
          error: 'workspace is required and must be a string',
          code: 'INVALID_WORKSPACE'
        },
        { status: 400 }
      )
    }
    
    // Use firstMessage or default
    const firstMessage = body.firstMessage || 'New conversation'
    
    // Create session
    const sessionId = await chatHistoryService.createSession(
      body.userId,
      body.workspace,
      firstMessage
    )
    
    return NextResponse.json<CreateSessionResponse>(
      {
        success: true,
        data: { sessionId }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create session error:', error)
    
    return NextResponse.json<CreateSessionResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
        code: 'CREATE_SESSION_ERROR'
      },
      { status: 500 }
    )
  }
}

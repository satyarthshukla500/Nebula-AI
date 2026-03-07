/**
 * POST /api/chat/message
 * 
 * Saves a message to a chat session
 * 
 * Requirements: 2.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { chatHistoryService } from '@/lib/chat/history'

export const dynamic = 'force-dynamic'

interface SaveMessageRequest {
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  userId: string
}

interface SaveMessageResponse {
  success: boolean
  data?: {
    messageId: string
  }
  error?: string
  code?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveMessageRequest = await request.json()
    
    // Validate required fields
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return NextResponse.json<SaveMessageResponse>(
        {
          success: false,
          error: 'sessionId is required and must be a string',
          code: 'INVALID_SESSION_ID'
        },
        { status: 400 }
      )
    }
    
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json<SaveMessageResponse>(
        {
          success: false,
          error: 'userId is required and must be a string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      )
    }
    
    if (!body.role || !['user', 'assistant', 'system'].includes(body.role)) {
      return NextResponse.json<SaveMessageResponse>(
        {
          success: false,
          error: 'role is required and must be one of: user, assistant, system',
          code: 'INVALID_ROLE'
        },
        { status: 400 }
      )
    }
    
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json<SaveMessageResponse>(
        {
          success: false,
          error: 'content is required and must be a string',
          code: 'INVALID_CONTENT'
        },
        { status: 400 }
      )
    }
    
    if (body.content.length > 10240) {
      return NextResponse.json<SaveMessageResponse>(
        {
          success: false,
          error: 'content must not exceed 10KB (10240 characters)',
          code: 'CONTENT_TOO_LARGE'
        },
        { status: 413 }
      )
    }
    
    // Save message
    const messageId = await chatHistoryService.saveMessage(
      body.sessionId,
      body.role,
      body.content,
      body.userId
    )
    
    return NextResponse.json<SaveMessageResponse>(
      {
        success: true,
        data: { messageId }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Save message error:', error)
    
    return NextResponse.json<SaveMessageResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save message',
        code: 'SAVE_MESSAGE_ERROR'
      },
      { status: 500 }
    )
  }
}

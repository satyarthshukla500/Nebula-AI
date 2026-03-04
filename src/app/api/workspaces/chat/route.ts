// General Chat API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse, AIMessage } from '@/lib/ai'
import { getConversationHistoryCollection } from '@/lib/mongodb'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { message, sessionId, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build conversation context
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    // System prompt for general chat
    const systemPrompt = `You are Nebula AI, a helpful assistant for daily life support. You help with:
- Cooking recipes and meal planning
- Gardening tips and plant care
- Cleaning and organization
- Study planning and productivity
- Habit building and personal development
- General knowledge and conversation

Be friendly, practical, and provide actionable advice. Keep responses concise but helpful.`

    // Call AI provider
    const response = await generateAIResponse(messages, systemPrompt)

    // Save to MongoDB conversation history with error handling
    try {
      const conversationCollection = await getConversationHistoryCollection()
      
      const newMessages = [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          role: 'user' as const,
          content: message,
        },
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          role: 'assistant' as const,
          content: response.content,
          metadata: {
            model: 'claude-3-sonnet',
            tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
          },
        },
      ]

      if (sessionId) {
        // Update existing session
        await conversationCollection.updateOne(
          { sessionId },
          {
            $push: { messages: { $each: newMessages } } as any,
            $set: {
              lastMessageAt: new Date(),
              updatedAt: new Date(),
              messageCount: conversationHistory.length + 2,
            },
          }
        )
      } else {
        // Create new session
        const newSessionId = crypto.randomUUID()
        await conversationCollection.insertOne({
          sessionId: newSessionId,
          userId: user.id,
          workspaceType: 'general_chat',
          messages: newMessages,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          startedAt: new Date(),
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          messageCount: 2,
        })
      }
    } catch (mongoError) {
      console.error('MongoDB error (non-critical):', mongoError)
      // Continue even if MongoDB fails - don't block the chat response
    }

    // Save to Supabase learning_sessions
    try {
      const supabase = await createClient()
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: 'general_chat',
        input_content: message,
        output_content: response.content,
        metadata: {
          sessionId,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        },
      } as any)
    } catch (supabaseError) {
      console.error('Supabase error (non-critical):', supabaseError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        sessionId: sessionId || crypto.randomUUID(),
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
})

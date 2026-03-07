// General Chat API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse, AIMessage } from '@/lib/ai'
import { getConversationHistoryCollection } from '@/lib/mongodb'
import { getWorkspaceSystemPrompt } from '@/config/workspaces'
import { saveMessage, isDynamoDBConfigured } from '@/lib/aws/dynamodb'

export const POST = withAuth(async (request: NextRequest, user) => {
  try {

    const body = await request.json()
    const { message, sessionId, conversationHistory = [], workspaceType = 'general_chat' } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Save user message to DynamoDB (primary storage)
    const dynamoDBAvailable = isDynamoDBConfigured()
    if (dynamoDBAvailable) {
      try {
        await saveMessage(user.id, workspaceType, 'user', message)
        console.log('[Chat API] User message saved to DynamoDB')
      } catch (dynamoError) {
        console.error('[Chat API] DynamoDB save failed, will use MongoDB fallback:', dynamoError)
      }
    } else {
      console.log('[Chat API] DynamoDB not configured, using MongoDB only')
    }

    // Build conversation context
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    // Get workspace-specific system prompt
    const systemPrompt = getWorkspaceSystemPrompt(workspaceType)
    
    console.log(`[Chat API] Workspace: ${workspaceType}`)
    console.log(`[Chat API] System prompt: ${systemPrompt.substring(0, 50)}...`)

    // Call AI provider with smart routing based on workspace
    const response = await generateAIResponse(messages, systemPrompt, 4096, 'auto', workspaceType)

    // Save AI response to DynamoDB (primary storage)
    if (dynamoDBAvailable) {
      try {
        await saveMessage(user.id, workspaceType, 'assistant', response.content)
        console.log('[Chat API] AI response saved to DynamoDB')
      } catch (dynamoError) {
        console.error('[Chat API] DynamoDB save failed for AI response:', dynamoError)
      }
    }

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
          workspaceType: workspaceType,
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
        workspace_type: workspaceType,
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
        guardWarning: response.guardWarning,
        suggestedWorkspace: response.suggestedWorkspace,
      },
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    const errorMessage = error.message || 'Failed to process chat message'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
})

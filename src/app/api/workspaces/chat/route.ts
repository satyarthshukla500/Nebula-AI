import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/withAuth'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse, AIMessage } from '@/lib/ai'
import { chatHistoryService } from '@/lib/chat/history'
import { getWorkspaceSystemPrompt } from '@/config/workspaces'
import { saveMessage, isDynamoDBConfigured } from '@/lib/aws/dynamodb'

// Sanitize messages to ensure roles strictly alternate between user and assistant
function sanitizeMessages(messages: AIMessage[]): AIMessage[] {
  const cleaned: AIMessage[] = []
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    
    if (cleaned.length === 0) {
      cleaned.push(msg)
      continue
    }
    
    const lastRole = cleaned[cleaned.length - 1].role
    
    if (msg.role === lastRole) {
      // Found duplicate role - skip or merge
      if (i === messages.length - 1 && msg.role === 'user') {
        // This is the last message (current user message) - replace the previous duplicate
        cleaned[cleaned.length - 1] = msg
      }
      // Otherwise skip duplicate roles
    } else {
      cleaned.push(msg)
    }
  }
  
  return cleaned
}

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // DEBUG: Log user from JWT
    console.log('[Chat API] User from JWT:', {
      id: user.id,
      email: user.email,
      provider: user.provider,
    })

    const body = await request.json()
    
    // DEBUG LOGS
    console.log('API RECEIVED BODY KEYS:', Object.keys(body))
    console.log('API HAS FILE DATA:', !!body.fileData)
    if (body.fileData) {
      console.log('API FILE DATA KEYS:', Object.keys(body.fileData))
      console.log('API FILE DATA TYPE:', body.fileData.type)
      console.log('API FILE DATA BASE64 LENGTH:', body.fileData.base64?.length)
    }
    
    const { message, fileData, sessionId, conversationHistory = [], workspaceType = 'general_chat' } = body

    if (!message && !fileData) {
      return NextResponse.json(
        { success: false, error: 'Message or file is required' },
        { status: 400 }
      )
    }

    // Build AI messages with file support
    let aiMessages: AIMessage[] = []
    
    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      aiMessages.push({
        role: msg.role,
        content: msg.content,
      })
    })
    
    // Add current message with file if provided
    if (fileData) {
      // Handle file upload with base64 - construct Anthropic-compatible content
      const userContent = message || `Describe what you see in this ${fileData.type}.`
      
      if (fileData.type === 'image') {
        // For images, use Anthropic's vision format - content must be an array
        aiMessages.push({
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: fileData.mimeType,
                data: fileData.base64,
              },
            },
            {
              type: 'text',
              text: userContent,
            },
          ] as any,
        })
      } else {
        // For PDFs, CSV, Excel - extract text content first (simplified for now)
        aiMessages.push({
          role: 'user',
          content: `${userContent}\n\nFile: ${fileData.fileName} (${fileData.type})`,
        })
      }
    } else {
      // Regular text message
      aiMessages.push({
        role: 'user',
        content: message,
      })
    }

    // Save user message to DynamoDB (primary storage)
    const dynamoDBAvailable = isDynamoDBConfigured()
    if (dynamoDBAvailable) {
      try {
        const messageContent = fileData 
          ? `${message || 'File upload'} [${fileData.fileName}]`
          : message
        await saveMessage(user.id, workspaceType, 'user', messageContent)
        console.log('[Chat API] User message saved to DynamoDB')
      } catch (dynamoError) {
        console.error('[Chat API] DynamoDB save failed, will use MongoDB fallback:', dynamoError)
      }
    } else {
      console.log('[Chat API] DynamoDB not configured, using MongoDB only')
    }

    // Get workspace-specific system prompt
    const systemPrompt = getWorkspaceSystemPrompt(workspaceType)
    
    console.log(`[Chat API] Workspace: ${workspaceType}`)
    console.log(`[Chat API] System prompt: ${systemPrompt.substring(0, 50)}...`)
    console.log(`[Chat API] Has file: ${!!fileData}`)
    console.log(`[Chat API] Messages before sanitization:`, aiMessages.length)

    // Sanitize messages to ensure roles alternate
    aiMessages = sanitizeMessages(aiMessages)
    console.log(`[Chat API] Messages after sanitization:`, aiMessages.length)

    // Call AI provider with smart routing based on workspace
    const response = await generateAIResponse(aiMessages, systemPrompt, 4096, 'auto', workspaceType)

    console.log('[Chat API] AI Response received:', {
      contentLength: response.content?.length,
      contentPreview: response.content?.substring(0, 100),
      hasContent: !!response.content,
      responseKeys: Object.keys(response),
    })

    // Save AI response to DynamoDB (primary storage)
    if (dynamoDBAvailable) {
      try {
        await saveMessage(user.id, workspaceType, 'assistant', response.content)
        console.log('[Chat API] AI response saved to DynamoDB')
      } catch (dynamoError) {
        console.error('[Chat API] DynamoDB save failed for AI response:', dynamoError)
      }
    }

    // Save to chat history service (MongoDB)
    let newSessionId = sessionId
    try {
      const userMessageContent = fileData 
        ? `${message || 'File upload'} [${fileData.fileName}]`
        : message
      
      // DEBUG: Log save attempt details
      console.log('[History] Attempting save:', {
        userId: user.id,
        sessionId: sessionId,
        newSessionId: newSessionId,
        workspaceType: workspaceType,
        userIdType: typeof user.id,
        sessionIdType: typeof sessionId,
        isUserIdDemo: user.id === 'demo-user-123',
      })
      
      // Create session if it doesn't exist
      if (!sessionId) {
        newSessionId = await chatHistoryService.createSession(
          user.id,
          workspaceType,
          userMessageContent
        )
        console.log('[Chat API] Created new session:', newSessionId)
        console.log('[History] Session created with userId:', user.id)
      }
      
      // Save user message
      console.log('[History] Saving user message to session:', newSessionId)
      await chatHistoryService.saveMessage(
        newSessionId,
        'user',
        userMessageContent,
        user.id
      )
      
      // Save assistant message
      console.log('[History] Saving assistant message to session:', newSessionId)
      await chatHistoryService.saveMessage(
        newSessionId,
        'assistant',
        response.content,
        user.id
      )
      
      console.log('[Chat API] Messages saved to session:', newSessionId)
      console.log('[History] ✅ Save successful - userId:', user.id, 'sessionId:', newSessionId)
    } catch (historyError) {
      console.error('[History] ❌ Save failed:', historyError)
      console.error('Chat history error (non-critical):', historyError)
      // Continue even if history fails - don't block the chat response
      // If session creation failed, generate a sessionId anyway
      if (!newSessionId) {
        newSessionId = crypto.randomUUID()
      }
    }

    // Save to Supabase learning_sessions
    try {
      const supabase = await createClient()
      const userMessageContent = fileData 
        ? `${message || 'File upload'} [${fileData.fileName}]`
        : message
      await (supabase as any).from('learning_sessions').insert({
        user_id: user.id,
        workspace_type: workspaceType,
        input_content: userMessageContent,
        output_content: response.content,
        metadata: {
          sessionId: newSessionId,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
          hasFile: !!fileData,
        },
      } as any)
    } catch (supabaseError) {
      console.error('Supabase error (non-critical):', supabaseError)
    }

    console.log('[Chat API] FINAL RESPONSE TO CLIENT:', {
      success: true,
      messageLength: response.content?.length,
      messagePreview: response.content?.substring(0, 100),
      sessionId: newSessionId,
    })

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        sessionId: newSessionId,
        usage: response.usage,
        guardWarning: response.guardWarning,
        suggestedWorkspace: response.suggestedWorkspace,
        metadata: fileData ? {
          type: `${fileData.type}-analysis`,
          fileName: fileData.fileName,
        } : undefined,
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

// AWS Lambda integration for AI backend
import { AIMessage, AIResponse } from '@/lib/ai'

/**
 * Check if Lambda endpoint is configured
 */
export function isLambdaConfigured(): boolean {
  const configured = !!process.env.NEBULA_LAMBDA_ENDPOINT
  console.log('[Lambda] Configuration check:', {
    configured,
    endpoint: configured ? 'set' : 'not set',
  })
  return configured
}

/**
 * Call AWS Lambda function for AI response
 * 
 * @param message - User message
 * @param systemPrompt - System prompt for AI
 * @param conversationHistory - Previous messages
 * @returns AI response
 */
export async function callLambdaAI(
  message: string,
  systemPrompt?: string,
  conversationHistory: AIMessage[] = []
): Promise<AIResponse> {
  const endpoint = process.env.NEBULA_LAMBDA_ENDPOINT

  if (!endpoint) {
    throw new Error('Lambda endpoint not configured')
  }

  console.log('[Lambda] Calling AI endpoint')
  console.log('[Lambda] Message length:', message.length)
  console.log('[Lambda] System prompt:', systemPrompt ? 'provided' : 'none')
  console.log('[Lambda] History length:', conversationHistory.length)

  try {
    const requestBody = {
      message,
      systemPrompt,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }

    console.log('[Lambda] Sending request to:', endpoint)
    
    const startTime = Date.now()
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const duration = Date.now() - startTime
    console.log('[Lambda] Response received in', duration, 'ms')
    console.log('[Lambda] Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Lambda] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`Lambda request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log('[Lambda] Response data:', {
      hasReply: !!data.reply,
      replyLength: data.reply?.length || 0,
      hasUsage: !!data.usage,
    })

    // Extract reply from Lambda response
    if (!data.reply) {
      console.error('[Lambda] No reply in response:', data)
      throw new Error('Lambda response missing reply field')
    }

    // Return in AIResponse format
    return {
      content: data.reply,
      stopReason: data.stopReason || 'end_turn',
      usage: data.usage || {
        inputTokens: 0,
        outputTokens: 0,
      },
    }
  } catch (error: any) {
    console.error('[Lambda] Request failed:', {
      error: error.message,
      endpoint,
    })
    
    // Re-throw with more context
    throw new Error(`Failed to call Lambda AI: ${error.message}`)
  }
}

/**
 * Get Lambda endpoint URL
 */
export function getLambdaEndpoint(): string | undefined {
  return process.env.NEBULA_LAMBDA_ENDPOINT
}

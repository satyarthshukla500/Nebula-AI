// Groq AI Provider Integration
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GroqResponse {
  content: string
  stopReason?: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Generate AI response using Groq
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to guide the AI
 * @param maxTokens - Maximum tokens to generate (default: 4096)
 * @returns AI response with generated content
 */
export async function generateGroqResponse(
  messages: GroqMessage[],
  systemPrompt?: string,
  maxTokens: number = 4096
): Promise<GroqResponse> {
  console.log('[Groq] Generating response')
  console.log('[Groq] Messages count:', messages.length)
  console.log('[Groq] System prompt:', systemPrompt ? 'provided' : 'none')
  
  try {
    // Build messages array with system prompt if provided
    const groqMessages: any[] = []
    
    if (systemPrompt) {
      groqMessages.push({
        role: 'system',
        content: systemPrompt,
      })
    }
    
    // Add conversation messages
    groqMessages.push(...messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })))

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    const choice = completion.choices[0]
    
    console.log('[Groq] Response received successfully')
    console.log('[Groq] Tokens used:', {
      input: completion.usage?.prompt_tokens || 0,
      output: completion.usage?.completion_tokens || 0
    })
    
    return {
      content: choice.message.content || '',
      stopReason: choice.finish_reason || undefined,
      usage: {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
      },
    }
  } catch (error: any) {
    console.error('[Groq] API error:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
    throw new Error(`Failed to generate response from Groq: ${error.message}`)
  }
}

/**
 * Check if Groq is configured
 */
export function isGroqConfigured(): boolean {
  const configured = !!process.env.GROQ_API_KEY
  console.log('[AI Config] Groq check:', {
    configured,
    keyPresent: configured ? 'yes' : 'no'
  })
  return configured
}

/**
 * Generate streaming AI response using Groq
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt
 * @param onChunk - Callback for each chunk of generated text
 */
export async function generateGroqResponseStream(
  messages: GroqMessage[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const groqMessages: any[] = []
    
    if (systemPrompt) {
      groqMessages.push({
        role: 'system',
        content: systemPrompt,
      })
    }
    
    groqMessages.push(...messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })))

    const stream = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
    })

    let fullContent = ''
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content && onChunk) {
        onChunk(content)
      }
      fullContent += content
    }

    return fullContent
  } catch (error) {
    console.error('Groq streaming error:', error)
    throw new Error('Failed to stream response from Groq')
  }
}

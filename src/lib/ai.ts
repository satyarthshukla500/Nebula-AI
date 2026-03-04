// AI Provider Abstraction Layer
// This module provides a unified interface for AI operations
// Currently configured for Groq (pending API key)

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  stopReason?: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Generate AI response from messages
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to guide the AI
 * @param maxTokens - Maximum tokens to generate (default: 4096)
 * @returns AI response with generated content
 * 
 * TODO: Integrate with Groq API
 * - Install: npm install groq-sdk
 * - Add GROQ_API_KEY to .env.local
 * - Implement actual Groq API calls
 */
export async function generateAIResponse(
  messages: AIMessage[],
  systemPrompt?: string,
  maxTokens: number = 4096
): Promise<AIResponse> {
  // Placeholder response until Groq is configured
  console.log('[AI] Groq integration pending. Messages:', messages.length)
  
  return {
    content: "AI provider not yet configured. Please add GROQ_API_KEY to enable AI features.",
    stopReason: 'placeholder',
    usage: {
      inputTokens: 0,
      outputTokens: 0,
    },
  }
}

/**
 * Generate streaming AI response
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt
 * @param onChunk - Callback for each chunk of generated text
 * 
 * TODO: Implement streaming with Groq
 */
export async function generateAIResponseStream(
  messages: AIMessage[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<void> {
  // Placeholder for streaming
  console.log('[AI] Streaming not yet implemented')
  
  if (onChunk) {
    onChunk("AI streaming not yet configured. Please add GROQ_API_KEY to enable this feature.")
  }
}

/**
 * Helper to convert legacy Bedrock message format to AI message format
 */
export function convertToAIMessages(messages: any[]): AIMessage[] {
  return messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }))
}

// AI Provider Abstraction Layer
// This module provides a unified interface for AI operations
// Supports multiple providers: AWS Lambda (primary) → AWS Bedrock → Groq (fallback)
// Includes RAG (Retrieval Augmented Generation) support
// Includes smart routing based on workspace and input characteristics

import { invokeClaude, invokeClaudeStream } from './aws/bedrock'
import { generateGroqResponse, generateGroqResponseStream, isGroqConfigured } from './ai/groqProvider'
import { callLambdaAI, isLambdaConfigured } from './aws/lambda'
import { buildRAGMessages, isRAGAvailable, shouldUseRAG, RAGContext } from './rag'
import { routeRequest, getRoutingDecision, type AIProvider } from './ai/aiRouter'
import { invokeSageMaker, isSageMakerConfigured } from './ai/sagemakerProvider'
import { workspaceGuard, type WorkspaceType } from './ai/workspace-guard'

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
  ragContext?: RAGContext | null
  guardWarning?: boolean
  suggestedWorkspace?: WorkspaceType
}

/**
 * Check if AWS Bedrock is configured
 */
function isBedrockConfigured(): boolean {
  const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID
  const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY
  const hasModelId = !!process.env.AWS_BEDROCK_MODEL_ID
  
  const configured = hasAccessKey && hasSecretKey && hasModelId
  
  console.log('[AI Config] Bedrock check:', {
    hasAccessKey,
    hasSecretKey,
    hasModelId,
    configured,
    modelId: process.env.AWS_BEDROCK_MODEL_ID || 'not set'
  })
  
  return configured
}

/**
 * Get the active AI provider with optional smart routing
 * 
 * @param input - Optional user input for smart routing
 * @param workspace - Optional workspace type for smart routing
 * @returns Active provider based on configuration and routing logic
 */
function getActiveProvider(input?: string, workspace?: string): 'lambda' | 'bedrock' | 'groq' | 'none' {
  const lambdaConfigured = isLambdaConfigured()
  const bedrockConfigured = isBedrockConfigured()
  const groqConfigured = isGroqConfigured()
  
  console.log('[AI Config] Provider check:', {
    lambda: lambdaConfigured,
    bedrock: bedrockConfigured,
    groq: groqConfigured
  })
  
  // If smart routing parameters provided, use routing logic
  if (input !== undefined && workspace !== undefined) {
    const routingDecision = getRoutingDecision({ prompt: input, workspace })
    const preferredProvider = routingDecision.provider
    
    console.log('[AI Router] Smart routing decision:', {
      workspace,
      inputLength: input.length,
      preferredProvider,
      reason: routingDecision.reason
    })
    
    // Map routing result to available providers with fallback logic
    if (preferredProvider === 'sagemaker' || preferredProvider === 'lambda') {
      // SageMaker uses Lambda backend
      if (lambdaConfigured) {
        console.log('[AI Config] Selected provider: AWS Lambda (SageMaker backend)')
        return 'lambda'
      }
      // Fallback to Bedrock if Lambda not available
      if (bedrockConfigured) {
        console.log('[AI Config] Lambda not available, falling back to Bedrock')
        return 'bedrock'
      }
    }
    
    if (preferredProvider === 'groq') {
      if (groqConfigured) {
        console.log('[AI Config] Selected provider: Groq (fast response)')
        return 'groq'
      }
      // Fallback to Bedrock if Groq not available
      if (bedrockConfigured) {
        console.log('[AI Config] Groq not available, falling back to Bedrock')
        return 'bedrock'
      }
      // Fallback to Lambda if Bedrock not available
      if (lambdaConfigured) {
        console.log('[AI Config] Groq/Bedrock not available, falling back to Lambda')
        return 'lambda'
      }
    }
    
    if (preferredProvider === 'bedrock') {
      if (bedrockConfigured) {
        console.log('[AI Config] Selected provider: AWS Bedrock (high quality)')
        return 'bedrock'
      }
      // Fallback to Lambda if Bedrock not available
      if (lambdaConfigured) {
        console.log('[AI Config] Bedrock not available, falling back to Lambda')
        return 'lambda'
      }
      // Fallback to Groq if Lambda not available
      if (groqConfigured) {
        console.log('[AI Config] Bedrock/Lambda not available, falling back to Groq')
        return 'groq'
      }
    }
  }
  
  // Default provider selection (no smart routing)
  if (lambdaConfigured) {
    console.log('[AI Config] Selected provider: AWS Lambda (default)')
    return 'lambda'
  }
  if (bedrockConfigured) {
    console.log('[AI Config] Selected provider: AWS Bedrock (default)')
    return 'bedrock'
  }
  if (groqConfigured) {
    console.log('[AI Config] Selected provider: Groq (default)')
    return 'groq'
  }
  
  console.log('[AI Config] No provider configured')
  return 'none'
}

/**
 * Generate AI response from messages with automatic provider fallback
 * 
 * Priority: AWS Lambda → AWS Bedrock (Claude Sonnet) → Groq (Llama3) → Error
 * Includes RAG support for document-based queries
 * Includes smart routing based on workspace and input characteristics
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to guide the AI
 * @param maxTokens - Maximum tokens to generate (default: 4096)
 * @param useRAG - Whether to use RAG for this query (default: auto-detect)
 * @param workspace - Optional workspace type for smart routing
 * @returns AI response with generated content
 */
export async function generateAIResponse(
  messages: AIMessage[],
  systemPrompt?: string,
  maxTokens: number = 4096,
  useRAG: boolean | 'auto' = 'auto',
  workspace?: string
): Promise<AIResponse> {
  console.log('[AI] ========== AI Request Start ==========')
  console.log('[AI] Messages:', messages.length)
  console.log('[AI] System prompt:', systemPrompt ? 'provided' : 'none')
  console.log('[AI] Max tokens:', maxTokens)
  console.log('[AI] RAG mode:', useRAG)
  console.log('[AI] Workspace:', workspace || 'not specified')
  
  // Workspace Guard Check
  if (workspace) {
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage?.role === 'user') {
      console.log('[AI] ===== Checking Workspace Guard =====')
      const guardResult = workspaceGuard.checkMessage(lastUserMessage.content, workspace as WorkspaceType)
      
      if (!guardResult.allowed) {
        console.log('[AI] ===== Workspace Guard Blocked =====')
        console.log('[AI] Message:', guardResult.message)
        console.log('[AI] Suggested workspace:', guardResult.suggestedWorkspace)
        console.log('[AI] ========== AI Request End (Blocked by Guard) ==========')
        
        return {
          content: guardResult.message || 'This action is not available in the current workspace.',
          stopReason: 'workspace_guard',
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
          ragContext: null,
          guardWarning: true,
          suggestedWorkspace: guardResult.suggestedWorkspace,
        }
      }
      
      console.log('[AI] ===== Workspace Guard Passed =====')
    }
  }
  
  let ragContext: RAGContext | null = null
  let enhancedMessages = messages
  
  // Check if we should use RAG
  const lastUserMessage = messages[messages.length - 1]
  const shouldApplyRAG = useRAG === true || 
    (useRAG === 'auto' && lastUserMessage?.role === 'user' && shouldUseRAG(lastUserMessage.content))
  
  if (shouldApplyRAG) {
    try {
      const ragAvailable = await isRAGAvailable()
      
      if (ragAvailable && lastUserMessage?.role === 'user') {
        console.log('[AI] ===== Applying RAG =====')
        
        const { messages: ragMessages, context } = await buildRAGMessages(
          lastUserMessage.content,
          {
            topK: 5,
            minSimilarity: 0.5,
            includeContext: true,
          }
        )
        
        if (context && context.chunks.length > 0) {
          // Replace last user message with RAG-enhanced version
          enhancedMessages = [
            ...messages.slice(0, -1),
            ...ragMessages,
          ]
          ragContext = context
          
          console.log('[AI] RAG context added:', context.chunks.length, 'chunks')
          console.log('[AI] Sources:', context.sources.join(', '))
        } else {
          console.log('[AI] No relevant RAG context found')
        }
      } else {
        console.log('[AI] RAG not available or not applicable')
      }
    } catch (error: any) {
      console.error('[AI] RAG error (continuing without RAG):', error.message)
    }
  }
  
  // Use smart routing if workspace provided
  const userInput = lastUserMessage?.content || ''
  const provider = workspace 
    ? getActiveProvider(userInput, workspace)
    : getActiveProvider()
  
  console.log('[AI] Active provider:', provider)

  // Try SageMaker if router selected it (for Debug workspace)
  if (provider === 'lambda' && workspace === 'debug' && isSageMakerConfigured()) {
    try {
      console.log('[AI] ===== Using AWS SageMaker (Debug Workspace) =====')
      
      const sagemakerResponse = await invokeSageMaker(userInput)
      
      console.log('[AI] ===== SageMaker Success =====')
      console.log('[AI] Response length:', sagemakerResponse.length)
      console.log('[AI] ========== AI Request End ==========')
      
      return {
        content: sagemakerResponse,
        stopReason: 'end_turn',
        usage: {
          inputTokens: userInput.length,
          outputTokens: sagemakerResponse.length,
        },
        ragContext,
      }
    } catch (error: any) {
      console.error('[AI] ===== SageMaker Failed =====')
      console.error('[AI] Error:', error.message)
      console.log('[AI] Falling back to Lambda/Bedrock')
      // Continue to Lambda fallback below
    }
  }

  // Try AWS Lambda first (primary provider)
  if (provider === 'lambda') {
    try {
      console.log('[AI] ===== Using AWS Lambda Backend =====')
      
      // Get the last user message (potentially RAG-enhanced)
      const userMessage = enhancedMessages[enhancedMessages.length - 1]?.content || ''
      
      // Get conversation history (exclude the last message as it's sent separately)
      const conversationHistory = enhancedMessages.slice(0, -1)
      
      const response = await callLambdaAI(userMessage, systemPrompt, conversationHistory)
      
      console.log('[AI] ===== Lambda Success =====')
      console.log('[AI] Response length:', response.content.length)
      console.log('[AI] ========== AI Request End ==========')
      
      return {
        ...response,
        ragContext,
      }
    } catch (error: any) {
      console.error('[AI] ===== Lambda Failed =====')
      console.error('[AI] Error:', error.message)
      
      // If Lambda fails and Bedrock is available, fall back to Bedrock
      if (isBedrockConfigured()) {
        try {
          console.log('[AI] ===== Falling back to AWS Bedrock =====')
          
          const bedrockMessages = enhancedMessages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            }))

          const response = await invokeClaude(bedrockMessages, systemPrompt, maxTokens)
          
          console.log('[AI] ===== Bedrock Fallback Success =====')
          console.log('[AI] ========== AI Request End ==========')
          
          return {
            content: response.content,
            stopReason: response.stopReason,
            usage: {
              inputTokens: response.usage.inputTokens,
              outputTokens: response.usage.outputTokens,
            },
            ragContext,
          }
        } catch (bedrockError: any) {
          console.error('[AI] ===== Bedrock Fallback Failed =====')
          console.error('[AI] Error:', bedrockError.message)
          
          // Try Groq as last resort
          if (isGroqConfigured()) {
            try {
              console.log('[AI] ===== Falling back to Groq =====')
              const groqResponse = await generateGroqResponse(enhancedMessages, systemPrompt, maxTokens)
              console.log('[AI] ===== Groq Fallback Success =====')
              console.log('[AI] ========== AI Request End ==========')
              return {
                ...groqResponse,
                ragContext,
              }
            } catch (groqError: any) {
              console.error('[AI] ===== Groq Fallback Failed =====')
              console.error('[AI] Error:', groqError.message)
            }
          }
        }
      } else if (isGroqConfigured()) {
        // If Bedrock not configured but Groq is, try Groq
        try {
          console.log('[AI] ===== Falling back to Groq =====')
          const groqResponse = await generateGroqResponse(enhancedMessages, systemPrompt, maxTokens)
          console.log('[AI] ===== Groq Fallback Success =====')
          console.log('[AI] ========== AI Request End ==========')
          return {
            ...groqResponse,
            ragContext,
          }
        } catch (groqError: any) {
          console.error('[AI] ===== Groq Fallback Failed =====')
          console.error('[AI] Error:', groqError.message)
        }
      }
      
      console.log('[AI] ========== AI Request End (Failed) ==========')
      throw new Error('All AI providers failed')
    }
  }

  // Try AWS Bedrock if Lambda not configured (legacy path)
  if (provider === 'bedrock') {
    try {
      console.log('[AI] ===== Using AWS Bedrock (Claude 3.5 Sonnet) =====')
      
      // Filter out system messages for Bedrock (it uses separate system param)
      const bedrockMessages = enhancedMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      const response = await invokeClaude(bedrockMessages, systemPrompt, maxTokens)
      
      console.log('[AI] ===== Bedrock Success =====')
      console.log('[AI] Response length:', response.content.length)
      console.log('[AI] ========== AI Request End ==========')
      
      return {
        content: response.content,
        stopReason: response.stopReason,
        usage: {
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        },
        ragContext,
      }
    } catch (error: any) {
      console.error('[AI] ===== Bedrock Failed =====')
      console.error('[AI] Error:', error.message)
      
      // If Bedrock fails and Groq is available, fall back to Groq
      if (isGroqConfigured()) {
        try {
          console.log('[AI] ===== Falling back to Groq (Llama3) =====')
          const groqResponse = await generateGroqResponse(enhancedMessages, systemPrompt, maxTokens)
          console.log('[AI] ===== Groq Fallback Success =====')
          console.log('[AI] ========== AI Request End ==========')
          return {
            ...groqResponse,
            ragContext,
          }
        } catch (groqError: any) {
          console.error('[AI] ===== Groq Fallback Failed =====')
          console.error('[AI] Error:', groqError.message)
          console.log('[AI] ========== AI Request End (Failed) ==========')
          throw new Error('All AI providers failed')
        }
      }
      
      console.log('[AI] ========== AI Request End (Failed) ==========')
      throw error
    }
  }

  // Use Groq if neither Lambda nor Bedrock is configured
  if (provider === 'groq') {
    try {
      console.log('[AI] ===== Using Groq (Llama3) =====')
      const response = await generateGroqResponse(enhancedMessages, systemPrompt, maxTokens)
      console.log('[AI] ===== Groq Success =====')
      console.log('[AI] Response length:', response.content.length)
      console.log('[AI] ========== AI Request End ==========')
      return {
        ...response,
        ragContext,
      }
    } catch (error: any) {
      console.error('[AI] ===== Groq Failed =====')
      console.error('[AI] Error:', error.message)
      console.log('[AI] ========== AI Request End (Failed) ==========')
      throw new Error(`Failed to generate AI response from Groq: ${error.message}`)
    }
  }

  // No provider configured
  console.error('[AI] ===== No Provider Configured =====')
  console.log('[AI] ========== AI Request End (Not Configured) ==========')
  return {
    content: "AI provider not configured. Please add AWS Lambda endpoint, AWS Bedrock credentials, or GROQ_API_KEY to enable AI features.",
    stopReason: 'not_configured',
    usage: {
      inputTokens: 0,
      outputTokens: 0,
    },
    ragContext: null,
  }
}

/**
 * Generate streaming AI response with automatic provider fallback
 * 
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt
 * @param onChunk - Callback for each chunk of generated text
 */
export async function generateAIResponseStream(
  messages: AIMessage[],
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<void> {
  const provider = getActiveProvider()

  // Try AWS Bedrock first
  if (provider === 'bedrock') {
    try {
      console.log('[AI] Streaming with AWS Bedrock')
      
      const bedrockMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      await invokeClaudeStream(bedrockMessages, systemPrompt, onChunk)
      return
    } catch (error) {
      console.error('[AI] Bedrock streaming failed, trying Groq:', error)
      
      if (isGroqConfigured()) {
        try {
          console.log('[AI] Falling back to Groq streaming')
          await generateGroqResponseStream(messages, systemPrompt, onChunk)
          return
        } catch (groqError) {
          console.error('[AI] Groq streaming also failed:', groqError)
          throw new Error('All AI streaming providers failed')
        }
      }
      
      throw error
    }
  }

  // Use Groq if Bedrock is not configured
  if (provider === 'groq') {
    try {
      console.log('[AI] Streaming with Groq')
      await generateGroqResponseStream(messages, systemPrompt, onChunk)
      return
    } catch (error) {
      console.error('[AI] Groq streaming error:', error)
      throw new Error('Failed to stream AI response from Groq')
    }
  }

  // No provider configured
  if (onChunk) {
    onChunk("AI provider not configured. Please add AWS Bedrock credentials or GROQ_API_KEY to enable AI features.")
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

/**
 * Get information about the currently active AI provider
 */
export function getProviderInfo(): {
  provider: 'bedrock' | 'groq' | 'none'
  model: string
  configured: boolean
} {
  const provider = getActiveProvider()
  
  if (provider === 'bedrock') {
    return {
      provider: 'bedrock',
      model: process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      configured: true,
    }
  }
  
  if (provider === 'groq') {
    return {
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
      configured: true,
    }
  }
  
  return {
    provider: 'none',
    model: 'none',
    configured: false,
  }
}

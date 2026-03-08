/**
 * AI Router - Smart routing logic for AI provider selection
 * Routes requests to optimal AI provider based on workspace and input characteristics
 */

export type AIProvider = 'bedrock' | 'sagemaker' | 'groq' | 'lambda'

export interface RoutingContext {
  prompt: string
  workspace: string
  inputLength?: number
}

/**
 * Route AI request to optimal provider based on workspace and input
 * 
 * Routing Rules:
 * - Debug Workspace → SageMaker (specialized debugging capabilities)
 * - Smart Summarizer → Bedrock (high-quality summarization)
 * - Explain Assist → Bedrock (detailed explanations)
 * - General Chat (short prompts < 150 chars) → Groq (fast responses)
 * - General Chat (long prompts) → Bedrock (quality responses)
 * - Default → Bedrock (balanced quality)
 * 
 * @param prompt - User input message
 * @param workspace - Current workspace type
 * @returns Preferred AI provider for this request
 */
export function routeRequest(prompt: string, workspace: string): AIProvider {
  const safeWorkspace = typeof workspace === 'string' ? workspace : ''
  const normalizedWorkspace = safeWorkspace.toLowerCase().trim()
  const inputLength = typeof prompt === 'string' ? prompt.length : 0
  
  // Debug workspace uses SageMaker for specialized debugging
  if (normalizedWorkspace === 'debug' || normalizedWorkspace === 'debug workspace') {
    return 'sagemaker'
  }
  
  // Summarizer workspace uses Bedrock for high-quality summaries
  if (normalizedWorkspace === 'summarizer' || normalizedWorkspace === 'smart summarizer') {
    return 'bedrock'
  }
  
  // Explain workspace uses Bedrock for detailed explanations
  if (normalizedWorkspace === 'explain' || normalizedWorkspace === 'explain assist') {
    return 'bedrock'
  }
  
  // General chat uses Groq for short prompts (fast), Bedrock for longer prompts (quality)
  if (normalizedWorkspace === 'chat' || normalizedWorkspace === 'general chat' || normalizedWorkspace === 'general_chat') {
    if (inputLength < 150) {
      return 'groq'
    }
    return 'bedrock'
  }
  
  // Default to Bedrock for all other workspaces
  return 'bedrock'
}

/**
 * Get routing decision with detailed context
 * Useful for logging and debugging routing decisions
 * 
 * @param context - Routing context with prompt and workspace
 * @returns Provider and reasoning for the routing decision
 */
export function getRoutingDecision(context: RoutingContext): {
  provider: AIProvider
  reason: string
} {
  const { prompt, workspace } = context
  const safeWorkspace = typeof workspace === 'string' ? workspace : ''
  const normalizedWorkspace = safeWorkspace.toLowerCase().trim()
  const inputLength = typeof prompt === 'string' ? prompt.length : 0
  
  if (normalizedWorkspace === 'debug' || normalizedWorkspace === 'debug workspace') {
    return {
      provider: 'sagemaker',
      reason: 'Debug workspace requires SageMaker for specialized debugging capabilities'
    }
  }
  
  if (normalizedWorkspace === 'summarizer' || normalizedWorkspace === 'smart summarizer') {
    return {
      provider: 'bedrock',
      reason: 'Summarizer workspace uses Bedrock for high-quality summarization'
    }
  }
  
  if (normalizedWorkspace === 'explain' || normalizedWorkspace === 'explain assist') {
    return {
      provider: 'bedrock',
      reason: 'Explain workspace uses Bedrock for detailed explanations'
    }
  }
  
  if (normalizedWorkspace === 'chat' || normalizedWorkspace === 'general chat' || normalizedWorkspace === 'general_chat') {
    if (inputLength < 150) {
      return {
        provider: 'groq',
        reason: `Short prompt (${inputLength} chars) uses Groq for fast response`
      }
    }
    return {
      provider: 'bedrock',
      reason: `Long prompt (${inputLength} chars) uses Bedrock for quality response`
    }
  }
  
  return {
    provider: 'bedrock',
    reason: 'Default provider for balanced quality'
  }
}

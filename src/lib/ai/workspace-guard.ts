/**
 * Workspace Guard
 * 
 * Enforces workspace-specific behavior rules and provides helpful guidance
 * when users attempt actions incompatible with their current workspace.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.5
 */

export type WorkspaceType = 
  | 'general-chat'
  | 'debug-workspace'
  | 'explain-assist'
  | 'smart-summarizer'
  | 'rag-assistant'
  | 'voice-assistant'
  | 'image-analyzer'
  | 'code-reviewer'
  | 'data-analyst'
  | 'creative-writer'

export interface WorkspaceRule {
  workspace: WorkspaceType
  allowedActions: string[]
  restrictedActions: string[]
  description: string
}

export interface GuardResult {
  allowed: boolean
  message?: string
  suggestedWorkspace?: WorkspaceType
}

/**
 * Workspace Guard Class
 * 
 * Analyzes user messages and enforces workspace-specific behavior rules
 */
export class WorkspaceGuard {
  private rules: Map<WorkspaceType, WorkspaceRule>

  constructor() {
    this.rules = new Map()
    this.initializeRules()
  }

  /**
   * Initialize workspace rules
   */
  private initializeRules(): void {
    // General Chat - Conversation only
    this.rules.set('general-chat', {
      workspace: 'general-chat',
      allowedActions: ['conversation', 'questions', 'general-help', 'chat'],
      restrictedActions: ['debugging', 'code-execution', 'summarization', 'code-analysis'],
      description: 'General conversation and questions'
    })

    // Debug Workspace - Debugging and code analysis
    this.rules.set('debug-workspace', {
      workspace: 'debug-workspace',
      allowedActions: ['debugging', 'code-analysis', 'error-fixing', 'code-execution', 'testing'],
      restrictedActions: ['general-chat', 'summarization', 'creative-writing'],
      description: 'Code debugging and analysis'
    })

    // Explain Assist - Teaching and explanations
    this.rules.set('explain-assist', {
      workspace: 'explain-assist',
      allowedActions: ['explanations', 'teaching', 'concepts', 'learning', 'education'],
      restrictedActions: ['debugging', 'code-execution', 'summarization'],
      description: 'Concept explanations and teaching'
    })

    // Smart Summarizer - Summarization only
    this.rules.set('smart-summarizer', {
      workspace: 'smart-summarizer',
      allowedActions: ['summarization', 'condensing', 'tldr', 'summary'],
      restrictedActions: ['general-chat', 'debugging', 'code-execution', 'explanations'],
      description: 'Text summarization and condensing'
    })

    // RAG Assistant - Document Q&A
    this.rules.set('rag-assistant', {
      workspace: 'rag-assistant',
      allowedActions: ['document-qa', 'knowledge-base', 'search', 'retrieval'],
      restrictedActions: ['debugging', 'code-execution'],
      description: 'Document-based question answering'
    })

    // Voice Assistant - Voice interactions
    this.rules.set('voice-assistant', {
      workspace: 'voice-assistant',
      allowedActions: ['voice-commands', 'speech', 'audio', 'conversation'],
      restrictedActions: ['debugging', 'code-execution'],
      description: 'Voice-based interactions'
    })

    // Image Analyzer - Image analysis
    this.rules.set('image-analyzer', {
      workspace: 'image-analyzer',
      allowedActions: ['image-analysis', 'vision', 'ocr', 'object-detection'],
      restrictedActions: ['debugging', 'code-execution', 'summarization'],
      description: 'Image analysis and recognition'
    })

    // Code Reviewer - Code review
    this.rules.set('code-reviewer', {
      workspace: 'code-reviewer',
      allowedActions: ['code-review', 'best-practices', 'refactoring', 'optimization'],
      restrictedActions: ['general-chat', 'summarization'],
      description: 'Code review and best practices'
    })

    // Data Analyst - Data analysis
    this.rules.set('data-analyst', {
      workspace: 'data-analyst',
      allowedActions: ['data-analysis', 'statistics', 'visualization', 'insights'],
      restrictedActions: ['debugging', 'general-chat'],
      description: 'Data analysis and insights'
    })

    // Creative Writer - Creative writing
    this.rules.set('creative-writer', {
      workspace: 'creative-writer',
      allowedActions: ['creative-writing', 'storytelling', 'poetry', 'content-creation'],
      restrictedActions: ['debugging', 'code-execution', 'data-analysis'],
      description: 'Creative writing and content creation'
    })
  }

  /**
   * Check if a message is allowed in the current workspace
   * 
   * @param message - User message to check
   * @param workspace - Current workspace type
   * @returns GuardResult with allowed status and optional message
   */
  checkMessage(message: string, workspace: WorkspaceType): GuardResult {
    const rule = this.rules.get(workspace)
    
    if (!rule) {
      console.warn(`Unknown workspace: ${workspace}, allowing message`)
      return { allowed: true }
    }

    // Detect intents from the message
    const detectedIntents = this.detectIntent(message)
    
    // If no clear intent detected, allow the message
    if (detectedIntents.length === 0) {
      return { allowed: true }
    }

    // Check if any detected intent is restricted
    for (const intent of detectedIntents) {
      if (rule.restrictedActions.includes(intent)) {
        const helpMessage = this.generateHelpMessage(intent, workspace)
        const suggestedWorkspace = this.suggestWorkspace(intent)
        
        return {
          allowed: false,
          message: helpMessage,
          suggestedWorkspace
        }
      }
    }

    // All intents are allowed
    return { allowed: true }
  }

  /**
   * Detect user intent from message content
   * 
   * @param message - User message
   * @returns Array of detected intent categories
   */
  private detectIntent(message: string): string[] {
    const intents: string[] = []
    const safeMessage = typeof message === 'string' ? message : ''
    const lowerMessage = safeMessage.toLowerCase()

    // Debugging intent
    if (
      lowerMessage.includes('debug') ||
      lowerMessage.includes('fix bug') ||
      lowerMessage.includes('error') ||
      lowerMessage.includes('exception') ||
      lowerMessage.includes('stack trace') ||
      lowerMessage.includes('breakpoint') ||
      /fix\s+(this|the)\s+code/i.test(safeMessage)
    ) {
      intents.push('debugging')
    }

    // Code execution intent
    if (
      lowerMessage.includes('run code') ||
      lowerMessage.includes('execute') ||
      lowerMessage.includes('compile') ||
      lowerMessage.includes('run this') ||
      /run\s+(this|the)\s+code/i.test(safeMessage)
    ) {
      intents.push('code-execution')
    }

    // Code analysis intent
    if (
      lowerMessage.includes('analyze code') ||
      lowerMessage.includes('code review') ||
      lowerMessage.includes('refactor') ||
      lowerMessage.includes('optimize code')
    ) {
      intents.push('code-analysis')
    }

    // Summarization intent
    if (
      lowerMessage.includes('summarize') ||
      lowerMessage.includes('summary') ||
      lowerMessage.includes('tldr') ||
      lowerMessage.includes('condense') ||
      lowerMessage.includes('brief overview')
    ) {
      intents.push('summarization')
    }

    // Explanation intent
    if (
      lowerMessage.includes('explain') ||
      lowerMessage.includes('what is') ||
      lowerMessage.includes('how does') ||
      lowerMessage.includes('teach me') ||
      lowerMessage.includes('help me understand')
    ) {
      intents.push('explanations')
    }

    // General chat intent
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi ') ||
      lowerMessage.includes('how are you') ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('what do you think')
    ) {
      intents.push('general-chat')
    }

    // Creative writing intent
    if (
      lowerMessage.includes('write a story') ||
      lowerMessage.includes('create a poem') ||
      lowerMessage.includes('generate content') ||
      lowerMessage.includes('creative writing')
    ) {
      intents.push('creative-writing')
    }

    // Data analysis intent
    if (
      lowerMessage.includes('analyze data') ||
      lowerMessage.includes('statistics') ||
      lowerMessage.includes('data insights') ||
      lowerMessage.includes('visualize')
    ) {
      intents.push('data-analysis')
    }

    return intents
  }

  /**
   * Generate helpful message for restricted action
   * 
   * @param action - Restricted action
   * @param currentWorkspace - Current workspace
   * @returns Helpful message
   */
  private generateHelpMessage(action: string, currentWorkspace: WorkspaceType): string {
    const workspaceName = this.getWorkspaceName(currentWorkspace)
    const suggestedWorkspace = this.suggestWorkspace(action)
    const suggestedName = suggestedWorkspace ? this.getWorkspaceName(suggestedWorkspace) : ''

    // Specific messages for common scenarios
    if (action === 'debugging' && currentWorkspace === 'general-chat') {
      return 'This is the General Chat workspace. For debugging code please switch to the Debug Workspace.'
    }

    if (action === 'general-chat' && currentWorkspace === 'smart-summarizer') {
      return 'This is the Smart Summarizer workspace. For general conversation please switch to the General Chat workspace.'
    }

    if (action === 'code-execution' && currentWorkspace === 'explain-assist') {
      return 'This is the Explain Assist workspace. For code execution please switch to the Debug Workspace.'
    }

    if (action === 'summarization' && currentWorkspace === 'general-chat') {
      return 'This is the General Chat workspace. For text summarization please switch to the Smart Summarizer workspace.'
    }

    // Generic message
    if (suggestedWorkspace) {
      return `This is the ${workspaceName} workspace. For ${action} please switch to the ${suggestedName} workspace.`
    }

    return `This action is not available in the ${workspaceName} workspace.`
  }

  /**
   * Suggest appropriate workspace for an action
   * 
   * @param action - Action intent
   * @returns Suggested workspace type
   */
  private suggestWorkspace(action: string): WorkspaceType | undefined {
    const actionToWorkspace: Record<string, WorkspaceType> = {
      'debugging': 'debug-workspace',
      'code-execution': 'debug-workspace',
      'code-analysis': 'code-reviewer',
      'summarization': 'smart-summarizer',
      'explanations': 'explain-assist',
      'general-chat': 'general-chat',
      'creative-writing': 'creative-writer',
      'data-analysis': 'data-analyst',
      'image-analysis': 'image-analyzer',
      'document-qa': 'rag-assistant'
    }

    return actionToWorkspace[action]
  }

  /**
   * Get human-readable workspace name
   * 
   * @param workspace - Workspace type
   * @returns Human-readable name
   */
  private getWorkspaceName(workspace: WorkspaceType): string {
    const names: Record<WorkspaceType, string> = {
      'general-chat': 'General Chat',
      'debug-workspace': 'Debug Workspace',
      'explain-assist': 'Explain Assist',
      'smart-summarizer': 'Smart Summarizer',
      'rag-assistant': 'RAG Assistant',
      'voice-assistant': 'Voice Assistant',
      'image-analyzer': 'Image Analyzer',
      'code-reviewer': 'Code Reviewer',
      'data-analyst': 'Data Analyst',
      'creative-writer': 'Creative Writer'
    }

    return names[workspace] || workspace
  }

  /**
   * Get workspace rule
   * 
   * @param workspace - Workspace type
   * @returns Workspace rule or undefined
   */
  getRule(workspace: WorkspaceType): WorkspaceRule | undefined {
    return this.rules.get(workspace)
  }

  /**
   * Get all workspace rules
   * 
   * @returns Map of all workspace rules
   */
  getAllRules(): Map<WorkspaceType, WorkspaceRule> {
    return new Map(this.rules)
  }
}

// Export singleton instance
export const workspaceGuard = new WorkspaceGuard()

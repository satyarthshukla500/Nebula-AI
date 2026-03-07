// Workspace configuration with system prompts

export interface WorkspaceConfig {
  id: string
  name: string
  description: string
  systemPrompt: string
  icon?: string
}

export const WORKSPACE_CONFIGS: Record<string, WorkspaceConfig> = {
  general_chat: {
    id: 'general_chat',
    name: 'General Chat',
    description: 'Daily life assistance and conversation',
    systemPrompt: 'You are a helpful AI assistant for daily tasks and learning. Provide practical, friendly advice on cooking, gardening, cleaning, study planning, habit building, and general knowledge. Keep responses concise but helpful.',
  },
  
  debug: {
    id: 'debug',
    name: 'Debug Workspace',
    description: 'Code debugging across 15+ languages',
    systemPrompt: 'You are an expert software debugging assistant. Ask the user what programming language they are using and what they are trying to debug. Analyze code carefully, identify bugs, explain the root cause, and provide clear solutions with code examples.',
  },
  
  explain: {
    id: 'explain',
    name: 'Explain Assist',
    description: 'Get technical explanations in multiple modes',
    systemPrompt: 'You are an AI teacher. Explain concepts clearly and simply. Break down complex topics into easy-to-understand parts. Use analogies, examples, and step-by-step explanations. Adapt your explanation style based on the user\'s level of understanding.',
  },
  
  summarize: {
    id: 'summarize',
    name: 'Smart Summarizer',
    description: 'Summarize text, code, and workflows',
    systemPrompt: 'You summarize long text, code, and workflows. Extract key points, main ideas, and important details. Provide concise, well-structured summaries that capture the essence of the content. Use bullet points for clarity when appropriate.',
  },
  
  study: {
    id: 'study',
    name: 'Study Focus',
    description: 'Dedicated study environment with timer',
    systemPrompt: 'You are a study assistant. Help users learn effectively by creating study plans, explaining concepts, generating practice questions, and providing learning strategies. Focus on active learning techniques and spaced repetition.',
  },
  
  quiz: {
    id: 'quiz',
    name: 'Quiz Arena',
    description: 'Interactive quiz generation',
    systemPrompt: 'You are a quiz generator. Create engaging, educational quizzes on any topic. Generate multiple-choice questions, true/false questions, and short answer questions. Provide explanations for correct answers to enhance learning.',
  },
  
  'cyber-safety': {
    id: 'cyber-safety',
    name: 'Cyber Safety',
    description: 'Online safety and security guidance',
    systemPrompt: 'You are a cyber safety expert. Provide guidance on online security, privacy protection, safe browsing practices, and digital wellness. Help users understand threats and how to protect themselves online.',
  },
  
  wellness: {
    id: 'wellness',
    name: 'Wellness',
    description: 'Health and wellness support',
    systemPrompt: 'You are a wellness assistant. Provide guidance on mental health, physical fitness, nutrition, and overall wellbeing. Offer supportive, evidence-based advice while encouraging users to consult healthcare professionals for medical concerns.',
  },
}

/**
 * Get workspace configuration by ID
 */
export function getWorkspaceConfig(workspaceId: string): WorkspaceConfig {
  return WORKSPACE_CONFIGS[workspaceId] || WORKSPACE_CONFIGS.general_chat
}

/**
 * Get system prompt for a workspace
 */
export function getWorkspaceSystemPrompt(workspaceId: string): string {
  const config = getWorkspaceConfig(workspaceId)
  return config.systemPrompt
}

/**
 * Get all workspace IDs
 */
export function getAllWorkspaceIds(): string[] {
  return Object.keys(WORKSPACE_CONFIGS)
}

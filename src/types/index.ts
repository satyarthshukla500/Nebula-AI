// Common types used throughout the application

export type UserRole = 'user' | 'admin'
export type AccountStatus = 'active' | 'suspended' | 'deleted'

export type WorkspaceType =
  | 'general_chat'
  | 'explain_assist'
  | 'debug_workspace'
  | 'smart_summarizer'
  | 'quiz_arena'
  | 'interactive_quiz'
  | 'cyber_safety'
  | 'mental_wellness'
  | 'study_focus'

export interface User {
  id: string
  email: string
  fullName: string | null
  role: UserRole
  status: AccountStatus
  avatarUrl: string | null
  createdAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ChatSession {
  id: string
  workspaceType: WorkspaceType
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface FileUpload {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  s3Key: string
  s3Url: string
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  uploadProgress: number
  createdAt: Date
  metadata?: {
    workspace?: WorkspaceType
    [key: string]: any
  }
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'short_answer'
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface QuizResult {
  id: string
  quizTitle: string
  totalQuestions: number
  correctAnswers: number
  scorePercentage: number
  timeTakenSeconds: number
  isStrictMode: boolean
  proctoringEvents?: ProctoringEvent[]
  createdAt: Date
}

export interface ProctoringEvent {
  type: 'tab_switch' | 'window_resize' | 'focus_loss' | 'copy_attempt' | 'right_click'
  timestamp: Date
  details?: string
}

export interface ProjectMemory {
  id: string
  projectName: string
  projectDescription?: string
  conversations: Message[]
  decisions: ProjectDecision[]
  techStack?: {
    frontend?: string[]
    backend?: string[]
    deployment?: string[]
  }
  summary?: string
  lastAccessed: Date
  createdAt: Date
}

export interface ProjectDecision {
  timestamp: Date
  category: string
  decision: string
  reasoning: string
}

export interface VoiceConfig {
  enabled: boolean
  language: string
  rate: number
  pitch: number
  volume: number
}

export interface CrisisResource {
  name: string
  number: string
  available: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Chat Session Schema
 * 
 * Represents a conversation session in the Nebula AI system.
 * Each session contains multiple messages and is associated with a specific workspace.
 */

import { ObjectId } from 'mongodb'

export interface ChatSession {
  _id?: ObjectId
  sessionId: string          // UUID for external reference
  userId: string             // User identifier from auth system
  workspace: string          // Workspace type (e.g., 'general-chat', 'debug-workspace')
  title: string              // Auto-generated from first message (max 50 chars)
  messageCount: number       // Quick stat for session list
  lastMessageAt: Date        // For sorting by recent activity
  createdAt: Date
  updatedAt: Date
}

/**
 * Session list item for frontend display
 */
export interface SessionListItem {
  sessionId: string
  title: string
  workspace: string
  messageCount: number
  lastMessageAt: Date
  createdAt: Date
}

/**
 * Validation function for chat session data
 */
export function validateChatSession(data: Partial<ChatSession>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  }

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string')
  }

  if (!data.workspace || typeof data.workspace !== 'string') {
    errors.push('workspace is required and must be a string')
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string')
  }

  if (data.title && data.title.length > 50) {
    errors.push('title must not exceed 50 characters')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Create indexes for the chatSessions collection
 * 
 * Indexes:
 * - { userId: 1, createdAt: -1 } - List user's sessions by creation date
 * - { userId: 1, lastMessageAt: -1 } - Sort by recent activity
 * - { sessionId: 1 } - Unique lookup by sessionId
 * - { userId: 1, workspace: 1 } - Filter by workspace
 */
export const CHAT_SESSION_INDEXES = [
  {
    key: { userId: 1, createdAt: -1 },
    name: 'userId_createdAt'
  },
  {
    key: { userId: 1, lastMessageAt: -1 },
    name: 'userId_lastMessageAt'
  },
  {
    key: { sessionId: 1 },
    name: 'sessionId_unique',
    unique: true
  },
  {
    key: { userId: 1, workspace: 1 },
    name: 'userId_workspace'
  }
]

/**
 * Collection name constant
 */
export const CHAT_SESSIONS_COLLECTION = 'chatSessions'

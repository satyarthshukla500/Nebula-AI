/**
 * Message Schema
 * 
 * Represents individual messages within a chat session.
 * Messages are stored separately from sessions for efficient querying.
 */

import { ObjectId } from 'mongodb'

export interface Message {
  _id?: ObjectId
  messageId: string          // UUID for external reference
  sessionId: string          // Reference to chatSessions collection
  userId: string             // Denormalized for security/RLS
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {               // Optional metadata
    fileUrl?: string
    fileType?: string
    fileName?: string
    ragContext?: any
    workspaceType?: string
    [key: string]: any
  }
  createdAt: Date
}

/**
 * Message with session info for display
 */
export interface MessageWithSession {
  message: Message
  sessionTitle?: string
  workspace?: string
}

/**
 * Validation function for message data
 */
export function validateMessage(data: Partial<Message>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.messageId || typeof data.messageId !== 'string') {
    errors.push('messageId is required and must be a string')
  }

  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  }

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string')
  }

  if (!data.role || !['user', 'assistant', 'system'].includes(data.role)) {
    errors.push('role is required and must be one of: user, assistant, system')
  }

  if (!data.content || typeof data.content !== 'string') {
    errors.push('content is required and must be a string')
  }

  if (data.content && data.content.length > 10240) {
    errors.push('content must not exceed 10KB (10240 characters)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Create indexes for the messages collection
 * 
 * Indexes:
 * - { sessionId: 1, createdAt: 1 } - Get messages for session in chronological order
 * - { messageId: 1 } - Unique lookup by messageId
 * - { userId: 1, createdAt: -1 } - User's message history
 */
export const MESSAGE_INDEXES = [
  {
    key: { sessionId: 1, createdAt: 1 },
    name: 'sessionId_createdAt'
  },
  {
    key: { messageId: 1 },
    name: 'messageId_unique',
    unique: true
  },
  {
    key: { userId: 1, createdAt: -1 },
    name: 'userId_createdAt'
  }
]

/**
 * Collection name constant
 */
export const MESSAGES_COLLECTION = 'messages'

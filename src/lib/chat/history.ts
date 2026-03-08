/**
 * Chat History Service
 * 
 * Manages persistent chat sessions and messages in MongoDB.
 * Provides CRUD operations for chat sessions and messages with proper error handling.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { v4 as uuidv4 } from 'uuid'
import { getChatSessionsCollectionNew, getMessagesCollection } from '../mongodb'
import {
  ChatSession,
  SessionListItem,
  validateChatSession,
  CHAT_SESSIONS_COLLECTION
} from '../db/schemas/chatSession.schema'
import {
  Message,
  validateMessage,
  MESSAGES_COLLECTION
} from '../db/schemas/message.schema'

/**
 * Session with all associated messages
 */
export interface SessionWithMessages {
  session: ChatSession
  messages: Message[]
}

/**
 * Chat History Service Class
 * 
 * Handles all chat session and message operations with MongoDB
 */
export class ChatHistoryService {
  /**
   * Create a new chat session
   * 
   * @param userId - User identifier from auth system
   * @param workspace - Workspace type (e.g., 'general-chat', 'debug-workspace')
   * @param firstMessage - First message content for title generation
   * @returns sessionId - UUID of the created session
   * 
   * Requirements: 1.1, 1.2
   */
  async createSession(
    userId: string,
    workspace: string,
    firstMessage: string
  ): Promise<string> {
    try {
      const sessionId = uuidv4()
      const title = this.generateSessionTitle(firstMessage)
      const now = new Date()

      const session: ChatSession = {
        sessionId,
        userId,
        workspace,
        title,
        messageCount: 0,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now
      }

      // Validate session data
      const validation = validateChatSession(session)
      if (!validation.valid) {
        throw new Error(`Invalid session data: ${validation.errors.join(', ')}`)
      }

      const collection = await getChatSessionsCollectionNew()
      await collection.insertOne(session)

      console.log(`✅ Created chat session: ${sessionId} for user: ${userId}`)
      return sessionId
    } catch (error) {
      console.error('Failed to create chat session:', error)
      throw new Error(`Failed to create chat session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Save a message to a session
   * 
   * @param sessionId - Session UUID
   * @param role - Message role (user, assistant, system)
   * @param content - Message content
   * @param userId - User identifier for security
   * @returns messageId - UUID of the saved message
   * 
   * Requirements: 1.3
   */
  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    userId: string
  ): Promise<string> {
    console.log('[MongoDB] saveMessage called:', { userId, sessionId, role, contentLength: content?.length })
    
    try {
      const messageId = uuidv4()
      const now = new Date()

      const message: Message = {
        messageId,
        sessionId,
        userId,
        role,
        content,
        createdAt: now
      }

      // Validate message data
      const validation = validateMessage(message)
      if (!validation.valid) {
        throw new Error(`Invalid message data: ${validation.errors.join(', ')}`)
      }

      // Insert message
      const messagesCollection = await getMessagesCollection()
      await messagesCollection.insertOne(message)

      // Update session metadata
      const sessionsCollection = await getChatSessionsCollectionNew()
      await sessionsCollection.updateOne(
        { sessionId },
        {
          $inc: { messageCount: 1 },
          $set: {
            lastMessageAt: now,
            updatedAt: now
          }
        }
      )

      console.log(`✅ Saved message: ${messageId} to session: ${sessionId}`)
      return messageId
    } catch (error) {
      console.error('Failed to save message:', error)
      throw new Error(`Failed to save message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get list of sessions for a user
   * 
   * @param userId - User identifier
   * @param limit - Maximum number of sessions to return (default: 100)
   * @returns Array of session list items ordered by creation date (newest first)
   * 
   * Requirements: 1.4
   */
  async getSessionList(userId: string, limit: number = 100): Promise<SessionListItem[]> {
    try {
      const collection = await getChatSessionsCollectionNew()
      
      const sessions = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .project({
          _id: 0,
          sessionId: 1,
          title: 1,
          workspace: 1,
          messageCount: 1,
          lastMessageAt: 1,
          createdAt: 1
        })
        .toArray()

      console.log(`✅ Retrieved ${sessions.length} sessions for user: ${userId}`)
      return sessions as SessionListItem[]
    } catch (error) {
      console.error('Failed to get session list:', error)
      throw new Error(`Failed to get session list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get a specific session with all messages
   * 
   * @param sessionId - Session UUID
   * @returns Session with messages or null if not found
   * 
   * Requirements: 1.5
   */
  async getSession(sessionId: string): Promise<SessionWithMessages | null> {
    try {
      const sessionsCollection = await getChatSessionsCollectionNew()
      const messagesCollection = await getMessagesCollection()

      // Get session
      const session = await sessionsCollection.findOne(
        { sessionId },
        { projection: { _id: 0 } }
      )

      if (!session) {
        console.log(`⚠️ Session not found: ${sessionId}`)
        return null
      }

      // Get messages ordered chronologically
      const messages = await messagesCollection
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .project({ _id: 0 })
        .toArray()

      console.log(`✅ Retrieved session: ${sessionId} with ${messages.length} messages`)
      return {
        session: session as ChatSession,
        messages: messages as Message[]
      }
    } catch (error) {
      console.error('Failed to get session:', error)
      throw new Error(`Failed to get session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a session and all associated messages
   * 
   * @param sessionId - Session UUID
   * @param userId - User identifier for authorization
   * 
   * Requirements: 1.6
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionsCollection = await getChatSessionsCollectionNew()
      const messagesCollection = await getMessagesCollection()

      // Verify ownership before deletion
      const session = await sessionsCollection.findOne({ sessionId, userId })
      if (!session) {
        throw new Error('Session not found or unauthorized')
      }

      // Delete all messages first
      const messagesResult = await messagesCollection.deleteMany({ sessionId })
      console.log(`🗑️ Deleted ${messagesResult.deletedCount} messages from session: ${sessionId}`)

      // Delete session
      const sessionResult = await sessionsCollection.deleteOne({ sessionId, userId })
      if (sessionResult.deletedCount === 0) {
        throw new Error('Failed to delete session')
      }

      console.log(`✅ Deleted session: ${sessionId}`)
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw new Error(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a session title from the first message
   * 
   * @param message - First message content
   * @returns Title string (max 50 characters)
   * 
   * Requirements: 1.2
   */
  private generateSessionTitle(message: string): string {
    // Remove extra whitespace and newlines
    const cleaned = message.trim().replace(/\s+/g, ' ')
    
    // Truncate to 50 characters
    if (cleaned.length <= 50) {
      return cleaned
    }

    // Find last complete word within 47 chars (leaving room for "...")
    const truncated = cleaned.substring(0, 47)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > 20) {
      // If we have a reasonable break point, use it
      return truncated.substring(0, lastSpace) + '...'
    }
    
    // Otherwise, hard truncate
    return truncated + '...'
  }

  /**
   * Get sessions by workspace type
   * 
   * @param userId - User identifier
   * @param workspace - Workspace type to filter by
   * @param limit - Maximum number of sessions to return
   * @returns Array of session list items
   */
  async getSessionsByWorkspace(
    userId: string,
    workspace: string,
    limit: number = 100
  ): Promise<SessionListItem[]> {
    try {
      const collection = await getChatSessionsCollectionNew()
      
      const sessions = await collection
        .find({ userId, workspace })
        .sort({ createdAt: -1 })
        .limit(limit)
        .project({
          _id: 0,
          sessionId: 1,
          title: 1,
          workspace: 1,
          messageCount: 1,
          lastMessageAt: 1,
          createdAt: 1
        })
        .toArray()

      console.log(`✅ Retrieved ${sessions.length} sessions for user: ${userId} in workspace: ${workspace}`)
      return sessions as SessionListItem[]
    } catch (error) {
      console.error('Failed to get sessions by workspace:', error)
      throw new Error(`Failed to get sessions by workspace: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update session title
   * 
   * @param sessionId - Session UUID
   * @param userId - User identifier for authorization
   * @param newTitle - New title (max 50 characters)
   */
  async updateSessionTitle(
    sessionId: string,
    userId: string,
    newTitle: string
  ): Promise<void> {
    try {
      if (newTitle.length > 50) {
        throw new Error('Title must not exceed 50 characters')
      }

      const collection = await getChatSessionsCollectionNew()
      const result = await collection.updateOne(
        { sessionId, userId },
        {
          $set: {
            title: newTitle,
            updatedAt: new Date()
          }
        }
      )

      if (result.matchedCount === 0) {
        throw new Error('Session not found or unauthorized')
      }

      console.log(`✅ Updated title for session: ${sessionId}`)
    } catch (error) {
      console.error('Failed to update session title:', error)
      throw new Error(`Failed to update session title: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const chatHistoryService = new ChatHistoryService()

/**
 * MongoDB Schemas Index
 * 
 * Central export point for all database schemas and utilities.
 */

// Export all schemas
export * from './chatSession.schema'
export * from './message.schema'
export * from './file.schema'

// Re-export types for convenience
export type {
  ChatSession,
  SessionListItem
} from './chatSession.schema'

export type {
  Message,
  MessageWithSession
} from './message.schema'

export type {
  FileMetadata,
  AllowedFileType,
  FileValidation
} from './file.schema'

// Export collection names
export {
  CHAT_SESSIONS_COLLECTION,
  CHAT_SESSION_INDEXES
} from './chatSession.schema'

export {
  MESSAGES_COLLECTION,
  MESSAGE_INDEXES
} from './message.schema'

export {
  FILES_COLLECTION,
  FILE_INDEXES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
} from './file.schema'

// Export validation functions
export {
  validateChatSession
} from './chatSession.schema'

export {
  validateMessage
} from './message.schema'

export {
  validateFileMetadata,
  validateFile
} from './file.schema'

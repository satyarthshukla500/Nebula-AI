/**
 * File Metadata Schema
 * 
 * Represents uploaded files and their metadata.
 * Files are stored in AWS S3, this collection stores metadata only.
 */

import { ObjectId } from 'mongodb'

export interface FileMetadata {
  _id?: ObjectId
  fileId: string             // UUID for external reference
  userId: string             // User identifier
  sessionId?: string         // Optional link to chat session
  fileName: string           // Original file name
  fileType: string           // MIME type
  fileSize: number           // Size in bytes
  s3Key: string              // S3 object key
  s3Url: string              // Public or presigned S3 URL
  workspace: string          // Workspace where uploaded
  metadata?: {               // File-specific metadata
    pageCount?: number       // For PDFs
    rowCount?: number        // For CSV
    dimensions?: {           // For images
      width: number
      height: number
    }
    analysis?: any           // Workspace-specific analysis results
    [key: string]: any
  }
  createdAt: Date
  expiresAt?: Date           // For temporary files
}

/**
 * Supported file types
 */
export const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'docx', 'csv', 'json', 'png', 'jpg', 'jpeg'] as const
export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number]

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * File validation result
 */
export interface FileValidation {
  valid: boolean
  error?: string
}

/**
 * Validation function for file metadata
 */
export function validateFileMetadata(data: Partial<FileMetadata>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.fileId || typeof data.fileId !== 'string') {
    errors.push('fileId is required and must be a string')
  }

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string')
  }

  if (!data.fileName || typeof data.fileName !== 'string') {
    errors.push('fileName is required and must be a string')
  }

  if (!data.fileType || typeof data.fileType !== 'string') {
    errors.push('fileType is required and must be a string')
  }

  if (typeof data.fileSize !== 'number' || data.fileSize <= 0) {
    errors.push('fileSize is required and must be a positive number')
  }

  if (data.fileSize && data.fileSize > MAX_FILE_SIZE) {
    errors.push(`fileSize must not exceed ${MAX_FILE_SIZE} bytes (10MB)`)
  }

  if (!data.s3Key || typeof data.s3Key !== 'string') {
    errors.push('s3Key is required and must be a string')
  }

  if (!data.s3Url || typeof data.s3Url !== 'string') {
    errors.push('s3Url is required and must be a string')
  }

  if (!data.workspace || typeof data.workspace !== 'string') {
    errors.push('workspace is required and must be a string')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate file type and size before upload
 */
export function validateFile(fileName: string, fileSize: number): FileValidation {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of 10MB`
    }
  }

  // Check file extension
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_FILE_TYPES.includes(extension as AllowedFileType)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Create indexes for the files collection
 * 
 * Indexes:
 * - { userId: 1, createdAt: -1 } - User's files by upload date
 * - { fileId: 1 } - Unique lookup by fileId
 * - { sessionId: 1 } - Files associated with a session
 * - { workspace: 1, userId: 1 } - Files by workspace
 */
export const FILE_INDEXES = [
  {
    key: { userId: 1, createdAt: -1 },
    name: 'userId_createdAt'
  },
  {
    key: { fileId: 1 },
    name: 'fileId_unique',
    unique: true
  },
  {
    key: { sessionId: 1 },
    name: 'sessionId',
    sparse: true  // Since sessionId is optional
  },
  {
    key: { workspace: 1, userId: 1 },
    name: 'workspace_userId'
  }
]

/**
 * Collection name constant
 */
export const FILES_COLLECTION = 'files'

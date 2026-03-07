/**
 * File Upload Service
 * 
 * Handles file uploads to AWS S3 and metadata storage in MongoDB.
 * Provides workspace-specific file processing.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.6
 */

import { v4 as uuidv4 } from 'uuid'
import { getFilesCollection } from '@/lib/mongodb'
import { generateS3Key, getPublicUrl } from '@/lib/aws/s3'
import {
  FileMetadata,
  validateFile,
  validateFileMetadata,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type AllowedFileType
} from '@/lib/db/schemas/file.schema'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Upload result interface
 */
export interface UploadResult {
  fileId: string
  s3Url: string
  s3Key: string
  metadata: FileMetadata
}

/**
 * File processing result interface
 */
export interface FileProcessingResult {
  fileId: string
  analysis: string
  metadata: Record<string, any>
}

/**
 * File Upload Service Class
 * 
 * Provides methods for file validation, upload, metadata management,
 * and workspace-specific file processing.
 */
export class FileUploadService {
  private s3Client: S3Client
  private bucketName: string

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })

    this.bucketName = process.env.AWS_S3_BUCKET_NAME || ''

    if (!this.bucketName) {
      console.warn('[FileUploadService] AWS_S3_BUCKET_NAME not configured')
    }
  }

  /**
   * Validate file format and size
   * 
   * @param fileName - Original file name
   * @param fileSize - File size in bytes
   * @returns Validation result with error message if invalid
   */
  validateFile(fileName: string, fileSize: number): { valid: boolean; error?: string } {
    return validateFile(fileName, fileSize)
  }

  /**
   * Upload file to S3 and save metadata to MongoDB
   * 
   * @param file - File buffer
   * @param fileName - Original file name
   * @param userId - User identifier
   * @param workspace - Workspace type
   * @param sessionId - Optional session ID to associate file with
   * @returns Upload result with fileId, s3Url, and metadata
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    userId: string,
    workspace: string,
    sessionId?: string
  ): Promise<UploadResult> {
    try {
      console.log('[FileUploadService] Starting file upload:', {
        fileName,
        fileSize: file.length,
        userId,
        workspace,
        sessionId
      })

      // Validate file
      const validation = this.validateFile(fileName, file.length)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Generate unique file ID and S3 key
      const fileId = uuidv4()
      const s3Key = this.generateUniqueS3Key(userId, workspace, fileName)
      
      console.log('[FileUploadService] Generated S3 key:', s3Key)

      // Upload to S3
      await this.uploadToS3(file, s3Key, this.getContentType(fileName))
      
      // Get public URL
      const s3Url = getPublicUrl(s3Key)
      
      console.log('[FileUploadService] File uploaded to S3:', s3Url)

      // Create metadata
      const metadata: FileMetadata = {
        fileId,
        userId,
        sessionId,
        fileName,
        fileType: this.getContentType(fileName),
        fileSize: file.length,
        s3Key,
        s3Url,
        workspace,
        createdAt: new Date()
      }

      // Save metadata to MongoDB
      await this.saveMetadata(metadata)
      
      console.log('[FileUploadService] Metadata saved to MongoDB:', fileId)

      return {
        fileId,
        s3Url,
        s3Key,
        metadata
      }
    } catch (error: any) {
      console.error('[FileUploadService] Upload failed:', error.message)
      throw new Error(`File upload failed: ${error.message}`)
    }
  }

  /**
   * Upload file buffer to S3
   * 
   * @param file - File buffer
   * @param s3Key - S3 object key
   * @param contentType - MIME type
   */
  private async uploadToS3(file: Buffer, s3Key: string, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: file,
      ContentType: contentType,
    })

    await this.s3Client.send(command)
  }

  /**
   * Save file metadata to MongoDB
   * 
   * @param metadata - File metadata object
   */
  async saveMetadata(metadata: FileMetadata): Promise<void> {
    try {
      // Validate metadata
      const validation = validateFileMetadata(metadata)
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`)
      }

      const collection = await getFilesCollection()
      await collection.insertOne(metadata as any)
      
      console.log('[FileUploadService] Metadata saved:', metadata.fileId)
    } catch (error: any) {
      console.error('[FileUploadService] Failed to save metadata:', error.message)
      throw new Error(`Failed to save file metadata: ${error.message}`)
    }
  }

  /**
   * Get file metadata by fileId
   * 
   * @param fileId - File identifier
   * @returns File metadata or null if not found
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const collection = await getFilesCollection()
      const metadata = await collection.findOne({ fileId })
      return metadata as FileMetadata | null
    } catch (error: any) {
      console.error('[FileUploadService] Failed to get metadata:', error.message)
      throw new Error(`Failed to retrieve file metadata: ${error.message}`)
    }
  }

  /**
   * Get all files for a user, optionally filtered by workspace
   * 
   * @param userId - User identifier
   * @param workspace - Optional workspace filter
   * @returns Array of file metadata
   */
  async getUserFiles(userId: string, workspace?: string): Promise<FileMetadata[]> {
    try {
      const collection = await getFilesCollection()
      const query: any = { userId }
      
      if (workspace) {
        query.workspace = workspace
      }

      const files = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

      return files as FileMetadata[]
    } catch (error: any) {
      console.error('[FileUploadService] Failed to get user files:', error.message)
      throw new Error(`Failed to retrieve user files: ${error.message}`)
    }
  }

  /**
   * Process file based on workspace context
   * 
   * @param fileId - File identifier
   * @param workspace - Workspace type
   * @returns Processing result with analysis
   */
  async processFile(fileId: string, workspace: string): Promise<FileProcessingResult> {
    try {
      const metadata = await this.getFileMetadata(fileId)
      
      if (!metadata) {
        throw new Error('File not found')
      }

      console.log('[FileUploadService] Processing file:', {
        fileId,
        workspace,
        fileType: metadata.fileType
      })

      // Workspace-specific processing
      let analysis = ''
      const processingMetadata: Record<string, any> = {}

      switch (workspace) {
        case 'general_chat':
        case 'general-chat':
          analysis = await this.processGeneralFile(metadata)
          break

        case 'debug':
        case 'debug-workspace':
          analysis = await this.processCodeFile(metadata)
          break

        case 'smart_summarizer':
        case 'smart-summarizer':
          analysis = await this.processDocumentForSummary(metadata)
          break

        case 'image_analyzer':
        case 'image-analyzer':
          analysis = await this.processImageFile(metadata)
          processingMetadata.imageAnalysis = true
          break

        case 'data_analyst':
        case 'data-analyst':
          analysis = await this.processDataFile(metadata)
          break

        default:
          analysis = `File uploaded: ${metadata.fileName} (${this.formatFileSize(metadata.fileSize)})`
      }

      return {
        fileId,
        analysis,
        metadata: processingMetadata
      }
    } catch (error: any) {
      console.error('[FileUploadService] Processing failed:', error.message)
      throw new Error(`File processing failed: ${error.message}`)
    }
  }

  /**
   * Process file for general chat workspace
   */
  private async processGeneralFile(metadata: FileMetadata): Promise<string> {
    const fileType = this.getFileExtension(metadata.fileName)
    const size = this.formatFileSize(metadata.fileSize)

    return `I've received your ${fileType.toUpperCase()} file "${metadata.fileName}" (${size}). How can I help you with this file?`
  }

  /**
   * Process code file for debug workspace
   */
  private async processCodeFile(metadata: FileMetadata): Promise<string> {
    const fileType = this.getFileExtension(metadata.fileName)
    const size = this.formatFileSize(metadata.fileSize)

    if (['txt', 'json', 'csv'].includes(fileType)) {
      return `I've received your ${fileType.toUpperCase()} file "${metadata.fileName}" (${size}). I can help you debug or analyze this code. What would you like me to focus on?`
    }

    return `I've received your file "${metadata.fileName}" (${size}). Please share the code content you'd like me to debug.`
  }

  /**
   * Process document for summarization
   */
  private async processDocumentForSummary(metadata: FileMetadata): Promise<string> {
    const fileType = this.getFileExtension(metadata.fileName)
    const size = this.formatFileSize(metadata.fileSize)

    return `I've received your ${fileType.toUpperCase()} document "${metadata.fileName}" (${size}). I'll analyze it and provide a summary. Please note: For best results with PDF and DOCX files, you may need to extract the text content first.`
  }

  /**
   * Process image file
   */
  private async processImageFile(metadata: FileMetadata): Promise<string> {
    const size = this.formatFileSize(metadata.fileSize)

    return `I've received your image "${metadata.fileName}" (${size}). I can analyze this image for you. What would you like to know about it?`
  }

  /**
   * Process data file (CSV, JSON)
   */
  private async processDataFile(metadata: FileMetadata): Promise<string> {
    const fileType = this.getFileExtension(metadata.fileName)
    const size = this.formatFileSize(metadata.fileSize)

    if (fileType === 'csv') {
      return `I've received your CSV file "${metadata.fileName}" (${size}). I can help you analyze this data, generate insights, or create visualizations. What would you like to explore?`
    }

    if (fileType === 'json') {
      return `I've received your JSON file "${metadata.fileName}" (${size}). I can help you analyze the data structure, extract information, or perform data transformations. What would you like to do?`
    }

    return `I've received your data file "${metadata.fileName}" (${size}). How can I help you analyze it?`
  }

  /**
   * Generate unique S3 key using timestamp + UUID
   * 
   * @param userId - User identifier
   * @param workspace - Workspace type
   * @param fileName - Original file name
   * @returns Unique S3 key
   */
  private generateUniqueS3Key(userId: string, workspace: string, fileName: string): string {
    const timestamp = Date.now()
    const uniqueId = uuidv4().split('-')[0] // First segment of UUID
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    return `uploads/${userId}/${workspace}/${timestamp}-${uniqueId}-${sanitizedFileName}`
  }

  /**
   * Get content type from file name
   * 
   * @param fileName - File name
   * @returns MIME type
   */
  private getContentType(fileName: string): string {
    const extension = this.getFileExtension(fileName)
    
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'csv': 'text/csv',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    }

    return contentTypes[extension] || 'application/octet-stream'
  }

  /**
   * Get file extension from file name
   * 
   * @param fileName - File name
   * @returns File extension (lowercase)
   */
  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Format file size for display
   * 
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService()

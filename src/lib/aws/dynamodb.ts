// AWS DynamoDB integration for persistent chat storage
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB client
let client: DynamoDBClient | null = null
let docClient: DynamoDBDocumentClient | null = null

try {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
    })

    console.log('[DynamoDB] Client initialized successfully')
  } else {
    console.log('[DynamoDB] AWS credentials not found, client not initialized')
  }
} catch (error) {
  console.error('[DynamoDB] Failed to initialize client:', error)
}

// Table names
const CHATS_TABLE = 'NebulaChats'
const SESSIONS_TABLE = 'NebulaChatSessions'
const UPLOADS_TABLE = 'nebulauploads'

/**
 * Check if DynamoDB is configured
 */
export function isDynamoDBConfigured(): boolean {
  return !!docClient
}

/**
 * Save a message to DynamoDB
 * 
 * @param userId - User ID
 * @param workspace - Workspace type (e.g., 'general_chat', 'debug')
 * @param role - Message role ('user' or 'assistant')
 * @param message - Message content
 * @returns Promise<boolean> - Success status
 */
export async function saveMessage(
  userId: string,
  workspace: string,
  role: 'user' | 'assistant',
  message: string
): Promise<boolean> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return false
  }

  try {
    const timestamp = Date.now()
    
    const command = new PutCommand({
      TableName: CHATS_TABLE,
      Item: {
        userId,
        timestamp,
        workspace,
        role,
        message,
        createdAt: new Date().toISOString(),
      },
    })

    await docClient.send(command)
    
    console.log('[DynamoDB] Message saved:', {
      userId,
      workspace,
      role,
      messageLength: message.length,
      timestamp,
    })
    
    return true
  } catch (error: any) {
    console.error('[DynamoDB] Failed to save message:', {
      error: error.message,
      userId,
      workspace,
      role,
    })
    return false
  }
}

/**
 * Create a chat session
 * 
 * @param userId - User ID
 * @param chatId - Chat session ID
 * @param metadata - Optional metadata
 * @returns Promise<boolean> - Success status
 */
export async function createSession(
  userId: string,
  chatId: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return false
  }

  try {
    const command = new PutCommand({
      TableName: SESSIONS_TABLE,
      Item: {
        userId,
        chatId,
        createdAt: Date.now(),
        ...metadata,
      },
    })

    await docClient.send(command)
    
    console.log('[DynamoDB] Session created:', { userId, chatId })
    
    return true
  } catch (error: any) {
    console.error('[DynamoDB] Failed to create session:', {
      error: error.message,
      userId,
      chatId,
    })
    return false
  }
}

/**
 * Get messages for a user
 * 
 * @param userId - User ID
 * @param workspace - Optional workspace filter
 * @param limit - Maximum number of messages to return
 * @returns Promise<Array> - Array of messages sorted by timestamp
 */
export async function getMessages(
  userId: string,
  workspace?: string,
  limit: number = 100
): Promise<any[]> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return []
  }

  try {
    const command = new QueryCommand({
      TableName: CHATS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: true, // Sort by timestamp ascending
      Limit: limit,
    })

    const response = await docClient.send(command)
    let messages = response.Items || []

    // Filter by workspace if specified
    if (workspace) {
      messages = messages.filter((msg) => msg.workspace === workspace)
    }

    console.log('[DynamoDB] Messages retrieved:', {
      userId,
      workspace,
      count: messages.length,
    })

    return messages
  } catch (error: any) {
    console.error('[DynamoDB] Failed to get messages:', {
      error: error.message,
      userId,
      workspace,
    })
    return []
  }
}

/**
 * Get a specific chat session
 * 
 * @param userId - User ID
 * @param chatId - Chat session ID
 * @returns Promise<any> - Session data or null
 */
export async function getSession(
  userId: string,
  chatId: string
): Promise<any | null> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return null
  }

  try {
    const command = new GetCommand({
      TableName: SESSIONS_TABLE,
      Key: {
        userId,
        chatId,
      },
    })

    const response = await docClient.send(command)
    
    console.log('[DynamoDB] Session retrieved:', {
      userId,
      chatId,
      found: !!response.Item,
    })

    return response.Item || null
  } catch (error: any) {
    console.error('[DynamoDB] Failed to get session:', {
      error: error.message,
      userId,
      chatId,
    })
    return null
  }
}

/**
 * Get recent messages for a workspace
 * 
 * @param userId - User ID
 * @param workspace - Workspace type
 * @param limit - Maximum number of messages
 * @returns Promise<Array> - Recent messages
 */
export async function getRecentMessages(
  userId: string,
  workspace: string,
  limit: number = 50
): Promise<any[]> {
  const messages = await getMessages(userId, workspace, limit)
  
  // Return most recent messages
  return messages.slice(-limit)
}

/**
 * Save upload metadata
 * 
 * @param userId - User ID
 * @param uploadId - Upload ID
 * @param metadata - Upload metadata
 * @returns Promise<boolean> - Success status
 */
export async function saveUpload(
  userId: string,
  uploadId: string,
  metadata: Record<string, any>
): Promise<boolean> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return false
  }

  try {
    const command = new PutCommand({
      TableName: UPLOADS_TABLE,
      Item: {
        userId,
        uploadId,
        createdAt: Date.now(),
        ...metadata,
      },
    })

    await docClient.send(command)
    
    console.log('[DynamoDB] Upload saved:', { userId, uploadId })
    
    return true
  } catch (error: any) {
    console.error('[DynamoDB] Failed to save upload:', {
      error: error.message,
      userId,
      uploadId,
    })
    return false
  }
}

/**
 * Get user uploads
 * 
 * @param userId - User ID
 * @param limit - Maximum number of uploads
 * @returns Promise<Array> - Array of uploads
 */
export async function getUploads(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  if (!docClient) {
    console.error('[DynamoDB] Client not initialized')
    return []
  }

  try {
    const command = new QueryCommand({
      TableName: UPLOADS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by uploadId descending (most recent first)
      Limit: limit,
    })

    const response = await docClient.send(command)
    
    console.log('[DynamoDB] Uploads retrieved:', {
      userId,
      count: response.Items?.length || 0,
    })

    return response.Items || []
  } catch (error: any) {
    console.error('[DynamoDB] Failed to get uploads:', {
      error: error.message,
      userId,
    })
    return []
  }
}

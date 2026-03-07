// MongoDB connection and helper functions
import { MongoClient, Db, Collection } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI

// MongoDB client options optimized for Node v22 and TLS compatibility
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClient = client
    globalWithMongo._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log('✅ MongoDB connected successfully')
        return connectedClient
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message)
        console.error('Error details:', {
          name: error.name,
          code: error.code,
          reason: error.reason?.type,
        })
        throw error
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create a new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log('✅ MongoDB connected successfully')
      return connectedClient
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message)
      throw error
    })
}

export default clientPromise

// Helper to get database with error handling
export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db(process.env.MONGODB_DB_NAME || 'nebula-ai')
  } catch (error) {
    console.error('Failed to get database:', error)
    throw new Error('Database connection failed')
  }
}

// Collection helpers with error handling
export async function getProjectMemoryCollection() {
  try {
    const db = await getDatabase()
    return db.collection('project_memory')
  } catch (error) {
    console.error('Failed to get project_memory collection:', error)
    throw error
  }
}

export async function getConversationHistoryCollection() {
  try {
    const db = await getDatabase()
    return db.collection('conversation_history')
  } catch (error) {
    console.error('Failed to get conversation_history collection:', error)
    throw error
  }
}

export async function getChatSessionsCollection() {
  try {
    const db = await getDatabase()
    return db.collection('chat_sessions')
  } catch (error) {
    console.error('Failed to get chat_sessions collection:', error)
    throw error
  }
}

// Types for MongoDB documents
export interface ProjectMemoryDocument {
  _id?: string
  contextId: string
  userId: string
  projectName: string
  projectDescription?: string
  conversations: Array<{
    timestamp: Date
    role: 'user' | 'assistant'
    content: string
  }>
  decisions: Array<{
    timestamp: Date
    category: string
    decision: string
    reasoning: string
  }>
  techStack?: {
    frontend?: string[]
    backend?: string[]
    deployment?: string[]
  }
  files?: Array<{
    name: string
    s3Url: string
    uploadedAt: Date
  }>
  summary?: string
  lastAccessed: Date
  createdAt: Date
  updatedAt: Date
  version: number
  tags?: string[]
}

export interface ConversationHistoryDocument {
  _id?: string
  sessionId: string
  userId: string
  workspaceType: string
  messages: Array<{
    id: string
    timestamp: Date
    role: 'user' | 'assistant'
    content: string
    metadata?: Record<string, any>
  }>
  title?: string
  summary?: string
  context?: Record<string, any>
  startedAt: Date
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  messageCount: number
}

export interface ChatSessionDocument {
  _id?: string
  sessionId: string
  userId: string
  workspaceType: string
  currentContext?: Record<string, any>
  tempFiles?: Array<{
    fileId: string
    fileName: string
    s3Url: string
    uploadedAt: Date
  }>
  settings?: Record<string, any>
  startedAt: Date
  lastActivity: Date
  expiresAt: Date
  isActive: boolean
}

// ============================================
// NEW: Nebula AI Upgrade Collections
// ============================================

/**
 * Get chatSessions collection for persistent chat history
 */
export async function getChatSessionsCollectionNew() {
  try {
    const db = await getDatabase()
    return db.collection('chatSessions')
  } catch (error) {
    console.error('Failed to get chatSessions collection:', error)
    throw error
  }
}

/**
 * Get messages collection for chat messages
 */
export async function getMessagesCollection() {
  try {
    const db = await getDatabase()
    return db.collection('messages')
  } catch (error) {
    console.error('Failed to get messages collection:', error)
    throw error
  }
}

/**
 * Get files collection for file metadata
 */
export async function getFilesCollection() {
  try {
    const db = await getDatabase()
    return db.collection('files')
  } catch (error) {
    console.error('Failed to get files collection:', error)
    throw error
  }
}

/**
 * Initialize indexes for all collections
 * This should be called once during application startup or deployment
 */
export async function initializeIndexes() {
  try {
    const db = await getDatabase()
    
    // Import index definitions
    const {
      CHAT_SESSIONS_COLLECTION,
      CHAT_SESSION_INDEXES,
      MESSAGES_COLLECTION,
      MESSAGE_INDEXES,
      FILES_COLLECTION,
      FILE_INDEXES
    } = await import('./db/schemas')

    console.log('🔧 Initializing MongoDB indexes...')

    // Create indexes for chatSessions
    const chatSessionsCol = db.collection(CHAT_SESSIONS_COLLECTION)
    for (const index of CHAT_SESSION_INDEXES) {
      await chatSessionsCol.createIndex(index.key as any, {
        name: index.name,
        unique: (index as any).unique || false
      })
      console.log(`✅ Created index: ${CHAT_SESSIONS_COLLECTION}.${index.name}`)
    }

    // Create indexes for messages
    const messagesCol = db.collection(MESSAGES_COLLECTION)
    for (const index of MESSAGE_INDEXES) {
      await messagesCol.createIndex(index.key as any, {
        name: index.name,
        unique: (index as any).unique || false
      })
      console.log(`✅ Created index: ${MESSAGES_COLLECTION}.${index.name}`)
    }

    // Create indexes for files
    const filesCol = db.collection(FILES_COLLECTION)
    for (const index of FILE_INDEXES) {
      await filesCol.createIndex(index.key as any, {
        name: index.name,
        unique: (index as any).unique || false,
        sparse: (index as any).sparse || false
      })
      console.log(`✅ Created index: ${FILES_COLLECTION}.${index.name}`)
    }

    console.log('✅ All indexes initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to initialize indexes:', error)
    throw error
  }
}

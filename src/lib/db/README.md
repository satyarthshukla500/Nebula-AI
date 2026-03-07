# MongoDB Database Schemas

This directory contains MongoDB schema definitions for the Nebula AI upgrade feature.

## Collections

### 1. chatSessions
Stores conversation sessions with metadata.

**Fields:**
- `sessionId` (string, unique): UUID for external reference
- `userId` (string): User identifier
- `workspace` (string): Workspace type (e.g., 'general-chat', 'debug-workspace')
- `title` (string, max 50 chars): Auto-generated from first message
- `messageCount` (number): Quick stat for session list
- `lastMessageAt` (Date): For sorting by recent activity
- `createdAt` (Date): Session creation timestamp
- `updatedAt` (Date): Last update timestamp

**Indexes:**
- `{ userId: 1, createdAt: -1 }` - List user's sessions by creation date
- `{ userId: 1, lastMessageAt: -1 }` - Sort by recent activity
- `{ sessionId: 1 }` - Unique lookup by sessionId
- `{ userId: 1, workspace: 1 }` - Filter by workspace

### 2. messages
Stores individual messages within chat sessions.

**Fields:**
- `messageId` (string, unique): UUID for external reference
- `sessionId` (string): Reference to chatSessions collection
- `userId` (string): Denormalized for security
- `role` (enum): 'user' | 'assistant' | 'system'
- `content` (string, max 10KB): Message content
- `metadata` (object, optional): Additional data (files, RAG context, etc.)
- `createdAt` (Date): Message timestamp

**Indexes:**
- `{ sessionId: 1, createdAt: 1 }` - Get messages for session in chronological order
- `{ messageId: 1 }` - Unique lookup by messageId
- `{ userId: 1, createdAt: -1 }` - User's message history

### 3. files
Stores metadata for uploaded files (actual files stored in AWS S3).

**Fields:**
- `fileId` (string, unique): UUID for external reference
- `userId` (string): User identifier
- `sessionId` (string, optional): Link to chat session
- `fileName` (string): Original file name
- `fileType` (string): MIME type
- `fileSize` (number): Size in bytes (max 10MB)
- `s3Key` (string): S3 object key
- `s3Url` (string): Public or presigned S3 URL
- `workspace` (string): Workspace where uploaded
- `metadata` (object, optional): File-specific metadata (page count, dimensions, analysis)
- `createdAt` (Date): Upload timestamp
- `expiresAt` (Date, optional): For temporary files

**Indexes:**
- `{ userId: 1, createdAt: -1 }` - User's files by upload date
- `{ fileId: 1 }` - Unique lookup by fileId
- `{ sessionId: 1 }` - Files associated with a session (sparse index)
- `{ workspace: 1, userId: 1 }` - Files by workspace

## Supported File Types

- PDF (.pdf) - max 10MB
- Text (.txt) - max 5MB
- Word (.docx) - max 10MB
- CSV (.csv) - max 5MB
- JSON (.json) - max 5MB
- PNG (.png) - max 10MB
- JPEG (.jpg, .jpeg) - max 10MB

## Usage

### Import Schemas

```typescript
import {
  ChatSession,
  Message,
  FileMetadata,
  validateChatSession,
  validateMessage,
  validateFileMetadata,
  validateFile
} from '@/lib/db/schemas'
```

### Get Collections

```typescript
import {
  getChatSessionsCollectionNew,
  getMessagesCollection,
  getFilesCollection
} from '@/lib/mongodb'

// Get collection
const chatSessions = await getChatSessionsCollectionNew()

// Insert document
await chatSessions.insertOne({
  sessionId: 'uuid-here',
  userId: 'user-123',
  workspace: 'general-chat',
  title: 'How to use React hooks',
  messageCount: 0,
  lastMessageAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Initialize Indexes

Run once during deployment or setup:

```bash
npx tsx src/lib/db/init-indexes.ts
```

Or programmatically:

```typescript
import { initializeIndexes } from '@/lib/mongodb'

await initializeIndexes()
```

## Validation

All schemas include validation functions:

```typescript
import { validateChatSession } from '@/lib/db/schemas'

const result = validateChatSession({
  sessionId: 'uuid',
  userId: 'user-123',
  workspace: 'general-chat',
  title: 'My conversation'
})

if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

## Backward Compatibility

These new collections are separate from existing collections:
- `project_memory` (existing)
- `conversation_history` (existing)
- `chat_sessions` (existing)

The new collections use different names to avoid conflicts:
- `chatSessions` (new)
- `messages` (new)
- `files` (new)

## Performance Considerations

- All collections have appropriate indexes for common queries
- Indexes are created with `background: true` to avoid blocking
- Sparse indexes used for optional fields (e.g., sessionId in files)
- Compound indexes optimize multi-field queries

## Security

- All collections should have Row Level Security (RLS) implemented at the application level
- User data is isolated by userId
- File uploads are scoped to user's S3 prefix
- Sensitive data should be encrypted before storage

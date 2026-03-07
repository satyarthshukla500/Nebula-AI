# Chat History Service

This directory contains the Chat History Service for the Nebula AI Upgrade feature.

## Overview

The Chat History Service manages persistent chat sessions and messages in MongoDB. It provides CRUD operations for:
- Creating and managing chat sessions
- Saving and retrieving messages
- Organizing sessions by user and workspace
- Deleting sessions with cascade deletion of messages

## Files

- `history.ts` - Main Chat History Service implementation
- `__tests__/history.manual-test.ts` - Manual test script for verification

## Usage

### Import the Service

```typescript
import { chatHistoryService } from '@/lib/chat/history'
```

### Create a Session

```typescript
const sessionId = await chatHistoryService.createSession(
  userId,
  'general-chat',
  'Hello, this is my first message!'
)
```

### Save a Message

```typescript
const messageId = await chatHistoryService.saveMessage(
  sessionId,
  'user',
  'What is the weather today?',
  userId
)
```

### Get Session List

```typescript
const sessions = await chatHistoryService.getSessionList(userId)
// Returns array of SessionListItem ordered by createdAt (newest first)
```

### Get Session with Messages

```typescript
const sessionWithMessages = await chatHistoryService.getSession(sessionId)
// Returns { session: ChatSession, messages: Message[] }
```

### Delete Session

```typescript
await chatHistoryService.deleteSession(sessionId, userId)
// Deletes session and all associated messages
```

## Features

### Auto-Generated Titles
- Session titles are automatically generated from the first message
- Maximum length: 50 characters
- Intelligently truncates at word boundaries

### Message Count Tracking
- Each session tracks the number of messages
- Updated automatically when messages are saved

### Last Message Timestamp
- Sessions track when the last message was sent
- Useful for sorting by recent activity

### Workspace Filtering
- Get sessions filtered by workspace type
- Supports all workspace types (general-chat, debug-workspace, etc.)

### Authorization
- All operations verify user ownership
- Sessions can only be accessed/deleted by the owner

## Error Handling

All methods include comprehensive error handling:
- Validation errors for invalid data
- Database connection errors
- Authorization errors
- Detailed error messages for debugging

## Testing

### Manual Test Script

Run the manual test script to verify functionality:

```bash
npx ts-node src/lib/chat/__tests__/history.manual-test.ts
```

Or add to package.json:

```json
{
  "scripts": {
    "test:chat-history": "ts-node src/lib/chat/__tests__/history.manual-test.ts"
  }
}
```

### Test Coverage

The manual test script covers:
1. ✅ Create Session
2. ✅ Save Messages (user and assistant)
3. ✅ Get Session List
4. ✅ Get Session with Messages
5. ✅ Update Session Title
6. ✅ Get Sessions by Workspace
7. ✅ Delete Session
8. ✅ Verify Deletion

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 1.1**: Create new Chat_Session with userId, workspace, auto-generated title, and createdAt
- **Requirement 1.2**: Generate Session_Title from first message (max 50 chars)
- **Requirement 1.3**: Persist messages with sessionId, role, content, and createdAt
- **Requirement 1.4**: Return sessions ordered by createdAt descending
- **Requirement 1.5**: Return session with messages ordered by createdAt ascending
- **Requirement 1.6**: Cascade deletion of session and messages

## Next Steps

After implementing the Chat History Service, the next tasks are:

1. **Task 3**: Implement Chat History API routes
   - POST /api/chat/session/create
   - GET /api/chat/session/list
   - GET /api/chat/session/:id
   - POST /api/chat/message
   - DELETE /api/chat/session/:id

2. **Task 4**: Checkpoint - Verify chat history functionality

3. **Task 5**: Implement Workspace Guard

## Dependencies

- `uuid` - For generating unique IDs
- `mongodb` - Database driver
- MongoDB schemas from `@/lib/db/schemas`

## Notes

- The service uses a singleton pattern (exported as `chatHistoryService`)
- All database operations are async
- Proper TypeScript types are used throughout
- Comprehensive logging for debugging
- Follows existing Nebula AI code patterns

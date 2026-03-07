# Chat History API Routes

This directory contains the RESTful API endpoints for chat history management in the Nebula AI Upgrade feature.

## Overview

The Chat History API provides endpoints for creating, retrieving, and managing chat sessions and messages. All endpoints follow REST conventions and return consistent JSON responses.

## Endpoints

### 1. Create Session

**POST** `/api/chat/session/create`

Creates a new chat session with an auto-generated title.

**Request Body:**
```json
{
  "userId": "string (required)",
  "workspace": "string (required)",
  "firstMessage": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-string"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "userId is required and must be a string",
  "code": "INVALID_USER_ID"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "workspace": "general-chat",
    "firstMessage": "Hello, how can I help you today?"
  }'
```

---

### 2. List Sessions

**GET** `/api/chat/session/list?userId={userId}&limit={limit}`

Returns a list of chat sessions for a user, ordered by creation date (newest first).

**Query Parameters:**
- `userId` (required): User identifier
- `limit` (optional): Maximum number of sessions to return (default: 100, max: 1000)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid-string",
        "title": "Hello, how can I help you today?",
        "workspace": "general-chat",
        "messageCount": 5,
        "lastMessageAt": "2026-03-08T12:00:00.000Z",
        "createdAt": "2026-03-08T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "userId query parameter is required",
  "code": "MISSING_USER_ID"
}
```

**Example:**
```bash
curl http://localhost:3000/api/chat/session/list?userId=user-123&limit=50
```

---

### 3. Get Session

**GET** `/api/chat/session/:id`

Returns a specific session with all messages in chronological order.

**Path Parameters:**
- `id` (required): Session UUID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "uuid-string",
      "userId": "user-123",
      "workspace": "general-chat",
      "title": "Hello, how can I help you today?",
      "messageCount": 2,
      "lastMessageAt": "2026-03-08T12:00:00.000Z",
      "createdAt": "2026-03-08T10:00:00.000Z",
      "updatedAt": "2026-03-08T12:00:00.000Z"
    },
    "messages": [
      {
        "messageId": "uuid-string",
        "sessionId": "uuid-string",
        "userId": "user-123",
        "role": "user",
        "content": "Hello, how can I help you today?",
        "createdAt": "2026-03-08T10:00:00.000Z"
      },
      {
        "messageId": "uuid-string",
        "sessionId": "uuid-string",
        "userId": "user-123",
        "role": "assistant",
        "content": "I'm here to help! What would you like to know?",
        "createdAt": "2026-03-08T10:01:00.000Z"
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

**Example:**
```bash
curl http://localhost:3000/api/chat/session/abc-123-def-456
```

---

### 4. Save Message

**POST** `/api/chat/message`

Saves a message to a chat session and updates session metadata.

**Request Body:**
```json
{
  "sessionId": "string (required)",
  "userId": "string (required)",
  "role": "user | assistant | system (required)",
  "content": "string (required, max 10KB)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid-string"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "role is required and must be one of: user, assistant, system",
  "code": "INVALID_ROLE"
}
```

**Error Response (413 Payload Too Large):**
```json
{
  "success": false,
  "error": "content must not exceed 10KB (10240 characters)",
  "code": "CONTENT_TOO_LARGE"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123-def-456",
    "userId": "user-123",
    "role": "user",
    "content": "What is the weather today?"
  }'
```

---

### 5. Delete Session

**DELETE** `/api/chat/session/:id?userId={userId}`

Deletes a session and all associated messages (cascade deletion).

**Path Parameters:**
- `id` (required): Session UUID

**Query Parameters:**
- `userId` (required): User identifier for authorization

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Session not found or unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/chat/session/abc-123-def-456?userId=user-123"
```

---

## Error Codes

All API endpoints return consistent error codes:

| Code | Description |
|------|-------------|
| `INVALID_USER_ID` | userId is missing or invalid |
| `INVALID_WORKSPACE` | workspace is missing or invalid |
| `INVALID_SESSION_ID` | sessionId is missing or invalid |
| `INVALID_ROLE` | role is missing or not one of: user, assistant, system |
| `INVALID_CONTENT` | content is missing or invalid |
| `INVALID_LIMIT` | limit is not a number between 1 and 1000 |
| `MISSING_USER_ID` | userId query parameter is missing |
| `MISSING_SESSION_ID` | sessionId path parameter is missing |
| `SESSION_NOT_FOUND` | Session does not exist |
| `CONTENT_TOO_LARGE` | Message content exceeds 10KB |
| `UNAUTHORIZED` | User is not authorized to access/delete session |
| `CREATE_SESSION_ERROR` | Failed to create session |
| `LIST_SESSIONS_ERROR` | Failed to list sessions |
| `GET_SESSION_ERROR` | Failed to get session |
| `SAVE_MESSAGE_ERROR` | Failed to save message |
| `DELETE_SESSION_ERROR` | Failed to delete session |

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 403 | Forbidden - Unauthorized access |
| 404 | Not Found - Resource not found |
| 413 | Payload Too Large - Content exceeds size limit |
| 500 | Internal Server Error - Server error |

## Testing

### Manual API Test Script

Run the manual test script to verify all endpoints:

```bash
# Start the development server
npm run dev

# In another terminal, run the test script
npx ts-node src/app/api/chat/__tests__/api-test.manual.ts
```

The test script covers:
1. ✅ Create Session
2. ✅ Save User Message
3. ✅ Save Assistant Message
4. ✅ Get Session List
5. ✅ Get Session with Messages
6. ✅ Delete Session
7. ✅ Verify Deletion
8. ✅ Error Handling

### Using cURL

You can also test endpoints manually with cURL:

```bash
# Create a session
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/chat/session/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","workspace":"general-chat","firstMessage":"Hello!"}' \
  | jq -r '.data.sessionId')

# Save a message
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"userId\":\"test-user\",\"role\":\"user\",\"content\":\"Hello!\"}"

# Get session list
curl "http://localhost:3000/api/chat/session/list?userId=test-user"

# Get session with messages
curl "http://localhost:3000/api/chat/session/$SESSION_ID"

# Delete session
curl -X DELETE "http://localhost:3000/api/chat/session/$SESSION_ID?userId=test-user"
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 2.1**: POST /api/chat/session/create endpoint
- ✅ **Requirement 2.2**: GET /api/chat/session/list endpoint
- ✅ **Requirement 2.3**: GET /api/chat/session/:id endpoint
- ✅ **Requirement 2.4**: POST /api/chat/message endpoint
- ✅ **Requirement 2.5**: DELETE /api/chat/session/:id endpoint
- ✅ **Requirement 2.6**: Appropriate HTTP status codes and error messages

## Integration

These API routes integrate with:
- ✅ Chat History Service (`@/lib/chat/history`)
- ✅ MongoDB schemas (`@/lib/db/schemas`)
- ✅ MongoDB connection (`@/lib/mongodb`)

## Next Steps

After implementing the API routes, the next tasks are:

1. **Task 4**: Checkpoint - Verify chat history functionality
2. **Task 5**: Implement Workspace Guard
3. **Task 11**: Enhance Zustand Chat Store to use these APIs
4. **Task 12**: Implement Chat History Sidebar Component

## Notes

- All endpoints use `export const dynamic = 'force-dynamic'` to prevent static optimization
- Authorization is handled via userId parameter verification
- All responses follow consistent JSON format
- Comprehensive error handling with descriptive messages
- Input validation on all endpoints
- Cascade deletion ensures data integrity

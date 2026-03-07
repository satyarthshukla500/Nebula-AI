# Task 4: Chat History Functionality Verification Guide

## Overview

This guide provides step-by-step instructions to verify that the Chat History Service and API routes are working correctly.

## Prerequisites

Before starting verification:
- ✅ MongoDB connection configured in `.env.local`
- ✅ All dependencies installed (`npm install`)
- ✅ TypeScript compilation successful (`npm run type-check`)
- ✅ Build successful (`npm run build`)

## Verification Steps

### Step 1: Check MongoDB Connection

Verify MongoDB URI is configured:

```bash
# Check .env.local file
cat .env.local | grep MONGODB_URI
```

Expected: `MONGODB_URI=mongodb+srv://...`

### Step 2: Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
✅ MongoDB connected successfully
```

**Keep this terminal running** and open a new terminal for the next steps.

### Step 3: Run Manual Test Script

In a new terminal, run the API test script:

```bash
npx ts-node src/app/api/chat/__tests__/api-test.manual.ts
```

Expected output:
```
🧪 Testing Chat History API Endpoints

Test 1: POST /api/chat/session/create
✅ Status: 201
✅ Created session: [uuid]

Test 2: POST /api/chat/message (user)
✅ Status: 201
✅ Saved user message: [uuid]

Test 3: POST /api/chat/message (assistant)
✅ Status: 201
✅ Saved assistant message: [uuid]

Test 4: GET /api/chat/session/list
✅ Status: 200
✅ Retrieved 1 session(s)

Test 5: GET /api/chat/session/:id
✅ Status: 200
✅ Retrieved session with 2 messages

Test 6: DELETE /api/chat/session/:id
✅ Status: 200
✅ Deleted session

Test 7: Verify Deletion (GET deleted session)
✅ Status: 404
✅ Session not found (correctly deleted)

Test 8: Error Handling (missing userId)
✅ Status: 400
✅ Error handled correctly: userId is required and must be a string

🎉 All API tests passed!
```

### Step 4: Test Individual Endpoints with cURL

#### 4.1 Create Session

```bash
curl -X POST http://localhost:3000/api/chat/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "workspace": "general-chat",
    "firstMessage": "Hello, this is a test message!"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here"
  }
}
```

**Save the sessionId for next steps!**

#### 4.2 Save Message

```bash
# Replace {sessionId} with the actual sessionId from step 4.1
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{sessionId}",
    "userId": "test-user-123",
    "role": "user",
    "content": "What is the weather today?"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "messageId": "uuid-here"
  }
}
```

#### 4.3 List Sessions

```bash
curl "http://localhost:3000/api/chat/session/list?userId=test-user-123"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "title": "Hello, this is a test message!",
        "workspace": "general-chat",
        "messageCount": 2,
        "lastMessageAt": "2026-03-08T...",
        "createdAt": "2026-03-08T..."
      }
    ]
  }
}
```

#### 4.4 Get Session with Messages

```bash
# Replace {sessionId} with the actual sessionId
curl "http://localhost:3000/api/chat/session/{sessionId}"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "uuid",
      "userId": "test-user-123",
      "workspace": "general-chat",
      "title": "Hello, this is a test message!",
      "messageCount": 2,
      "lastMessageAt": "2026-03-08T...",
      "createdAt": "2026-03-08T...",
      "updatedAt": "2026-03-08T..."
    },
    "messages": [
      {
        "messageId": "uuid",
        "sessionId": "uuid",
        "userId": "test-user-123",
        "role": "user",
        "content": "Hello, this is a test message!",
        "createdAt": "2026-03-08T..."
      },
      {
        "messageId": "uuid",
        "sessionId": "uuid",
        "userId": "test-user-123",
        "role": "user",
        "content": "What is the weather today?",
        "createdAt": "2026-03-08T..."
      }
    ]
  }
}
```

#### 4.5 Delete Session

```bash
# Replace {sessionId} with the actual sessionId
curl -X DELETE "http://localhost:3000/api/chat/session/{sessionId}?userId=test-user-123"
```

Expected response:
```json
{
  "success": true
}
```

#### 4.6 Verify Deletion

```bash
# Try to get the deleted session
curl "http://localhost:3000/api/chat/session/{sessionId}"
```

Expected response (404):
```json
{
  "success": false,
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

### Step 5: Verify MongoDB Data

You can verify data is being stored in MongoDB using MongoDB Compass or the MongoDB shell.

#### Using MongoDB Compass:
1. Connect to your MongoDB instance
2. Navigate to your database (default: `nebula-ai`)
3. Check collections:
   - `chatSessions` - Should contain session documents
   - `messages` - Should contain message documents

#### Using MongoDB Shell:
```bash
# Connect to MongoDB
mongosh "your-mongodb-uri"

# Switch to database
use nebula-ai

# Check chatSessions collection
db.chatSessions.find().pretty()

# Check messages collection
db.messages.find().pretty()

# Count documents
db.chatSessions.countDocuments()
db.messages.countDocuments()
```

### Step 6: Test Error Handling

#### 6.1 Missing userId

```bash
curl -X POST http://localhost:3000/api/chat/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "workspace": "general-chat"
  }'
```

Expected response (400):
```json
{
  "success": false,
  "error": "userId is required and must be a string",
  "code": "INVALID_USER_ID"
}
```

#### 6.2 Invalid Role

```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "userId": "test-user",
    "role": "invalid-role",
    "content": "Test"
  }'
```

Expected response (400):
```json
{
  "success": false,
  "error": "role is required and must be one of: user, assistant, system",
  "code": "INVALID_ROLE"
}
```

#### 6.3 Content Too Large

```bash
# Create a message with >10KB content
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"test-session\",
    \"userId\": \"test-user\",
    \"role\": \"user\",
    \"content\": \"$(python -c 'print(\"a\" * 10241)')\"
  }"
```

Expected response (413):
```json
{
  "success": false,
  "error": "content must not exceed 10KB (10240 characters)",
  "code": "CONTENT_TOO_LARGE"
}
```

#### 6.4 Unauthorized Deletion

```bash
# Try to delete a session with wrong userId
curl -X DELETE "http://localhost:3000/api/chat/session/{sessionId}?userId=wrong-user"
```

Expected response (403):
```json
{
  "success": false,
  "error": "Session not found or unauthorized",
  "code": "UNAUTHORIZED"
}
```

### Step 7: Test Service Methods Directly

Run the service test script:

```bash
npx ts-node src/lib/chat/__tests__/history.manual-test.ts
```

Expected output:
```
🧪 Testing Chat History Service

Test 1: Create Session
✅ Created session: [uuid]

Test 2: Save Messages
✅ Saved user message: [uuid]
✅ Saved assistant message: [uuid]

Test 3: Get Session List
✅ Retrieved 1 session(s)

Test 4: Get Session with Messages
✅ Retrieved session with 2 messages

Test 5: Update Session Title
✅ Updated session title

Test 6: Get Sessions by Workspace
✅ Retrieved 1 session(s) for workspace: general-chat

Test 7: Delete Session
✅ Deleted session

Test 8: Verify Deletion
✅ Session successfully deleted (returns null)

🎉 All tests passed!
```

## Verification Checklist

Use this checklist to ensure all functionality is working:

### Chat History Service
- [ ] ✅ Create session with auto-generated title
- [ ] ✅ Save user messages
- [ ] ✅ Save assistant messages
- [ ] ✅ Get session list ordered by createdAt (newest first)
- [ ] ✅ Get session with messages ordered chronologically
- [ ] ✅ Delete session with cascade deletion
- [ ] ✅ Update session title
- [ ] ✅ Get sessions by workspace

### API Endpoints
- [ ] ✅ POST /api/chat/session/create returns 201 with sessionId
- [ ] ✅ GET /api/chat/session/list returns 200 with sessions array
- [ ] ✅ GET /api/chat/session/:id returns 200 with session and messages
- [ ] ✅ POST /api/chat/message returns 201 with messageId
- [ ] ✅ DELETE /api/chat/session/:id returns 200 on success
- [ ] ✅ All endpoints return appropriate error codes

### Error Handling
- [ ] ✅ Missing userId returns 400
- [ ] ✅ Missing workspace returns 400
- [ ] ✅ Invalid role returns 400
- [ ] ✅ Content too large returns 413
- [ ] ✅ Session not found returns 404
- [ ] ✅ Unauthorized deletion returns 403

### Data Persistence
- [ ] ✅ Sessions stored in MongoDB chatSessions collection
- [ ] ✅ Messages stored in MongoDB messages collection
- [ ] ✅ Session metadata updated on message save
- [ ] ✅ Cascade deletion removes all messages

### Requirements Validation
- [ ] ✅ Requirement 1.1: Create session with all required fields
- [ ] ✅ Requirement 1.2: Generate title from first message (max 50 chars)
- [ ] ✅ Requirement 1.3: Persist messages with all required fields
- [ ] ✅ Requirement 1.4: Return sessions ordered by createdAt desc
- [ ] ✅ Requirement 1.5: Return session with messages ordered by createdAt asc
- [ ] ✅ Requirement 1.6: Cascade deletion of session and messages
- [ ] ✅ Requirement 2.1: POST /api/chat/session/create endpoint
- [ ] ✅ Requirement 2.2: GET /api/chat/session/list endpoint
- [ ] ✅ Requirement 2.3: GET /api/chat/session/:id endpoint
- [ ] ✅ Requirement 2.4: POST /api/chat/message endpoint
- [ ] ✅ Requirement 2.5: DELETE /api/chat/session/:id endpoint
- [ ] ✅ Requirement 2.6: Appropriate HTTP status codes and errors

## Troubleshooting

### Issue: MongoDB Connection Failed

**Symptoms**: 
```
❌ MongoDB connection error: ...
```

**Solutions**:
1. Check MONGODB_URI in `.env.local`
2. Verify MongoDB cluster is running
3. Check network connectivity
4. Verify IP whitelist in MongoDB Atlas

### Issue: Test Script Fails

**Symptoms**:
```
❌ Test failed: Failed to create session
```

**Solutions**:
1. Ensure dev server is running (`npm run dev`)
2. Check MongoDB connection
3. Verify port 3000 is not in use
4. Check console logs for detailed errors

### Issue: 404 on API Endpoints

**Symptoms**:
```
404 Not Found
```

**Solutions**:
1. Verify dev server is running
2. Check URL is correct (http://localhost:3000)
3. Ensure API routes are in correct directory structure
4. Rebuild the project (`npm run build`)

### Issue: TypeScript Errors

**Symptoms**:
```
error TS2454: Variable 'sessionId' is used before being assigned
```

**Solutions**:
1. Run `npm run type-check` to see all errors
2. Ensure all variables are properly initialized
3. Check tsconfig.json excludes nebula-ai folder

## Success Criteria

Task 4 is complete when:

✅ All manual test scripts pass  
✅ All cURL tests return expected responses  
✅ MongoDB contains session and message data  
✅ Error handling works correctly  
✅ All requirements are validated  
✅ No TypeScript or build errors  

## Next Steps

After successful verification:

**Task 5**: Implement Workspace Guard
- Create `src/lib/ai/workspace-guard.ts`
- Define workspace rules
- Implement intent detection
- Generate helpful messages

## Notes

- Keep the dev server running during all tests
- Use MongoDB Compass for visual data inspection
- Check server console logs for detailed error messages
- All test data is automatically cleaned up
- Session IDs are UUIDs generated by the service

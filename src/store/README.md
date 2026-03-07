# Chat Store Documentation

## Overview

The Chat Store is a Zustand-based state management solution for the Nebula AI chat application. It manages workspace-specific conversations, session persistence, and chat history.

## Features

- ✅ Workspace-specific conversations
- ✅ localStorage persistence (backward compatible)
- ✅ MongoDB session management (new)
- ✅ Auto-session creation on first message
- ✅ Chat history loading and management
- ✅ Session loading and deletion
- ✅ File upload support

## State Structure

```typescript
interface ChatState {
  // Workspace conversations (localStorage)
  conversations: WorkspaceConversations
  
  // Loading state
  isLoading: boolean
  
  // Current workspace
  currentWorkspace: string | null
  
  // NEW: Session management
  currentSessionId: string | null
  chatHistory: SessionListItem[]
  
  // Methods...
}
```

## Usage

### Basic Chat Operations

```typescript
import { useChatStore } from '@/store/chat-store'

function ChatComponent() {
  const {
    getMessages,
    sendMessage,
    isLoading,
    setWorkspace
  } = useChatStore()
  
  // Set current workspace
  setWorkspace('general_chat')
  
  // Get messages for current workspace
  const messages = getMessages()
  
  // Send a message
  await sendMessage('Hello!', 'general_chat')
}
```

### Session Management (NEW)

#### Load Chat History

```typescript
const { loadChatHistory, chatHistory } = useChatStore()

// Load user's chat history
await loadChatHistory(userId)

// Access loaded sessions
console.log(chatHistory) // Array of SessionListItem
```

#### Load Specific Session

```typescript
const { loadSession } = useChatStore()

// Load a session by ID
await loadSession(sessionId)

// Messages will be loaded into the workspace
// and currentSessionId will be updated
```

#### Create New Session

```typescript
const { createSession } = useChatStore()

// Create a new session
const sessionId = await createSession(
  userId,
  'general_chat',
  'First message' // optional
)

console.log('Created session:', sessionId)
```

#### Delete Session

```typescript
const { deleteSession } = useChatStore()

// Delete a session
await deleteSession(sessionId)

// Session will be removed from chatHistory
// and cleared from workspace if it's current
```

### Auto-Session Creation

Sessions are automatically created on the first message:

```typescript
const { sendMessage } = useChatStore()

// First message in a workspace
await sendMessage('Hello!', 'general_chat')

// Session is auto-created by API
// sessionId is automatically stored
```

### File Upload

```typescript
const { sendFileMessage } = useChatStore()

// Upload and analyze a file
await sendFileMessage(
  'Analyze this image',
  fileObject,
  'image_analyzer'
)
```

## API Methods

### Workspace Management

#### `setWorkspace(workspace: string)`
Set the current workspace and initialize if needed.

```typescript
setWorkspace('debug')
```

#### `initializeWorkspace(workspace: string)`
Initialize a workspace if it doesn't exist.

```typescript
initializeWorkspace('general_chat')
```

#### `clearWorkspace(workspace: string)`
Clear all messages and session for a workspace.

```typescript
clearWorkspace('general_chat')
```

#### `clearAllWorkspaces()`
Clear all workspaces.

```typescript
clearAllWorkspaces()
```

### Message Management

#### `getMessages(): Message[]`
Get messages for the current workspace.

```typescript
const messages = getMessages()
```

#### `getSessionId(): string | null`
Get session ID for the current workspace.

```typescript
const sessionId = getSessionId()
```

#### `addMessage(message: Message, workspace: string)`
Add a message to a specific workspace.

```typescript
addMessage({
  id: crypto.randomUUID(),
  role: 'user',
  content: 'Hello',
  timestamp: new Date()
}, 'general_chat')
```

#### `setSessionId(sessionId: string, workspace: string)`
Set session ID for a specific workspace.

```typescript
setSessionId('session-123', 'general_chat')
```

### Session Management (NEW)

#### `loadChatHistory(userId: string): Promise<void>`
Load user's chat history from API.

```typescript
await loadChatHistory('user-123')
```

**Updates:**
- `chatHistory` state with array of sessions

**API Endpoint:** `GET /api/chat/session/list?userId={userId}`

#### `loadSession(sessionId: string): Promise<void>`
Load a specific session from API.

```typescript
await loadSession('session-123')
```

**Updates:**
- `conversations[workspace]` with session messages
- `currentWorkspace` to session's workspace
- `currentSessionId` to session ID

**API Endpoint:** `GET /api/chat/session/{sessionId}`

#### `createSession(userId: string, workspace: string, firstMessage?: string): Promise<string>`
Create a new session via API.

```typescript
const sessionId = await createSession(
  'user-123',
  'general_chat',
  'Hello!'
)
```

**Returns:** Session ID

**Updates:**
- `currentSessionId` with new session ID
- Workspace session ID

**API Endpoint:** `POST /api/chat/session/create`

#### `deleteSession(sessionId: string): Promise<void>`
Delete a session via API.

```typescript
await deleteSession('session-123')
```

**Updates:**
- Removes session from `chatHistory`
- Clears workspace if it's the current session
- Resets `currentSessionId` if deleted

**API Endpoint:** `DELETE /api/chat/session/{sessionId}`

### Communication

#### `sendMessage(content: string, workspaceType: string): Promise<any>`
Send a message to a workspace.

```typescript
const response = await sendMessage('Hello!', 'general_chat')
```

**Features:**
- Auto-creates session on first message
- Updates session ID automatically
- Adds user and assistant messages to store
- Handles errors gracefully

**API Endpoint:** `POST /api/workspaces/chat`

#### `sendFileMessage(content: string, file: File, workspaceType: string): Promise<any>`
Send a file message to a workspace.

```typescript
const response = await sendFileMessage(
  'Analyze this',
  fileObject,
  'image_analyzer'
)
```

**Supports:**
- Images (PNG, JPG, JPEG)
- PDFs
- CSV files
- Excel files

**API Endpoints:**
- `POST /api/upload/presigned-url`
- Lambda endpoint for analysis

### Loading State

#### `setLoading(loading: boolean)`
Set loading state.

```typescript
setLoading(true)
```

## Data Types

### Message

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: any
}
```

### SessionListItem

```typescript
interface SessionListItem {
  sessionId: string
  title: string
  workspace: string
  createdAt: Date | string
  messageCount: number
}
```

### WorkspaceConversation

```typescript
interface WorkspaceConversation {
  messages: Message[]
  sessionId: string | null
}
```

## Persistence

### localStorage (Backward Compatible)

The store persists `conversations` to localStorage:

```typescript
{
  name: 'nebula-chat-storage',
  partialize: (state) => ({ conversations: state.conversations })
}
```

**Key:** `nebula-chat-storage`

**Persisted:**
- `conversations` object with all workspace messages

**Not Persisted:**
- `isLoading`
- `currentWorkspace`
- `currentSessionId`
- `chatHistory`

### MongoDB (NEW)

Sessions are persisted to MongoDB via API:

**Collections:**
- `chatSessions` - Session metadata
- `messages` - Individual messages

**Benefits:**
- Cross-device sync
- Persistent history
- Advanced querying
- Session management

## Backward Compatibility

The enhanced store maintains full backward compatibility:

### localStorage Chat

Users without MongoDB sessions continue to use localStorage:

```typescript
// Works exactly as before
setWorkspace('general_chat')
await sendMessage('Hello!', 'general_chat')
```

### Migration Path

Users can gradually migrate to MongoDB sessions:

1. **Automatic:** Sessions auto-created on first message
2. **Manual:** Use `createSession()` to create explicitly
3. **Optional:** Load history with `loadChatHistory()`

### No Breaking Changes

All existing methods work unchanged:
- ✅ `getMessages()`
- ✅ `sendMessage()`
- ✅ `sendFileMessage()`
- ✅ `setWorkspace()`
- ✅ `clearWorkspace()`

## Error Handling

All async methods handle errors gracefully:

```typescript
try {
  await loadChatHistory(userId)
} catch (error) {
  console.error('Failed to load history:', error)
  // chatHistory remains empty
  // App continues to work
}
```

**Error Behavior:**
- Logs errors to console
- Sets appropriate state (empty arrays, null values)
- Doesn't crash the app
- Allows fallback to localStorage

## Examples

### Complete Chat Flow

```typescript
function ChatApp() {
  const {
    setWorkspace,
    getMessages,
    sendMessage,
    loadChatHistory,
    chatHistory,
    isLoading
  } = useChatStore()
  
  useEffect(() => {
    // Set workspace
    setWorkspace('general_chat')
    
    // Load chat history
    if (userId) {
      loadChatHistory(userId)
    }
  }, [userId])
  
  const handleSend = async (content: string) => {
    try {
      await sendMessage(content, 'general_chat')
    } catch (error) {
      console.error('Send failed:', error)
    }
  }
  
  const messages = getMessages()
  
  return (
    <div>
      <ChatHistory sessions={chatHistory} />
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
```

### Session Management

```typescript
function SessionManager() {
  const {
    loadSession,
    deleteSession,
    chatHistory,
    loadChatHistory
  } = useChatStore()
  
  useEffect(() => {
    loadChatHistory(userId)
  }, [userId])
  
  const handleLoadSession = async (sessionId: string) => {
    await loadSession(sessionId)
    // Messages loaded, navigate to chat
  }
  
  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Delete this session?')) {
      await deleteSession(sessionId)
    }
  }
  
  return (
    <div>
      {chatHistory.map(session => (
        <div key={session.sessionId}>
          <h3>{session.title}</h3>
          <button onClick={() => handleLoadSession(session.sessionId)}>
            Load
          </button>
          <button onClick={() => handleDeleteSession(session.sessionId)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Requirements Satisfied

- ✅ **Requirement 3.5:** Auto-session creation on first message
- ✅ **Requirement 10.1:** Backward compatibility with localStorage
- ✅ **Requirement 10.4:** Gradual migration path

## Next Steps

1. Implement Chat History Sidebar Component (Task 12)
2. Implement File Upload Button Component (Task 13)
3. Integrate components into main chat UI (Task 14)

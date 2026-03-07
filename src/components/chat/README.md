# Chat Components

## ChatHistorySidebar

A sidebar component that displays the user's chat history organized by time periods.

### Features

- ✅ Fetches sessions using `useChatStore.loadChatHistory()`
- ✅ Time-based grouping (Today, Yesterday, Previous)
- ✅ Session click to load messages
- ✅ Session deletion with confirmation
- ✅ Loading and error states
- ✅ Active session highlighting
- ✅ Responsive design

### Usage

```tsx
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar'

function Sidebar() {
  const userId = 'user-123'
  const currentWorkspace = 'general_chat'
  
  return (
    <ChatHistorySidebar
      userId={userId}
      currentWorkspace={currentWorkspace}
      onSessionSelect={(sessionId) => {
        console.log('Session selected:', sessionId)
      }}
    />
  )
}
```

### Props

- `userId` (string, required) - User ID to load sessions for
- `currentWorkspace` (string, required) - Current workspace type
- `onSessionSelect` (function, optional) - Callback when session is clicked

### States

- **Loading**: Shows spinner while fetching sessions
- **Error**: Shows error message with retry button
- **Empty**: Shows empty state when no sessions exist
- **Loaded**: Shows grouped session lists

### Session Grouping

Sessions are grouped into three time periods:

1. **Today** - Sessions created today
2. **Yesterday** - Sessions created yesterday
3. **Previous** - Sessions older than yesterday

### Session Item

Each session displays:
- Session title (truncated if too long)
- Message count
- Delete button (visible on hover)
- Active state highlighting

### Interactions

- **Click session** - Loads session messages into chat
- **Click delete** - Shows confirmation, then deletes session
- **Hover session** - Shows delete button

### Styling

Uses Tailwind CSS with:
- Card component for container
- Hover effects for interactivity
- Active state with blue accent
- Smooth transitions
- Responsive layout

### Requirements Satisfied

- ✅ Requirement 3.1: CHAT HISTORY section in sidebar
- ✅ Requirement 3.2: Time-based grouping
- ✅ Requirement 3.3: Session click loads messages
- ✅ Requirement 3.4: Session title display

---

## FileUploadButton

A standalone file upload button component with validation and error handling.

### Features

- ✅ File picker dialog on click
- ✅ Client-side format validation
- ✅ Client-side size validation (10MB max)
- ✅ Upload progress indicator
- ✅ Error messages for invalid files
- ✅ Accessible with ARIA labels
- ✅ Keyboard navigation support

### Usage

```tsx
import { FileUploadButton } from '@/components/chat/FileUploadButton'
import { useChatStore } from '@/store/chat-store'

function ChatInterface() {
  const { sendFileMessage } = useChatStore()
  
  const handleFileSelect = async (file: File) => {
    await sendFileMessage('', file, 'general_chat')
  }
  
  return (
    <FileUploadButton
      workspace="general_chat"
      onFileSelect={handleFileSelect}
      disabled={false}
    />
  )
}
```

### Props

- `workspace` (string, required) - Current workspace type
- `onFileSelect` (function, required) - Callback when valid file is selected
- `disabled` (boolean, optional) - Disable the button
- `className` (string, optional) - Additional CSS classes

### Supported File Types

- **Documents**: PDF, TXT, DOCX
- **Data**: CSV, JSON
- **Images**: PNG, JPG, JPEG

### File Size Limit

Maximum file size: 10MB

### Validation

The component validates files before calling `onFileSelect`:

1. **Format validation** - Checks file extension
2. **Size validation** - Ensures file ≤ 10MB

If validation fails, an error message is displayed and the file is rejected.

### States

- **Idle**: Default state, ready for upload
- **Uploading**: Shows spinner and "Uploading..." message
- **Error**: Shows error message with details

### Error Messages

- **Invalid format**: Lists supported formats
- **File too large**: Shows file size and limit
- **Upload failed**: Shows error from `onFileSelect` callback

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- Focus ring on button
- Descriptive tooltips

### Styling

Uses Tailwind CSS with:
- Gray background (idle state)
- Blue background (uploading state)
- Hover effects
- Smooth transitions
- Absolute positioned error tooltips

### Requirements Satisfied

- ✅ Requirement 6.1: Upload button beside chat input
- ✅ Requirement 6.2: File picker opens on click
- ✅ Requirement 6.3: Supported file formats validation
- ✅ Requirement 6.4: Error message for unsupported formats
- ✅ Requirement 6.5: 10MB file size limit
- ✅ Requirement 6.6: Error message for oversized files

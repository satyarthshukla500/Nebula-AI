# File Upload API

## Overview

RESTful API endpoints for file upload functionality. Handles multipart form data uploads, validates files, stores in S3, and provides workspace-specific processing.

## Endpoints

### POST /api/upload/file

Upload a file with multipart form data.

**Authentication**: Required (uses `withAuth` middleware)

**Request**:
```
Content-Type: multipart/form-data

Fields:
- file: File (required)
- workspace: string (required)
- sessionId: string (optional)
```

**Response** (Success - 200):
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "s3Url": "https://bucket.s3.region.amazonaws.com/path/to/file",
    "s3Key": "uploads/userId/workspace/timestamp-uuid-filename",
    "fileName": "document.pdf",
    "fileSize": 1048576,
    "workspace": "general_chat",
    "analysis": "I've received your PDF file...",
    "metadata": {}
  }
}
```

**Error Responses**:

400 Bad Request - Missing required fields:
```json
{
  "success": false,
  "error": "File is required"
}
```

400 Bad Request - Invalid file type:
```json
{
  "success": false,
  "error": "File type not supported. Allowed types: pdf, txt, docx, csv, json, png, jpg, jpeg"
}
```

413 Payload Too Large - File exceeds 10MB:
```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 10MB"
}
```

500 Internal Server Error - Upload failed:
```json
{
  "success": false,
  "error": "File upload to storage failed. Please try again."
}
```

### GET /api/upload/file

Get user's uploaded files.

**Authentication**: Required

**Query Parameters**:
- `workspace` (optional): Filter files by workspace

**Response** (Success - 200):
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "uuid",
        "userId": "user-id",
        "fileName": "document.pdf",
        "fileType": "application/pdf",
        "fileSize": 1048576,
        "s3Key": "uploads/...",
        "s3Url": "https://...",
        "workspace": "general_chat",
        "sessionId": "session-id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

## Usage Examples

### Upload File (JavaScript/TypeScript)

```typescript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('workspace', 'general_chat')
formData.append('sessionId', currentSessionId) // optional

const response = await fetch('/api/upload/file', {
  method: 'POST',
  body: formData,
})

const result = await response.json()

if (result.success) {
  console.log('File uploaded:', result.data.fileId)
  console.log('Analysis:', result.data.analysis)
} else {
  console.error('Upload failed:', result.error)
}
```

### Upload with Progress Tracking

```typescript
const xhr = new XMLHttpRequest()

xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100
    console.log(`Upload progress: ${percentComplete}%`)
  }
})

xhr.addEventListener('load', () => {
  const result = JSON.parse(xhr.responseText)
  console.log('Upload complete:', result)
})

xhr.open('POST', '/api/upload/file')
xhr.send(formData)
```

### Get User Files

```typescript
// Get all files
const response = await fetch('/api/upload/file')
const result = await response.json()

console.log('Total files:', result.data.count)
console.log('Files:', result.data.files)

// Get files for specific workspace
const debugFiles = await fetch('/api/upload/file?workspace=debug')
const debugResult = await debugFiles.json()

console.log('Debug workspace files:', debugResult.data.files)
```

### Upload with Error Handling

```typescript
async function uploadFile(file: File, workspace: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspace', workspace)

    const response = await fetch('/api/upload/file', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!result.success) {
      // Handle specific error cases
      if (response.status === 413) {
        throw new Error('File is too large (max 10MB)')
      }
      if (response.status === 400) {
        throw new Error(result.error)
      }
      throw new Error('Upload failed')
    }

    return result.data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
```

## Supported File Types

- **Documents**: PDF, TXT, DOCX
- **Data**: CSV, JSON
- **Images**: PNG, JPG, JPEG

## File Size Limit

Maximum file size: **10MB**

## Workspace-Specific Processing

### General Chat
```
"I've received your PDF file "document.pdf" (1.5 MB). How can I help you with this file?"
```

### Debug Workspace
```
"I've received your TXT file "code.txt" (2.3 KB). I can help you debug or analyze this code."
```

### Smart Summarizer
```
"I've received your PDF document "report.pdf" (3.2 MB). I'll analyze it and provide a summary."
```

### Image Analyzer
```
"I've received your image "photo.jpg" (1.8 MB). I can analyze this image for you."
```

### Data Analyst
```
"I've received your CSV file "data.csv" (500 KB). I can help you analyze this data."
```

## Error Handling

### Client-Side Validation

Before uploading, validate on the client:

```typescript
function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['pdf', 'txt', 'docx', 'csv', 'json', 'png', 'jpg', 'jpeg']
  const maxSize = 10 * 1024 * 1024 // 10MB

  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension || !allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type not supported. Allowed: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit'
    }
  }

  return { valid: true }
}
```

### Server-Side Error Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Process upload result |
| 400 | Bad Request | Show validation error to user |
| 401 | Unauthorized | Redirect to login |
| 413 | Payload Too Large | Show file size error |
| 500 | Server Error | Show retry option |

## Testing

### Manual API Tests

```bash
# Start dev server
npm run dev

# Run API tests
npx ts-node src/app/api/upload/__tests__/file-upload-api.manual-test.ts
```

### Test Coverage

1. ✅ Upload valid text file
2. ✅ Upload PDF to smart summarizer
3. ✅ Upload with session ID
4. ✅ Upload to debug workspace
5. ✅ Upload image to image analyzer
6. ✅ Upload CSV to data analyst
7. ✅ Reject request without file
8. ✅ Reject request without workspace
9. ✅ Reject invalid file type
10. ✅ Reject file exceeding 10MB
11. ✅ Get all user files
12. ✅ Get files filtered by workspace

## Security

### Authentication
- All endpoints require authentication via `withAuth` middleware
- User ID extracted from authenticated session

### Authorization
- Users can only upload files to their own account
- Users can only retrieve their own files
- S3 keys scoped to user ID

### Validation
- File type validation (extension-based)
- File size validation (10MB limit)
- Workspace validation
- Metadata validation before MongoDB insertion

### S3 Security
- Unique keys prevent collisions
- User-scoped paths
- Workspace isolation

## Configuration

Required environment variables:

```env
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
MONGODB_URI=your-mongodb-uri
```

## Integration

### With Chat System

```typescript
// Upload file during chat
const uploadResult = await uploadFile(file, currentWorkspace)

// Send file message to chat
await sendMessage({
  content: `I've uploaded ${file.name}`,
  fileId: uploadResult.fileId,
  workspace: currentWorkspace
})
```

### With Session Management

```typescript
// Associate file with current session
const formData = new FormData()
formData.append('file', file)
formData.append('workspace', workspace)
formData.append('sessionId', currentSessionId)

const result = await fetch('/api/upload/file', {
  method: 'POST',
  body: formData,
})
```

## Requirements Satisfied

- ✅ **Requirement 7.1**: POST /api/upload/file endpoint
- ✅ **Requirement 7.2**: AWS S3 integration
- ✅ **Requirement 7.3**: MongoDB metadata storage
- ✅ **Requirement 7.4**: Error handling with appropriate status codes

## Next Steps

1. Create frontend upload button component (Task 13)
2. Integrate with chat UI (Task 14)
3. Add file preview functionality
4. Implement file deletion endpoint
5. Add file download endpoint

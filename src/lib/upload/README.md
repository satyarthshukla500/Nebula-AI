# File Upload Service

## Overview

The File Upload Service handles file uploads to AWS S3 and metadata storage in MongoDB. It provides workspace-specific file processing and validation.

## Features

- ✅ File validation (format and size)
- ✅ Upload to AWS S3 with unique keys
- ✅ Metadata storage in MongoDB
- ✅ Workspace-specific file processing
- ✅ File-session association
- ✅ User file management

## Supported File Types

- **Documents**: PDF, TXT, DOCX
- **Data**: CSV, JSON
- **Images**: PNG, JPG, JPEG

**Maximum file size**: 10MB

## Usage

### Basic Upload

```typescript
import { fileUploadService } from '@/lib/upload/file-service'

// Upload a file
const result = await fileUploadService.uploadFile(
  fileBuffer,
  'document.pdf',
  userId,
  'general_chat',
  sessionId  // optional
)

console.log('File ID:', result.fileId)
console.log('S3 URL:', result.s3Url)
```

### Validate File

```typescript
const validation = fileUploadService.validateFile('document.pdf', fileSize)

if (!validation.valid) {
  console.error('Validation error:', validation.error)
}
```

### Get File Metadata

```typescript
const metadata = await fileUploadService.getFileMetadata(fileId)

if (metadata) {
  console.log('File name:', metadata.fileName)
  console.log('Uploaded:', metadata.createdAt)
}
```

### Get User Files

```typescript
// Get all files for a user
const allFiles = await fileUploadService.getUserFiles(userId)

// Get files filtered by workspace
const workspaceFiles = await fileUploadService.getUserFiles(userId, 'debug')
```

### Process File

```typescript
const result = await fileUploadService.processFile(fileId, 'smart_summarizer')

console.log('Analysis:', result.analysis)
console.log('Metadata:', result.metadata)
```

## Workspace-Specific Processing

### General Chat
- Provides general file analysis
- Extracts basic file information

### Debug Workspace
- Analyzes code files
- Provides debugging context

### Smart Summarizer
- Generates document summaries
- Extracts key information

### Image Analyzer
- Prepares images for analysis
- Can integrate with AWS Rekognition

### Data Analyst
- Parses CSV and JSON files
- Provides data insights

## API Methods

### `validateFile(fileName: string, fileSize: number)`
Validates file format and size before upload.

**Returns**: `{ valid: boolean; error?: string }`

### `uploadFile(file: Buffer, fileName: string, userId: string, workspace: string, sessionId?: string)`
Uploads file to S3 and saves metadata to MongoDB.

**Returns**: `Promise<UploadResult>`

### `saveMetadata(metadata: FileMetadata)`
Saves file metadata to MongoDB.

**Returns**: `Promise<void>`

### `getFileMetadata(fileId: string)`
Retrieves file metadata by fileId.

**Returns**: `Promise<FileMetadata | null>`

### `getUserFiles(userId: string, workspace?: string)`
Gets all files for a user, optionally filtered by workspace.

**Returns**: `Promise<FileMetadata[]>`

### `processFile(fileId: string, workspace: string)`
Processes file based on workspace context.

**Returns**: `Promise<FileProcessingResult>`

## S3 Key Generation

S3 keys are generated with the following format:
```
uploads/{userId}/{workspace}/{timestamp}-{uuid}-{sanitizedFileName}
```

This ensures:
- ✅ Unique keys (no collisions)
- ✅ User-scoped organization
- ✅ Workspace-based grouping
- ✅ Chronological ordering

## Error Handling

The service throws descriptive errors for:
- Invalid file format
- File size exceeds limit
- S3 upload failures
- MongoDB save failures
- Invalid metadata

All errors include context for debugging.

## Configuration

Required environment variables:
```env
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
MONGODB_URI=your-mongodb-uri
```

## Testing

Run manual tests:
```bash
npx ts-node src/lib/upload/__tests__/file-service.manual-test.ts
```

Tests cover:
- File validation
- Upload to S3
- Metadata storage
- File retrieval
- Workspace processing
- S3 key uniqueness
- File-session association

## Requirements Satisfied

- ✅ **Requirement 7.1**: POST /api/upload/file endpoint support
- ✅ **Requirement 7.2**: AWS S3 integration
- ✅ **Requirement 7.3**: MongoDB metadata storage
- ✅ **Requirement 7.5**: File validation
- ✅ **Requirement 7.6**: Unique file names
- ✅ **Requirement 8.1-8.4**: Workspace-specific processing
- ✅ **Requirement 8.6**: File-session association

## Architecture

```
FileUploadService
├── Validation
│   ├── validateFile()
│   └── validateFileMetadata()
├── Upload
│   ├── uploadFile()
│   └── uploadToS3()
├── Metadata
│   ├── saveMetadata()
│   ├── getFileMetadata()
│   └── getUserFiles()
└── Processing
    ├── processFile()
    ├── processGeneralFile()
    ├── processCodeFile()
    ├── processDocumentForSummary()
    ├── processImageFile()
    └── processDataFile()
```

## Next Steps

1. Implement API route (Task 9)
2. Create frontend upload button (Task 13)
3. Integrate with chat UI (Task 14)
4. Add advanced file processing (OCR, text extraction)
5. Implement file preview functionality

# Image Upload and Analysis Feature

## Overview

The Nebula AI Debug Workspace now supports image upload and analysis integrated directly into the chat interface. Users can upload images, which are automatically analyzed using AWS Rekognition and Claude AI, with results displayed in the chat.

## Features

✅ Image upload button in Debug Workspace chat  
✅ Support for JPG, JPEG, PNG, and WebP formats  
✅ Image preview before sending  
✅ Automatic upload to S3 bucket (nebula-ai-2026)  
✅ Image analysis via Lambda (Rekognition + Claude)  
✅ Rich response display with labels and AI explanation  
✅ Seamless integration with existing chat functionality  

## User Flow

1. **Upload Image**
   - Click the image icon button next to the chat input
   - Select an image file (JPG, PNG, or WebP, max 5MB)
   - Preview appears above the input field

2. **Add Message (Optional)**
   - Type an optional message to accompany the image
   - Or send the image without a message

3. **Send**
   - Click Send button
   - Image uploads to S3 with unique timestamp filename
   - Lambda analyzes the image
   - AI response appears in chat with:
     - Uploaded image display
     - Detected labels (tags)
     - AI explanation

## Technical Implementation

### Components Modified

#### 1. ChatInput Component (`src/components/chat/ChatInput.tsx`)
**New Features:**
- Image upload button with file input
- Image preview with remove option
- File validation (type and size)
- Support for sending message with or without image

**Props:**
```typescript
interface ChatInputProps {
  onSend: (message: string, image?: File) => void
  disabled?: boolean
  enableImageUpload?: boolean  // New prop
}
```

#### 2. MessageBubble Component (`src/components/chat/MessageBubble.tsx`)
**New Features:**
- Detects image analysis responses
- Displays uploaded image
- Shows detected labels as tags
- Renders AI explanation

**Metadata Structure:**
```typescript
interface ImageAnalysisMetadata {
  type: 'image-analysis'
  image: string              // S3 filename
  imageUrl: string           // S3 public URL
  labels: string[]           // Detected labels
  ai_explanation: string     // AI analysis text
}
```

#### 3. ChatContainer Component (`src/components/chat/ChatContainer.tsx`)
**New Features:**
- Passes `enableImageUpload` prop to ChatInput
- Handles both text and image messages
- Routes to appropriate send function

**Props:**
```typescript
interface ChatContainerProps {
  workspaceType: string
  systemPrompt?: string
  enableImageUpload?: boolean  // New prop
}
```

#### 4. Chat Store (`src/store/chat-store.ts`)
**New Function:**
```typescript
sendImageMessage: (content: string, image: File, workspaceType: string) => Promise<any>
```

**Process:**
1. Add user message to chat
2. Generate unique S3 filename: `image-{timestamp}.{ext}`
3. Get presigned upload URL from `/api/upload/presigned-url`
4. Upload image to S3
5. Send analysis request to Lambda with filename
6. Parse Lambda response
7. Add assistant message with image analysis metadata

### API Integration

#### S3 Upload
**Endpoint:** `/api/upload/presigned-url`
**Method:** POST
**Request:**
```json
{
  "fileName": "image-1728374620.jpg",
  "fileType": "image/jpeg",
  "workspaceType": "debug"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "fileUrl": "https://nebula-ai-2026.s3.us-east-1.amazonaws.com/...",
    "key": "uploads/user-id/debug/image-1728374620.jpg"
  }
}
```

#### Lambda Image Analysis
**Endpoint:** `NEXT_PUBLIC_LAMBDA_ENDPOINT`
**Method:** POST
**Request:**
```json
{
  "image": "image-1728374620.jpg"
}
```

**Response:**
```json
{
  "type": "image-analysis",
  "image": "image-1728374620.jpg",
  "labels": ["Dog", "Animal", "Pet", "Golden Retriever"],
  "ai_explanation": "This image shows a golden retriever dog..."
}
```

### Environment Variables

Added to `.env.local`:
```env
# Lambda endpoint for image analysis (public - accessible from browser)
NEXT_PUBLIC_LAMBDA_ENDPOINT=https://o27lmekll4fj73lutcrc2vhonm0ambhq.lambda-url.us-east-1.on.aws/
```

### File Naming Convention

Images are uploaded with unique timestamp-based names:
```
Format: image-{timestamp}.{extension}
Example: image-1728374620.jpg
```

This ensures:
- No filename conflicts
- Easy chronological sorting
- Simple reference in Lambda requests

## UI/UX Details

### Image Upload Button
- **Icon:** Camera/image icon
- **Location:** Between textarea and microphone button
- **States:**
  - Default: Gray background
  - Selected: Blue background (indicates image selected)
  - Disabled: Grayed out when chat is loading

### Image Preview
- **Display:** Above chat input
- **Size:** Max height 128px, maintains aspect ratio
- **Border:** 2px gray border with rounded corners
- **Remove:** Red X button in top-right corner

### Message Display

**User Message:**
- Shows "📷 Image uploaded" if no text provided
- Shows custom text if provided

**Assistant Response:**
- Uploaded image (clickable, full size)
- Detected labels as blue pill-shaped tags
- AI explanation in regular text format
- Timestamp at bottom

## File Validation

### Supported Formats
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

### Size Limit
- Maximum: 5MB
- Error shown if exceeded

### Error Handling
- Invalid file type: "Please select a valid image file (JPG, PNG, or WebP)"
- File too large: "Image size must be less than 5MB"
- Upload failure: "Failed to get upload URL"
- Analysis failure: "Failed to analyze image. Please try again."

## Integration Points

### Existing Features Preserved
✅ Text chat functionality unchanged  
✅ Voice input still works  
✅ Text-to-speech for AI responses  
✅ Workspace-specific conversations  
✅ Message history persistence  
✅ Session management  

### New Capabilities
✅ Mixed text and image messages  
✅ Image analysis in chat context  
✅ Visual feedback for uploads  
✅ Rich media responses  

## Testing Checklist

- [ ] Upload JPG image
- [ ] Upload PNG image
- [ ] Upload WebP image
- [ ] Try uploading file > 5MB (should show error)
- [ ] Try uploading non-image file (should show error)
- [ ] Upload image without message
- [ ] Upload image with message
- [ ] Remove image before sending
- [ ] Verify image appears in S3 bucket
- [ ] Verify Lambda receives correct filename
- [ ] Verify labels display correctly
- [ ] Verify AI explanation displays
- [ ] Verify uploaded image displays in response
- [ ] Test with voice input disabled
- [ ] Test with chat loading state
- [ ] Verify message history persists

## Lambda Requirements

The Lambda function must:

1. **Accept POST requests** with:
```json
{
  "image": "image-1728374620.jpg"
}
```

2. **Process the image:**
   - Fetch from S3 bucket: `nebula-ai-2026`
   - Run Rekognition label detection
   - Generate AI explanation using Claude

3. **Return response:**
```json
{
  "type": "image-analysis",
  "image": "image-1728374620.jpg",
  "labels": ["Label1", "Label2", "Label3"],
  "ai_explanation": "Detailed AI analysis of the image..."
}
```

## S3 Bucket Configuration

**Bucket Name:** `nebula-ai-2026`
**Region:** `us-east-1`

**Required Permissions:**
- `s3:PutObject` - Upload images
- `s3:GetObject` - Retrieve images for Lambda
- `s3:GetObjectAcl` - Check object permissions

**CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

## Security Considerations

### File Validation
- Client-side: File type and size validation
- Server-side: Additional validation in presigned URL generation

### S3 Security
- Presigned URLs expire after 1 hour
- User-specific upload paths: `uploads/{userId}/{workspace}/`
- No public write access to bucket

### Lambda Security
- Only accepts image filenames (not full paths)
- Validates file exists in S3 before processing
- Rate limiting recommended

## Future Enhancements

Potential improvements:
- [ ] Support for multiple image uploads
- [ ] Image editing before upload (crop, rotate)
- [ ] Drag-and-drop image upload
- [ ] Paste image from clipboard
- [ ] Image comparison feature
- [ ] OCR text extraction
- [ ] Object detection with bounding boxes
- [ ] Face detection and analysis
- [ ] Image similarity search

## Troubleshooting

### Image Upload Fails
**Symptoms:** Error message "Failed to get upload URL"
**Solutions:**
- Check AWS credentials in `.env.local`
- Verify S3 bucket exists and is accessible
- Check presigned URL API endpoint

### Lambda Analysis Fails
**Symptoms:** Error message "Failed to analyze image"
**Solutions:**
- Verify `NEXT_PUBLIC_LAMBDA_ENDPOINT` is set correctly
- Check Lambda function is deployed and running
- Verify Lambda has S3 read permissions
- Check Lambda logs in CloudWatch

### Image Not Displaying
**Symptoms:** Broken image in chat response
**Solutions:**
- Verify S3 bucket CORS configuration
- Check image URL in response metadata
- Ensure S3 object is publicly readable or use presigned URLs

### Labels Not Showing
**Symptoms:** No labels displayed in response
**Solutions:**
- Check Lambda response format matches expected structure
- Verify Rekognition is returning labels
- Check metadata parsing in MessageBubble component

## Files Modified

1. `src/components/chat/ChatInput.tsx` - Added image upload UI
2. `src/components/chat/MessageBubble.tsx` - Added image analysis display
3. `src/components/chat/ChatContainer.tsx` - Added image message handling
4. `src/store/chat-store.ts` - Added sendImageMessage function
5. `src/app/dashboard/workspaces/debug/page.tsx` - Enabled image upload
6. `.env.local` - Added NEXT_PUBLIC_LAMBDA_ENDPOINT

## Summary

The image upload feature seamlessly integrates with Nebula AI's existing chat system, providing users with powerful image analysis capabilities without disrupting the text chat experience. The implementation follows best practices for file handling, security, and user experience.

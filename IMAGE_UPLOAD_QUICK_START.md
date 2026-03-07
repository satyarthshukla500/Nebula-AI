# Image Upload Feature - Quick Start Guide

## For Users

### How to Upload and Analyze Images

1. **Navigate to Debug Workspace**
   - Go to Dashboard → Debug Workspace

2. **Click the Image Button**
   - Look for the camera/image icon next to the message input
   - Click to open file selector

3. **Select Your Image**
   - Choose JPG, PNG, or WebP file (max 5MB)
   - Preview appears above the input

4. **Add Message (Optional)**
   - Type a message if you want
   - Or just send the image alone

5. **Click Send**
   - Image uploads to cloud storage
   - AI analyzes the image
   - Results appear in chat with:
     - Your uploaded image
     - Detected objects/labels
     - AI explanation

### Supported Formats
- ✅ JPG/JPEG
- ✅ PNG
- ✅ WebP
- ❌ GIF (not supported)
- ❌ BMP (not supported)

### File Size Limit
- Maximum: 5MB
- Recommended: Under 2MB for faster uploads

## For Developers

### Quick Integration

To enable image upload in any workspace:

```typescript
<ChatContainer 
  workspaceType="your-workspace" 
  enableImageUpload={true}  // Add this prop
/>
```

### Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_LAMBDA_ENDPOINT=https://your-lambda-url.lambda-url.us-east-1.on.aws/
```

### Lambda Endpoint Requirements

**Request:**
```json
POST https://your-lambda-url/
{
  "image": "image-1728374620.jpg"
}
```

**Response:**
```json
{
  "type": "image-analysis",
  "image": "image-1728374620.jpg",
  "labels": ["Dog", "Animal", "Pet"],
  "ai_explanation": "This image shows..."
}
```

### Testing Locally

1. **Start Development Server**
   ```bash
   cd nebula-ai-fullstack
   npm run dev
   ```

2. **Navigate to Debug Workspace**
   ```
   http://localhost:3000/dashboard/workspaces/debug
   ```

3. **Test Image Upload**
   - Click image button
   - Select test image
   - Click Send
   - Verify upload and response

### Troubleshooting

**Image button not visible?**
- Check `enableImageUpload={true}` is set
- Verify component is using updated ChatContainer

**Upload fails?**
- Check AWS credentials in `.env.local`
- Verify S3 bucket exists: `nebula-ai-2026`
- Check presigned URL API is working

**Analysis fails?**
- Verify `NEXT_PUBLIC_LAMBDA_ENDPOINT` is set
- Check Lambda function is deployed
- Verify Lambda has S3 read permissions

**Image not displaying?**
- Check S3 CORS configuration
- Verify image URL in response
- Check browser console for errors

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (User UI)  │
└──────┬──────┘
       │ 1. Select Image
       ↓
┌─────────────┐
│  ChatInput  │
│  Component  │
└──────┬──────┘
       │ 2. Preview & Send
       ↓
┌─────────────┐
│ Chat Store  │
│sendImageMsg │
└──────┬──────┘
       │ 3. Get Presigned URL
       ↓
┌─────────────┐
│   Next.js   │
│  API Route  │
└──────┬──────┘
       │ 4. Generate URL
       ↓
┌─────────────┐
│     S3      │
│   Bucket    │
└──────┬──────┘
       │ 5. Upload Image
       ↓
┌─────────────┐
│   Lambda    │
│  Function   │
└──────┬──────┘
       │ 6. Analyze (Rekognition + Claude)
       ↓
┌─────────────┐
│ MessageBubble│
│  Component  │
└──────┬──────┘
       │ 7. Display Results
       ↓
┌─────────────┐
│   Browser   │
│  (Results)  │
└─────────────┘
```

## Key Features

### For Users
- 📸 Easy image upload with preview
- 🏷️ Automatic label detection
- 🤖 AI-powered image analysis
- 💬 Integrated with chat history
- ⚡ Fast and responsive

### For Developers
- 🔧 Simple prop-based activation
- 🔒 Secure S3 upload with presigned URLs
- 📦 Modular component design
- 🎨 Consistent UI styling
- 🛡️ Built-in error handling

## Example Use Cases

1. **Code Debugging**
   - Upload screenshot of error
   - AI identifies the issue
   - Get debugging suggestions

2. **UI/UX Review**
   - Upload design mockup
   - Get feedback on elements
   - Identify accessibility issues

3. **Data Visualization**
   - Upload chart or graph
   - AI explains the data
   - Get insights and trends

4. **General Image Analysis**
   - Upload any image
   - Get object detection
   - Receive detailed description

## Performance Tips

### For Best Results
- Use clear, well-lit images
- Avoid extremely large files
- Compress images before upload if possible
- Use standard formats (JPG, PNG)

### Optimization
- Images are stored with unique names
- Presigned URLs expire after 1 hour
- Lambda processes images asynchronously
- Results cached in chat history

## Security Notes

- ✅ Client-side file validation
- ✅ Server-side validation
- ✅ Presigned URLs (time-limited)
- ✅ User-specific upload paths
- ✅ No public write access to S3

## Support

For issues or questions:
1. Check `IMAGE_UPLOAD_FEATURE.md` for detailed documentation
2. Review browser console for errors
3. Check Lambda CloudWatch logs
4. Verify S3 bucket permissions

## What's Next?

Potential enhancements:
- Multiple image uploads
- Image editing tools
- Drag-and-drop support
- Clipboard paste
- OCR text extraction
- Object detection with bounding boxes

---

**Status:** ✅ Feature Complete  
**Version:** 1.0  
**Last Updated:** 2026-03-07

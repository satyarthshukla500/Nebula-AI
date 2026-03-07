# Task 10 Verification Guide: File Upload Functionality

## Overview

This guide provides step-by-step instructions to verify that the file upload functionality is properly implemented and working correctly.

## Automated Verification

### Step 1: Run Verification Script

**Windows (PowerShell):**
```powershell
.\verify-task-10.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x verify-task-10.sh
./verify-task-10.sh
```

The script checks:
1. ✅ FileUploadService implementation exists
2. ✅ API endpoint exists
3. ✅ File schema exists
4. ✅ Service tests exist
5. ✅ API tests exist
6. ✅ Service has all required methods
7. ✅ API has POST and GET handlers
8. ✅ TypeScript compilation passes
9. ✅ Documentation exists
10. ✅ Completion summaries exist

## Prerequisites

Before testing, ensure:

### 1. MongoDB Configuration

Check `.env.local` has:
```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=nebula-ai
```

Test MongoDB connection:
```bash
# MongoDB should be accessible
# Check connection in MongoDB Compass or CLI
```

### 2. AWS S3 Configuration

Check `.env.local` has:
```env
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

Test S3 access:
```bash
# Ensure bucket exists and credentials are valid
# Test with AWS CLI: aws s3 ls s3://your-bucket-name
```

### 3. Development Server

Start the dev server:
```bash
npm run dev
```

Wait for server to start on `http://localhost:3000`

## Manual Testing

### Step 2: Run Service Tests

Test the FileUploadService directly:

```bash
npx ts-node src/lib/upload/__tests__/file-service.manual-test.ts
```

**Expected Results:**
- ✅ Test 1: Validate valid PDF file
- ✅ Test 2: Reject file exceeding 10MB
- ✅ Test 3: Reject invalid file format
- ✅ Test 4: Accept all allowed file formats
- ✅ Test 5: Upload file to S3 and save metadata
- ✅ Test 6: Retrieve file metadata by fileId
- ✅ Test 7: Get all files for user
- ✅ Test 8: Get files filtered by workspace
- ✅ Test 9: Process file in general chat workspace
- ✅ Test 10: Process file in debug workspace
- ✅ Test 11: Process file in smart summarizer workspace
- ✅ Test 12: S3 keys are unique for same filename
- ✅ Test 13: File associated with session
- ✅ Test 14: Reject invalid metadata
- ✅ Test 15: Return null for non-existent file

**Success Criteria:** All 15 tests pass

### Step 3: Run API Tests

Test the API endpoints:

```bash
npx ts-node src/app/api/upload/__tests__/file-upload-api.manual-test.ts
```

**Expected Results:**
- ✅ Test 1: Upload valid text file
- ✅ Test 2: Upload PDF to smart summarizer
- ✅ Test 3: Upload with session ID
- ✅ Test 4: Upload to debug workspace
- ✅ Test 5: Upload image to image analyzer
- ✅ Test 6: Upload CSV to data analyst
- ✅ Test 7: Reject request without file
- ✅ Test 8: Reject request without workspace
- ✅ Test 9: Reject invalid file type
- ✅ Test 10: Reject file exceeding 10MB
- ✅ Test 11: Get all user files
- ✅ Test 12: Get files filtered by workspace

**Success Criteria:** All 12 tests pass

### Step 4: Test File Type Validation

Test each supported file type:

#### PDF Files
```bash
# Create test PDF
echo "PDF test content" > test.pdf

# Upload via API (use Postman or curl)
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.pdf" \
  -F "workspace=smart_summarizer"
```

**Expected:** Success with summarization analysis

#### Text Files
```bash
# Create test TXT
echo "Text file content" > test.txt

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.txt" \
  -F "workspace=general_chat"
```

**Expected:** Success with general chat analysis

#### CSV Files
```bash
# Create test CSV
echo "name,age,city\nJohn,30,NYC" > test.csv

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.csv" \
  -F "workspace=data_analyst"
```

**Expected:** Success with data analysis message

#### JSON Files
```bash
# Create test JSON
echo '{"test": "data"}' > test.json

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.json" \
  -F "workspace=data_analyst"
```

**Expected:** Success with data analysis message

#### Image Files
```bash
# Use existing image or create test image
# Upload PNG
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.png" \
  -F "workspace=image_analyzer"
```

**Expected:** Success with image analysis message

### Step 5: Test File Size Validation

#### Valid Size (< 10MB)
```bash
# Create 5MB file
dd if=/dev/zero of=valid.txt bs=1M count=5

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@valid.txt" \
  -F "workspace=general_chat"
```

**Expected:** Success

#### Invalid Size (> 10MB)
```bash
# Create 11MB file
dd if=/dev/zero of=toolarge.txt bs=1M count=11

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@toolarge.txt" \
  -F "workspace=general_chat"
```

**Expected:** 413 Payload Too Large error

### Step 6: Test Format Validation

#### Invalid Format
```bash
# Create .exe file
echo "fake exe" > malware.exe

# Upload
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@malware.exe" \
  -F "workspace=general_chat"
```

**Expected:** 400 Bad Request with "not supported" error

### Step 7: Test Workspace-Specific Processing

Test each workspace type:

#### General Chat
```bash
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@test.pdf" \
  -F "workspace=general_chat"
```

**Expected Analysis:**
```
"I've received your PDF file "test.pdf" (XXX KB). How can I help you with this file?"
```

#### Debug Workspace
```bash
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@code.txt" \
  -F "workspace=debug"
```

**Expected Analysis:**
```
"I've received your TXT file "code.txt" (XXX KB). I can help you debug or analyze this code."
```

#### Smart Summarizer
```bash
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@document.pdf" \
  -F "workspace=smart_summarizer"
```

**Expected Analysis:**
```
"I've received your PDF document "document.pdf" (XXX KB). I'll analyze it and provide a summary."
```

#### Image Analyzer
```bash
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@photo.jpg" \
  -F "workspace=image_analyzer"
```

**Expected Analysis:**
```
"I've received your image "photo.jpg" (XXX KB). I can analyze this image for you."
```

#### Data Analyst
```bash
curl -X POST http://localhost:3000/api/upload/file \
  -F "file=@data.csv" \
  -F "workspace=data_analyst"
```

**Expected Analysis:**
```
"I've received your CSV file "data.csv" (XXX KB). I can help you analyze this data."
```

### Step 8: Test S3 Storage

After uploading files, verify S3 storage:

1. **Check S3 Bucket:**
   - Files should be in `uploads/{userId}/{workspace}/` path
   - Filenames should have format: `{timestamp}-{uuid}-{filename}`

2. **Verify S3 URLs:**
   - URLs should be accessible
   - Format: `https://{bucket}.s3.{region}.amazonaws.com/{key}`

3. **Check File Uniqueness:**
   - Upload same file twice
   - Verify different S3 keys generated

### Step 9: Test MongoDB Metadata

Verify metadata storage in MongoDB:

1. **Connect to MongoDB:**
   ```bash
   # Using MongoDB Compass or CLI
   ```

2. **Check files collection:**
   ```javascript
   db.files.find().pretty()
   ```

3. **Verify metadata fields:**
   - fileId (UUID)
   - userId
   - fileName
   - fileType
   - fileSize
   - s3Key
   - s3Url
   - workspace
   - sessionId (if provided)
   - createdAt

4. **Check indexes:**
   ```javascript
   db.files.getIndexes()
   ```

   Expected indexes:
   - `{ userId: 1, createdAt: -1 }`
   - `{ fileId: 1 }` (unique)
   - `{ sessionId: 1 }` (sparse)
   - `{ workspace: 1, userId: 1 }`

### Step 10: Test GET Endpoint

#### Get All User Files
```bash
curl http://localhost:3000/api/upload/file
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "files": [...],
    "count": 5
  }
}
```

#### Get Files by Workspace
```bash
curl "http://localhost:3000/api/upload/file?workspace=debug"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "files": [...],
    "count": 2
  }
}
```

## Verification Checklist

### Core Functionality
- [ ] File validation works (format and size)
- [ ] Files upload to S3 successfully
- [ ] Metadata saves to MongoDB
- [ ] S3 keys are unique
- [ ] File retrieval works
- [ ] Workspace filtering works

### File Types
- [ ] PDF files upload successfully
- [ ] TXT files upload successfully
- [ ] DOCX files upload successfully
- [ ] CSV files upload successfully
- [ ] JSON files upload successfully
- [ ] PNG images upload successfully
- [ ] JPG images upload successfully

### Validation
- [ ] Files > 10MB are rejected (413)
- [ ] Invalid formats are rejected (400)
- [ ] Missing file is rejected (400)
- [ ] Missing workspace is rejected (400)

### Workspace Processing
- [ ] General chat returns appropriate message
- [ ] Debug workspace returns debug message
- [ ] Smart summarizer returns summary message
- [ ] Image analyzer returns image message
- [ ] Data analyst returns data message

### Storage
- [ ] Files stored in correct S3 path
- [ ] S3 URLs are accessible
- [ ] MongoDB metadata is complete
- [ ] Indexes are created

### API Endpoints
- [ ] POST /api/upload/file works
- [ ] GET /api/upload/file works
- [ ] GET with workspace filter works
- [ ] Error responses have correct status codes

### Code Quality
- [ ] TypeScript compilation passes
- [ ] No linting errors
- [ ] All tests pass
- [ ] Documentation is complete

## Troubleshooting

### Issue: S3 Upload Fails

**Solution:**
1. Check AWS credentials in `.env.local`
2. Verify bucket exists and is accessible
3. Check IAM permissions for S3 PutObject
4. Review error logs for specific S3 error

### Issue: MongoDB Save Fails

**Solution:**
1. Check MongoDB connection string
2. Verify database is accessible
3. Check collection permissions
4. Review error logs for MongoDB error

### Issue: File Validation Fails

**Solution:**
1. Check file extension is in allowed list
2. Verify file size is under 10MB
3. Review validation error message
4. Check file.schema.ts for validation rules

### Issue: Tests Fail

**Solution:**
1. Ensure dev server is running
2. Check MongoDB and S3 are configured
3. Verify user is authenticated
4. Review test output for specific failures

## Success Criteria

Task 10 is complete when:

1. ✅ All automated checks pass
2. ✅ All service tests pass (15/15)
3. ✅ All API tests pass (12/12)
4. ✅ All file types upload successfully
5. ✅ File size validation works
6. ✅ Format validation works
7. ✅ S3 storage verified
8. ✅ MongoDB metadata verified
9. ✅ Workspace processing works
10. ✅ No TypeScript errors
11. ✅ Build succeeds
12. ✅ Documentation is complete

## Next Steps

After Task 10 verification is complete:

1. Mark Task 10 as complete in tasks.md
2. Proceed to Task 11: Enhance Zustand Chat Store
3. Continue with the implementation plan

## Additional Resources

- **FileUploadService:** `src/lib/upload/file-service.ts`
- **API Endpoint:** `src/app/api/upload/file/route.ts`
- **File Schema:** `src/lib/db/schemas/file.schema.ts`
- **Service README:** `src/lib/upload/README.md`
- **API README:** `src/app/api/upload/README.md`
- **Task 8 Summary:** `TASK_8_COMPLETION_SUMMARY.md`
- **Task 9 Summary:** `TASK_9_COMPLETION_SUMMARY.md`

# AWS Setup Guide for Nebula AI

## Prerequisites
- AWS Account (sign up at https://aws.amazon.com if you don't have one)
- Credit card (required for AWS, but free tier covers development)

---

## Step 1: Create AWS Account (If You Don't Have One)

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process:
   - Enter email and account name
   - Provide contact information
   - Enter payment information (credit card required)
   - Verify phone number
   - Choose "Basic Support - Free" plan
4. Wait for account activation (usually instant)

---

## Step 2: Create IAM User (IMPORTANT - Don't Use Root Account!)

### 2.1 Access IAM Console
1. Sign in to AWS Console: https://console.aws.amazon.com
2. Search for "IAM" in the top search bar
3. Click "IAM" to open the IAM dashboard

### 2.2 Create New User
1. Click "Users" in the left sidebar
2. Click "Create user" button
3. Enter user name: `nebula-ai-service`
4. Click "Next"

### 2.3 Set Permissions
1. Select "Attach policies directly"
2. Search and select these policies:
   - ✅ `AmazonBedrockFullAccess`
   - ✅ `AmazonS3FullAccess`
   - ✅ `AmazonRekognitionFullAccess`
   - ✅ `AmazonTranscribeFullAccess`
3. Click "Next"
4. Review and click "Create user"

### 2.4 Create Access Keys
1. Click on the user you just created (`nebula-ai-service`)
2. Go to "Security credentials" tab
3. Scroll down to "Access keys" section
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next"
7. (Optional) Add description: "Nebula AI Application"
8. Click "Create access key"

### 2.5 Save Your Credentials
**⚠️ CRITICAL: Save these immediately - you won't see them again!**

You'll see:
- **Access key ID**: Starts with `AKIA...`
- **Secret access key**: Long random string

**Save these to a secure location!**

---

## Step 3: Enable AWS Bedrock (AI Models)

### 3.1 Access Bedrock Console
1. In AWS Console, search for "Bedrock"
2. Click "Amazon Bedrock"
3. **Important**: Select region **us-east-1** (N. Virginia) from top-right dropdown

### 3.2 Request Model Access
1. Click "Model access" in the left sidebar
2. Click "Manage model access" button (orange button)
3. Find and enable these models:
   - ✅ **Anthropic Claude 3 Sonnet** (recommended)
   - ✅ **Anthropic Claude 3 Haiku** (faster, cheaper)
4. Click "Request model access" button
5. Wait for approval (usually instant - status will change to "Access granted")

### 3.3 Verify Access
- Status should show "Access granted" with green checkmark
- If pending, wait 1-2 minutes and refresh

---

## Step 4: Create S3 Bucket (File Storage)

### 4.1 Access S3 Console
1. Search for "S3" in AWS Console
2. Click "S3"
3. Click "Create bucket" button

### 4.2 Configure Bucket
1. **Bucket name**: `nebula-ai-uploads-[your-name]` (must be globally unique)
   - Example: `nebula-ai-uploads-john123`
   - Use lowercase, numbers, and hyphens only
2. **Region**: Select **us-east-1** (same as Bedrock)
3. **Block Public Access**: Keep all 4 checkboxes CHECKED (we'll use presigned URLs)
4. **Bucket Versioning**: Enable (optional, for backup)
5. **Encryption**: Keep default (SSE-S3)
6. Click "Create bucket"

### 4.3 Configure CORS
1. Click on your newly created bucket
2. Go to "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3001", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click "Save changes"

---

## Step 5: Update Environment Variables

Now update your `.env.local` file with the AWS credentials:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET_NAME=nebula-ai-uploads-your-name
AWS_S3_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_BEDROCK_MODEL_REGION=us-east-1
```

**Replace**:
- `AKIA...your-access-key-id` → Your actual Access Key ID
- `your-secret-access-key-here` → Your actual Secret Access Key
- `nebula-ai-uploads-your-name` → Your actual S3 bucket name

---

## Step 6: Test AWS Connection

### 6.1 Restart Development Server
```bash
# Stop the server (Ctrl+C in terminal)
# Start it again
npm run dev
```

### 6.2 Test AI Chat
1. Go to http://localhost:3001
2. Login (use demo credentials)
3. Go to Dashboard
4. Click "General Chat" workspace
5. Try sending a message
6. You should get an AI response from Claude!

---

## Verification Checklist

### ✅ IAM User
- [ ] User created: `nebula-ai-service`
- [ ] Policies attached (Bedrock, S3, Rekognition, Transcribe)
- [ ] Access keys created and saved

### ✅ Bedrock
- [ ] Region set to us-east-1
- [ ] Claude 3 Sonnet access granted
- [ ] Status shows "Access granted"

### ✅ S3
- [ ] Bucket created with unique name
- [ ] Region is us-east-1
- [ ] CORS configured
- [ ] Public access blocked

### ✅ Environment Variables
- [ ] AWS_ACCESS_KEY_ID set
- [ ] AWS_SECRET_ACCESS_KEY set
- [ ] AWS_S3_BUCKET_NAME set
- [ ] AWS_REGION set to us-east-1
- [ ] Server restarted

---

## Troubleshooting

### Issue: "Access Denied" Error
**Cause**: IAM user doesn't have correct permissions

**Solution**:
1. Go to IAM → Users → nebula-ai-service
2. Click "Add permissions" → "Attach policies directly"
3. Verify all 4 policies are attached
4. Wait 1-2 minutes for changes to propagate

### Issue: "Model Not Found" Error
**Cause**: Bedrock model access not granted or wrong region

**Solution**:
1. Go to Bedrock console
2. Verify region is **us-east-1** (top-right)
3. Check "Model access" shows "Access granted"
4. If pending, wait and refresh

### Issue: "Bucket Not Found" Error
**Cause**: Bucket name mismatch or wrong region

**Solution**:
1. Go to S3 console
2. Verify bucket exists
3. Check bucket name matches `.env.local` exactly
4. Verify bucket region is us-east-1

### Issue: "Invalid Credentials" Error
**Cause**: Wrong access keys in `.env.local`

**Solution**:
1. Verify no extra spaces in `.env.local`
2. Check access key starts with `AKIA`
3. Verify secret key is the full string
4. If lost, create new access keys in IAM

### Issue: CORS Error on File Upload
**Cause**: CORS not configured or wrong origin

**Solution**:
1. Go to S3 bucket → Permissions → CORS
2. Verify `http://localhost:3001` is in AllowedOrigins
3. Save and try again

---

## Cost Estimates

### Free Tier (First 12 Months):
- **Bedrock**: First 2 months free (limited tokens)
- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **Rekognition**: 5,000 images/month
- **Transcribe**: 60 minutes/month

### After Free Tier (Approximate):
- **Bedrock Claude 3 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **S3**: ~$0.023 per GB/month
- **Rekognition**: ~$1 per 1,000 images
- **Transcribe**: ~$0.024 per minute

**Estimated monthly cost for development**: $5-20/month

---

## Security Best Practices

### ✅ DO:
- Use IAM user (not root account)
- Keep access keys in `.env.local` (never commit to git)
- Use least-privilege permissions
- Rotate access keys regularly
- Enable MFA on root account

### ❌ DON'T:
- Share access keys publicly
- Commit `.env.local` to version control
- Use root account credentials in app
- Give full admin access to IAM user
- Hardcode credentials in source code

---

## Next Steps After AWS Setup

1. ✅ Test AI chat in General Chat workspace
2. ✅ Try file upload in any workspace
3. ✅ Test image analysis in Cyber Safety
4. Set up Supabase for authentication
5. Set up MongoDB for conversation history
6. Deploy to production

---

## Quick Reference

### AWS Console URLs:
- **Main Console**: https://console.aws.amazon.com
- **IAM**: https://console.aws.amazon.com/iam
- **Bedrock**: https://console.aws.amazon.com/bedrock
- **S3**: https://s3.console.aws.amazon.com

### Regions:
- **Primary**: us-east-1 (N. Virginia)
- **Alternative**: us-west-2 (Oregon)

### Model IDs:
- **Claude 3 Sonnet**: `anthropic.claude-3-sonnet-20240229-v1:0`
- **Claude 3 Haiku**: `anthropic.claude-3-haiku-20240307-v1:0`

---

**Need Help?** Check the troubleshooting section or AWS documentation at https://docs.aws.amazon.com

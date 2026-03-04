# Nebula AI - Complete Setup Guide

This guide will walk you through setting up all required services for Nebula AI.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)
- Credit card for AWS (free tier available)

---

## 1. Supabase Setup (Database + Authentication)

### Step 1.1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"
5. Fill in:
   - **Name**: nebula-ai
   - **Database Password**: (generate a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
6. Click "Create new project"
7. Wait 2-3 minutes for project to initialize

### Step 1.2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)
3. Copy **Project ID** from **Settings** → **General** → `SUPABASE_PROJECT_ID`

### Step 1.3: Configure Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure SMTP (required for email verification):

**Option A: Use Supabase's SMTP (Easiest)**
- Already configured by default
- Limited to 3 emails/hour on free tier
- Good for development

**Option B: Use Custom SMTP (Recommended for Production)**
- Go to **Settings** → **Auth** → **SMTP Settings**
- Enable "Enable Custom SMTP"
- Fill in your SMTP details:
  - **Gmail**: smtp.gmail.com, port 587
  - **SendGrid**: smtp.sendgrid.net, port 587
  - **AWS SES**: email-smtp.region.amazonaws.com, port 587

**Gmail Setup (for development):**
1. Enable 2FA on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: your-email@gmail.com
   - Password: (app password)

4. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" template if needed

### Step 1.4: Run Database Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
cd nebula-ai-fullstack
supabase link --project-ref your-project-id
```

4. Run migrations:
```bash
supabase db push
```

Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` via:
- Supabase Dashboard → **SQL Editor** → Paste and run

### Step 1.5: Set Up Row Level Security (RLS)

The migration file includes RLS policies, but verify:
1. Go to **Authentication** → **Policies**
2. Ensure policies are enabled for all tables
3. Test by creating a user and checking access

---

## 2. MongoDB Setup (Project Memory + Conversation History)

### Step 2.1: Create MongoDB Atlas Cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Click "Build a Database"
4. Choose **FREE** tier (M0 Sandbox)
5. Select cloud provider and region (choose same as Supabase)
6. Cluster Name: `nebula-ai-cluster`
7. Click "Create"

### Step 2.2: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click "Confirm"

### Step 2.3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `nebula-admin`
5. Password: (generate strong password - save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 2.4: Get Connection String

1. Go to **Database** → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `nebula-ai`
7. Add to `.env.local` as `MONGODB_URI`

Example:
```
mongodb+srv://nebula-admin:YOUR_PASSWORD@nebula-ai-cluster.xxxxx.mongodb.net/nebula-ai?retryWrites=true&w=majority
```

### Step 2.5: Create Database and Collections

The application will auto-create collections on first use, but you can pre-create:

1. Go to **Database** → **Browse Collections**
2. Click "Create Database"
3. Database name: `nebula-ai`
4. Collection name: `project_memory`
5. Click "Create"

Repeat for these collections:
- `conversation_history`
- `chat_sessions`

---

## 3. AWS Setup (AI Services + Storage)

### Step 3.1: Create AWS Account

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow signup process (requires credit card)
4. Choose **Basic Support - Free** plan

### Step 3.2: Create IAM User

⚠️ **Never use root account credentials in your app!**

1. Go to **IAM** console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Create user"
3. User name: `nebula-ai-service`
4. Click "Next"
5. Select "Attach policies directly"
6. Add these policies:
   - `AmazonBedrockFullAccess`
   - `AmazonRekognitionFullAccess`
   - `AmazonTranscribeFullAccess`
   - `AmazonS3FullAccess` (or create custom policy for specific bucket)
7. Click "Next" → "Create user"

### Step 3.3: Create Access Keys

1. Click on the user you just created
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT**: Copy both:
   - Access key ID → `AWS_ACCESS_KEY_ID`
   - Secret access key → `AWS_SECRET_ACCESS_KEY`
8. Download .csv file as backup
9. Click "Done"

### Step 3.4: Enable AWS Bedrock

1. Go to **Bedrock** console: https://console.aws.amazon.com/bedrock/
2. Choose region: **us-east-1** (most models available)
3. Click "Model access" in left sidebar
4. Click "Manage model access"
5. Enable these models:
   - **Anthropic Claude 3 Sonnet** (recommended)
   - **Anthropic Claude 3 Haiku** (faster, cheaper)
6. Click "Request model access"
7. Wait for approval (usually instant for Claude)

### Step 3.5: Create S3 Bucket

1. Go to **S3** console: https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. Bucket name: `nebula-ai-uploads-[your-unique-id]` (must be globally unique)
4. Region: Same as your Bedrock region (us-east-1)
5. **Block Public Access**: Keep all checked (we'll use presigned URLs)
6. **Bucket Versioning**: Enable (optional, for backup)
7. Click "Create bucket"

### Step 3.6: Configure S3 CORS

1. Click on your bucket
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click "Save changes"

### Step 3.7: Update Environment Variables

Add to `.env.local`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=nebula-ai-uploads-your-unique-id
AWS_S3_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_BEDROCK_MODEL_REGION=us-east-1
```

---

## 4. Application Setup

### Step 4.1: Install Dependencies

```bash
cd nebula-ai-fullstack
npm install
```

### Step 4.2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in all values from previous steps

3. Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add to `ENCRYPTION_KEY`

### Step 4.3: Generate TypeScript Types

```bash
npm run db:generate
```

This creates `src/types/supabase.ts` with your database types.

### Step 4.4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Verification Checklist

### ✅ Supabase
- [ ] Can access Supabase dashboard
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Email auth configured
- [ ] SMTP working (send test email)

### ✅ MongoDB
- [ ] Can access MongoDB Atlas dashboard
- [ ] Database created
- [ ] Collections visible
- [ ] Connection string works

### ✅ AWS
- [ ] IAM user created with correct permissions
- [ ] Bedrock models enabled and accessible
- [ ] S3 bucket created
- [ ] CORS configured
- [ ] Can generate presigned URLs

### ✅ Application
- [ ] `npm install` completes without errors
- [ ] `.env.local` has all required variables
- [ ] `npm run dev` starts successfully
- [ ] Can access http://localhost:3000
- [ ] No console errors in browser
- [ ] Can register new user
- [ ] Receive verification email
- [ ] Can login after verification

---

## 6. Testing Authentication Flow

1. **Register**:
   - Go to http://localhost:3000/auth/register
   - Fill in email and password
   - Submit form
   - Check email for verification link

2. **Verify Email**:
   - Click link in email
   - Should redirect to login

3. **Login**:
   - Go to http://localhost:3000/auth/login
   - Enter credentials
   - Should redirect to dashboard

4. **Test Protected Route**:
   - Try accessing http://localhost:3000/dashboard
   - Should work when logged in
   - Should redirect to login when logged out

---

## 7. Common Issues & Solutions

### Issue: "Invalid API key" (Supabase)
- **Solution**: Double-check you copied the correct keys
- Ensure no extra spaces in `.env.local`
- Restart dev server after changing env vars

### Issue: "Network Error" (MongoDB)
- **Solution**: Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure password doesn't contain special characters (URL encode if needed)

### Issue: "Access Denied" (AWS)
- **Solution**: Verify IAM policies attached to user
- Check region matches in code and console
- Ensure Bedrock models are enabled in correct region

### Issue: Email not sending
- **Solution**: Check SMTP configuration
- Verify email templates in Supabase
- Check spam folder
- Try different SMTP provider

### Issue: "Module not found"
- **Solution**: Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`

---

## 8. Production Deployment

### Before deploying:

1. **Environment Variables**:
   - Set all env vars in your hosting platform
   - Use production URLs
   - Generate new secrets (don't reuse dev keys)

2. **Database**:
   - Run migrations on production database
   - Set up automated backups
   - Configure connection pooling

3. **Security**:
   - Enable rate limiting
   - Set up monitoring/logging
   - Configure CORS for production domain
   - Review RLS policies

4. **AWS**:
   - Update S3 CORS with production domain
   - Set up CloudFront CDN (optional)
   - Enable S3 bucket logging

5. **Recommended Platforms**:
   - **Vercel** (easiest for Next.js)
   - **Railway** (includes database hosting)
   - **AWS Amplify**
   - **DigitalOcean App Platform**

---

## 9. Cost Estimates (Monthly)

### Free Tier (Development):
- Supabase: Free (500MB database, 50MB file storage)
- MongoDB Atlas: Free (512MB storage)
- AWS: ~$0-5 (free tier covers most development usage)
- **Total**: $0-5/month

### Production (Low Traffic - 1000 users):
- Supabase: $25/month (Pro plan)
- MongoDB Atlas: $0-9/month (M0 free or M2 shared)
- AWS: $20-50/month (Bedrock, S3, Rekognition usage-based)
- Hosting: $20/month (Vercel Pro)
- **Total**: $65-104/month

### Production (High Traffic - 10,000+ users):
- Supabase: $25-100/month
- MongoDB Atlas: $57+/month (M10 dedicated)
- AWS: $200-500/month
- Hosting: $20-100/month
- **Total**: $302-727/month

---

## 10. Next Steps

After setup is complete:

1. **Test all workspaces**: Go through each feature
2. **Configure admin user**: Update role in Supabase
3. **Customize branding**: Update colors, logo, etc.
4. **Set up monitoring**: Add error tracking (Sentry)
5. **Performance testing**: Test with realistic data
6. **Security audit**: Review all API endpoints
7. **Documentation**: Document any custom changes

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs in terminal
3. Check browser console for errors
4. Verify all environment variables are set
5. Ensure all services are running

For service-specific issues:
- **Supabase**: https://supabase.com/docs
- **MongoDB**: https://docs.mongodb.com/
- **AWS**: https://docs.aws.amazon.com/

---

**🎉 Setup Complete!**

You now have a fully configured Nebula AI development environment.

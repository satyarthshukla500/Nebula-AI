# Nebula AI - Quick Start Guide

## 🚀 Get Running in 5 Minutes

This guide will get you up and running with Nebula AI locally for development.

## Prerequisites

- Node.js 18+ installed
- Git installed

## Step 1: Install Dependencies

```bash
cd nebula-ai-fullstack
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase (Get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# MongoDB (Get from https://mongodb.com/cloud/atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nebula-ai

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_BEDROCK_MODEL_REGION=us-east-1

# Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your-32-byte-hex-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and API keys to `.env.local`
3. Go to SQL Editor and run the migration file:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in SQL Editor
4. Configure email authentication:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure SMTP (or use Supabase's default for testing)

## Step 4: Set Up MongoDB

1. Go to [https://mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env.local`

## Step 5: Set Up AWS (Optional for Testing)

For initial testing, you can skip AWS setup. The app will show errors for AI features but authentication and UI will work.

To enable AI features:
1. Create AWS account
2. Create IAM user with Bedrock, S3, Rekognition, Transcribe permissions
3. Enable Bedrock models (Claude 3)
4. Create S3 bucket
5. Add credentials to `.env.local`

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed AWS setup.

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Click "Get Started" on the landing page
2. Register a new account
3. Check your email for verification link (if SMTP is configured)
4. Login with your credentials
5. Explore the dashboard and workspaces

## 🎉 You're Ready!

The application is now running locally. You can:
- Create an account and login
- Navigate between workspaces
- Send messages (will work once AWS is configured)
- Test the UI and navigation

## Common Issues

### "Invalid API key" Error
- Double-check your Supabase keys in `.env.local`
- Restart the dev server after changing environment variables

### "Network Error" with MongoDB
- Verify your IP is whitelisted in MongoDB Atlas
- Check connection string format

### AI Features Not Working
- This is expected if AWS is not configured
- Set up AWS Bedrock to enable AI responses

## Next Steps

- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete service setup
- Review [README.md](./README.md) for full documentation
- Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for feature status

## Need Help?

- Check the troubleshooting section in SETUP_GUIDE.md
- Review the documentation files
- Ensure all environment variables are set correctly

---

**Happy coding! 🚀**

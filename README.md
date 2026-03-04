# Nebula AI - Production-Grade Full-Stack SaaS Platform

A comprehensive AI-powered assistant platform built with Next.js 14, Supabase, MongoDB, and AWS services.

## 🚀 Features

### Core Workspaces
- **General Chat**: Daily life assistance (cooking, gardening, planning, habits)
- **Explain Assist**: Technical explanations in multiple modes and languages
- **Debug Workspace**: Code debugging across 15+ programming languages
- **Smart Summarizer**: High-level code and workflow summaries
- **Quiz Arena**: Customizable quiz generation with strict proctoring mode
- **Interactive Quiz**: Engaging quiz experiences
- **Cyber Safety**: Educational risk assessment and deepfake detection
- **Mental Wellness**: Emotional support with crisis detection (encrypted)
- **Study Focus**: Dedicated study environment with timer and educational games

### Key Features
- ✅ **Full Authentication**: Email verification, password reset, role-based access
- ✅ **Voice Integration**: Speech-to-text and text-to-speech across workspaces
- ✅ **File Upload**: S3 presigned URLs, 10 files per workspace, multipart upload
- ✅ **Project Memory**: MongoDB-based context persistence
- ✅ **Admin Dashboard**: User management, activity logs, analytics
- ✅ **Strict Quiz Mode**: Soft proctoring with tab/window detection
- ✅ **Multi-language Support**: English, Hindi, and major world languages
- ✅ **Dark/Light Mode**: System-wide theme support

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- MongoDB Atlas account (free tier available)
- AWS account (free tier covers development)
- Git

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **UI Components**: Custom components with Lucide icons
- **Voice**: Web Speech API

### Backend
- **Database**: Supabase (PostgreSQL) + MongoDB
- **Authentication**: Supabase Auth
- **File Storage**: AWS S3
- **AI Services**: AWS Bedrock (Claude 3)
- **Image Analysis**: AWS Rekognition
- **Video Analysis**: AWS Rekognition Video
- **Audio Transcription**: AWS Transcribe

### Infrastructure
- **API**: Next.js API Routes
- **Middleware**: Custom auth and role guards
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
nebula-ai-fullstack/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Auth routes (login, register, etc.)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── admin/               # Admin-only routes
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── workspaces/         # Workspace-specific components
│   │   ├── ui/                 # Reusable UI components
│   │   └── voice/              # Voice integration components
│   ├── lib/                     # Utility libraries
│   │   ├── supabase/           # Supabase client and utilities
│   │   ├── mongodb/            # MongoDB connection and queries
│   │   ├── aws/                # AWS service integrations
│   │   ├── voice/              # Voice utilities
│   │   └── utils/              # General utilities
│   ├── middleware.ts            # Next.js middleware (auth, role guards)
│   ├── store/                   # Zustand stores
│   ├── types/                   # TypeScript types
│   └── hooks/                   # Custom React hooks
├── supabase/
│   └── migrations/              # Database migrations
├── mongodb/
│   └── schemas.md               # MongoDB schema documentation
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── SETUP_GUIDE.md              # Detailed setup instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nebula-ai-fullstack
npm install
```

### 2. Set Up Services

Follow the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md) to configure:
1. Supabase (Database + Auth)
2. MongoDB Atlas (Project Memory)
3. AWS (Bedrock, S3, Rekognition)

### 3. Configure Environment

```bash
cp .env.example .env.local
# Fill in all required values
```

### 4. Run Database Migrations

```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and run: supabase/migrations/001_initial_schema.sql
```

### 5. Generate TypeScript Types

```bash
npm run db:generate
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

### Registration
1. User visits `/auth/register`
2. Fills email, password, full name
3. Supabase creates auth user
4. Trigger creates profile in `public.profiles`
5. Verification email sent
6. User clicks link to verify
7. Redirected to login

### Login
1. User visits `/auth/login`
2. Enters credentials
3. Supabase validates
4. Session created
5. Redirected to dashboard
6. Middleware checks auth on protected routes

### Role-Based Access
- **User Role**: Access to all workspaces, own data only
- **Admin Role**: Additional access to admin dashboard, user management

## 📊 Database Schema

### Supabase (PostgreSQL)

**Tables:**
- `profiles` - User profiles with roles
- `learning_sessions` - AI interaction sessions
- `quiz_results` - Quiz attempts and scores
- `study_sessions` - Study timer sessions
- `wellness_logs` - Encrypted mental wellness logs
- `cyber_safety_reports` - Security analysis reports
- `project_metadata` - Project memory metadata
- `voice_usage_logs` - Voice feature usage
- `upload_metadata` - File upload tracking
- `activity_logs` - Admin audit logs

**Row Level Security (RLS):**
- Users can only access their own data
- Admins have read access to most tables
- Wellness logs are strictly private (user-only access)

### MongoDB

**Collections:**
- `project_memory` - Full project context and conversations
- `conversation_history` - Chat message history
- `chat_sessions` - Active session state (TTL: 2 hours)

## 🎤 Voice Integration

### Speech-to-Text
- Uses Web Speech API (`webkitSpeechRecognition`)
- Real-time transcription
- Language selection support
- Graceful fallback if unsupported

### Text-to-Speech
- Uses `speechSynthesis` API
- Adjustable rate and pitch
- Play/pause/stop controls
- Multiple voice options

### Supported Workspaces
- General Chat
- Explain Assist
- Mental Wellness
- Study Focus

## 📤 File Upload System

### Features
- S3 presigned URLs for direct upload
- Max 10 files per workspace
- Persistent file list
- Multipart upload for large files (>50MB)
- File type validation
- Progress tracking

### Supported File Types
- Images: JPG, PNG, GIF
- Videos: MP4, MOV (up to 10 minutes)
- Documents: PDF, DOCX, PPTX, TXT
- Archives: ZIP (for code bundles)

## 🧠 Project Memory System

### How It Works
1. User starts a project in any workspace
2. System creates MongoDB document with unique `contextId`
3. Conversations and decisions are stored
4. Context automatically loaded in future sessions
5. User can view, edit, or delete project memory

### Storage
- **Metadata**: Supabase `project_metadata` table
- **Full Context**: MongoDB `project_memory` collection
- **Linking**: `mongodb_context_id` field

## 🎯 Strict Quiz Mode

### Features
- One question at a time (no navigation)
- Per-question timer
- Total quiz timer
- Soft proctoring:
  - Tab switch detection
  - Window resize detection
  - Event logging (not blocking)
- Detailed performance report

### Proctoring Events Logged
- Tab visibility changes
- Window focus loss
- Window resize
- Copy/paste attempts
- Right-click attempts

## 🛡️ Security Features

### Authentication
- Email verification required
- Secure password hashing (bcrypt)
- Session management with refresh tokens
- CSRF protection
- Rate limiting on auth endpoints

### Data Protection
- Row Level Security (RLS) on all tables
- Encrypted wellness logs
- Secure S3 presigned URLs (expiring)
- Environment variables for secrets
- HTTPS only in production

### API Security
- Middleware auth checks
- Role-based guards
- Input validation
- SQL injection prevention (Supabase)
- XSS protection (Next.js)

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace logo in `public/logo.svg`
- Modify theme in `src/app/globals.css`

### Features
- Enable/disable features via environment variables
- Add new workspaces in `src/app/(dashboard)/workspaces/`
- Extend database schema with new migrations

## 📈 Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics or Google Analytics
- **Performance**: Vercel Speed Insights
- **Uptime**: UptimeRobot

### Built-in Logging
- Activity logs for admin monitoring
- Voice usage tracking
- File upload tracking
- Quiz attempt logging

## 🧪 Testing

### Run Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Structure
```
__tests__/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── e2e/            # End-to-end tests
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Vercel
- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`
- Separate variables for Production, Preview, Development

### Pre-Deployment Checklist
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SMTP configured for production
- [ ] S3 CORS updated with production domain
- [ ] MongoDB IP whitelist updated
- [ ] AWS credentials secured
- [ ] Rate limiting enabled
- [ ] Error tracking configured

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

### Workspace Endpoints
- `POST /api/workspaces/chat` - Send chat message
- `POST /api/workspaces/explain` - Get explanation
- `POST /api/workspaces/debug` - Debug code
- `POST /api/workspaces/quiz` - Generate quiz
- `POST /api/workspaces/cyber-safety` - Analyze security

### File Upload Endpoints
- `POST /api/upload/presigned-url` - Get S3 presigned URL
- `POST /api/upload/complete` - Mark upload complete
- `GET /api/upload/list` - List user uploads
- `DELETE /api/upload/:id` - Delete upload

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/activity-logs` - View activity logs

## 🐛 Troubleshooting

### Common Issues

**"Invalid API key"**
- Check `.env.local` for correct Supabase keys
- Restart dev server after changing env vars

**"Network Error" (MongoDB)**
- Verify IP whitelist in MongoDB Atlas
- Check connection string format

**"Access Denied" (AWS)**
- Verify IAM permissions
- Check region matches in code and console

**Email not sending**
- Verify SMTP configuration in Supabase
- Check spam folder
- Try different SMTP provider

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting.

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [MongoDB Schemas](./mongodb/schemas.md) - MongoDB schema documentation
- [API Documentation](#api-documentation) - API endpoint reference

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- AWS for AI services
- MongoDB for flexible data storage
- Anthropic for Claude AI models

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review troubleshooting guide

---

**Built with ❤️ for the Voidwalkers team**

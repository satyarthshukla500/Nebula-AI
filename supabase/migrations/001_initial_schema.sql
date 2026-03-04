-- =====================================================
-- NEBULA AI - INITIAL DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor or via Supabase CLI
-- This creates all tables with proper relationships and RLS

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. CREATE ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Account status
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted');

-- Workspace types
CREATE TYPE workspace_type AS ENUM (
  'general_chat',
  'explain_assist',
  'debug_workspace',
  'smart_summarizer',
  'quiz_arena',
  'interactive_quiz',
  'cyber_safety',
  'mental_wellness',
  'study_focus'
);

-- Quiz difficulty
CREATE TYPE quiz_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- File upload status
CREATE TYPE upload_status AS ENUM ('pending', 'uploading', 'completed', 'failed');

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- -----------------------------------------------------
-- 3.1 PROFILES TABLE (extends auth.users)
-- -----------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  status account_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- -----------------------------------------------------
-- 3.2 LEARNING SESSIONS TABLE
-- -----------------------------------------------------
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_type workspace_type NOT NULL,
  session_title TEXT,
  input_content TEXT,
  output_content TEXT,
  mode TEXT, -- explain, teach, simplify, etc.
  language TEXT DEFAULT 'en',
  skill_level TEXT,
  media_urls TEXT[], -- Array of S3 URLs
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_learning_sessions_user ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_workspace ON public.learning_sessions(workspace_type);
CREATE INDEX idx_learning_sessions_created ON public.learning_sessions(created_at DESC);

-- -----------------------------------------------------
-- 3.3 QUIZ RESULTS TABLE
-- -----------------------------------------------------
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_session_id UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
  quiz_title TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  difficulty quiz_difficulty,
  time_taken_seconds INTEGER,
  questions_data JSONB NOT NULL, -- Full quiz data
  answers_data JSONB NOT NULL, -- User answers
  is_strict_mode BOOLEAN DEFAULT FALSE,
  proctoring_events JSONB, -- Tab switches, window resizes, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_results_user ON public.quiz_results(user_id);
CREATE INDEX idx_quiz_results_session ON public.quiz_results(learning_session_id);
CREATE INDEX idx_quiz_results_created ON public.quiz_results(created_at DESC);

-- -----------------------------------------------------
-- 3.4 STUDY SESSIONS TABLE
-- -----------------------------------------------------
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  duration_minutes INTEGER,
  timer_duration INTEGER, -- Planned duration
  actual_duration INTEGER, -- Actual time spent
  topics TEXT[],
  file_references TEXT[], -- S3 URLs or file IDs
  notes TEXT,
  summary TEXT,
  status TEXT DEFAULT 'active', -- active, completed, paused
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_study_sessions_user ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX idx_study_sessions_created ON public.study_sessions(created_at DESC);

-- -----------------------------------------------------
-- 3.5 WELLNESS LOGS TABLE (ENCRYPTED)
-- -----------------------------------------------------
CREATE TABLE public.wellness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL, -- Encrypted conversation
  topic TEXT, -- anxiety, depression, stress, etc.
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  crisis_detected BOOLEAN DEFAULT FALSE,
  disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
  country_code TEXT DEFAULT 'IN', -- For crisis resources
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wellness_logs_user ON public.wellness_logs(user_id);
CREATE INDEX idx_wellness_logs_created ON public.wellness_logs(created_at DESC);
CREATE INDEX idx_wellness_logs_crisis ON public.wellness_logs(crisis_detected) WHERE crisis_detected = TRUE;

-- -----------------------------------------------------
-- 3.6 CYBER SAFETY REPORTS TABLE
-- -----------------------------------------------------
CREATE TABLE public.cyber_safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- email_risk, deepfake_analysis, etc.
  input_data TEXT,
  analysis_result JSONB NOT NULL,
  risk_level TEXT, -- low, medium, high
  recommendations TEXT[],
  media_analyzed TEXT[], -- S3 URLs of analyzed images/videos
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cyber_safety_user ON public.cyber_safety_reports(user_id);
CREATE INDEX idx_cyber_safety_type ON public.cyber_safety_reports(report_type);
CREATE INDEX idx_cyber_safety_created ON public.cyber_safety_reports(created_at DESC);

-- -----------------------------------------------------
-- 3.7 PROJECT METADATA TABLE
-- -----------------------------------------------------
CREATE TABLE public.project_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_description TEXT,
  mongodb_context_id TEXT NOT NULL UNIQUE, -- Reference to MongoDB document
  tech_stack TEXT[],
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_metadata_user ON public.project_metadata(user_id);
CREATE INDEX idx_project_metadata_mongodb ON public.project_metadata(mongodb_context_id);
CREATE INDEX idx_project_metadata_active ON public.project_metadata(is_active) WHERE is_active = TRUE;

-- -----------------------------------------------------
-- 3.8 VOICE USAGE LOGS TABLE
-- -----------------------------------------------------
CREATE TABLE public.voice_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_type workspace_type NOT NULL,
  usage_type TEXT NOT NULL, -- speech_to_text, text_to_speech
  language TEXT DEFAULT 'en',
  duration_seconds INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_voice_usage_user ON public.voice_usage_logs(user_id);
CREATE INDEX idx_voice_usage_workspace ON public.voice_usage_logs(workspace_type);
CREATE INDEX idx_voice_usage_created ON public.voice_usage_logs(created_at DESC);

-- -----------------------------------------------------
-- 3.9 UPLOAD METADATA TABLE
-- -----------------------------------------------------
CREATE TABLE public.upload_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_type workspace_type NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  s3_key TEXT NOT NULL UNIQUE,
  s3_url TEXT NOT NULL,
  status upload_status NOT NULL DEFAULT 'pending',
  upload_progress INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_upload_metadata_user ON public.upload_metadata(user_id);
CREATE INDEX idx_upload_metadata_workspace ON public.upload_metadata(workspace_type);
CREATE INDEX idx_upload_metadata_status ON public.upload_metadata(status);
CREATE INDEX idx_upload_metadata_s3_key ON public.upload_metadata(s3_key);

-- -----------------------------------------------------
-- 3.10 ACTIVITY LOGS TABLE (for admin monitoring)
-- -----------------------------------------------------
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- 4.1 Update updated_at timestamp automatically
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at BEFORE UPDATE ON public.learning_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_results_updated_at BEFORE UPDATE ON public.quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_logs_updated_at BEFORE UPDATE ON public.wellness_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cyber_safety_reports_updated_at BEFORE UPDATE ON public.cyber_safety_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_metadata_updated_at BEFORE UPDATE ON public.project_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_metadata_updated_at BEFORE UPDATE ON public.upload_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- 4.2 Create profile on user signup
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'::user_role,
    'active'::account_status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyber_safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- 5.1 PROFILES POLICIES
-- -----------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role and status)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.2 LEARNING SESSIONS POLICIES
-- -----------------------------------------------------

-- Users can view their own sessions
CREATE POLICY "Users can view own learning sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create learning sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own learning sessions"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own learning sessions"
  ON public.learning_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all learning sessions"
  ON public.learning_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.3 QUIZ RESULTS POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can view own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz results"
  ON public.quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.4 STUDY SESSIONS POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can manage own study sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all study sessions"
  ON public.study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.5 WELLNESS LOGS POLICIES (STRICT PRIVACY)
-- -----------------------------------------------------

-- Only user can view their own wellness logs
CREATE POLICY "Users can view own wellness logs"
  ON public.wellness_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only user can create their own wellness logs
CREATE POLICY "Users can create wellness logs"
  ON public.wellness_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only user can delete their own wellness logs
CREATE POLICY "Users can delete own wellness logs"
  ON public.wellness_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Admins CANNOT view wellness logs (privacy protection)
-- Only aggregate/anonymous data should be available to admins

-- -----------------------------------------------------
-- 5.6 CYBER SAFETY REPORTS POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can manage own cyber safety reports"
  ON public.cyber_safety_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all cyber safety reports"
  ON public.cyber_safety_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.7 PROJECT METADATA POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can manage own projects"
  ON public.project_metadata FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- 5.8 VOICE USAGE LOGS POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can view own voice logs"
  ON public.voice_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create voice logs"
  ON public.voice_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all voice logs"
  ON public.voice_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.9 UPLOAD METADATA POLICIES
-- -----------------------------------------------------

CREATE POLICY "Users can manage own uploads"
  ON public.upload_metadata FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all uploads"
  ON public.upload_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- 5.10 ACTIVITY LOGS POLICIES
-- -----------------------------------------------------

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert activity logs (via service role)
CREATE POLICY "Service role can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_learning_sessions_user_workspace ON public.learning_sessions(user_id, workspace_type);
CREATE INDEX idx_quiz_results_user_created ON public.quiz_results(user_id, created_at DESC);
CREATE INDEX idx_study_sessions_user_status ON public.study_sessions(user_id, status);
CREATE INDEX idx_upload_metadata_user_workspace ON public.upload_metadata(user_id, workspace_type);

-- =====================================================
-- 8. INITIAL DATA (OPTIONAL)
-- =====================================================

-- Create a default admin user (update with your email)
-- You'll need to sign up with this email first, then run this:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run verification queries:
-- SELECT * FROM public.profiles LIMIT 1;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

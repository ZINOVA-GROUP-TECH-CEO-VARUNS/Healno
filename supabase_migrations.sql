-- =========================================================================
-- HEALNO WELLNESS & MEDICAL REPORT MANAGEMENT — SUPABASE POSTGRESQL SCHEMA
-- Row Level Security (RLS) Enabled Across All Health & Personal Data
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT 'Friend',
  phone TEXT,
  dob DATE,
  age INTEGER,
  gender TEXT,
  conditions TEXT[] DEFAULT '{}',
  common_symptoms TEXT[] DEFAULT '{}',
  daily_spoons_capacity INTEGER DEFAULT 12,
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 50,
  badges TEXT[] DEFAULT '{}',
  is_onboarded BOOLEAN DEFAULT false,
  notification_prefs JSONB DEFAULT '{"medications": true, "dailyCheckin": true, "appointments": true, "restBreaks": true, "quietHoursStart": "22:00", "quietHoursEnd": "08:00"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. MEDICAL REPORTS TABLE (Encrypted/Private Medical Vault)
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'Lab Report',
  provider TEXT NOT NULL DEFAULT 'Healthcare Provider',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_name TEXT NOT NULL,
  file_size TEXT,
  file_url TEXT,
  storage_path TEXT,
  mime_type TEXT,
  key_findings TEXT[] DEFAULT '{}',
  plain_language_summary TEXT,
  suggested_doctor_questions TEXT[] DEFAULT '{}',
  unverified BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own medical reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own medical reports"
  ON public.medical_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own medical reports"
  ON public.medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- 3. WELLNESS SESSIONS TABLE (Guided Breathing, Meditation, Stretching, Rest)
CREATE TABLE IF NOT EXISTS public.wellness_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'breathing', 'meditation', 'mindfulness', 'stretching', 'relaxation', 'sensory_rest'
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  notes TEXT,
  spoons_recovered INTEGER DEFAULT 1,
  pattern TEXT, -- e.g. "4-4-4-4 Box Breathing"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wellness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own wellness sessions"
  ON public.wellness_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness sessions"
  ON public.wellness_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own wellness sessions"
  ON public.wellness_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. SYMPTOMS LOG TABLE
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fatigue',
  name TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  triggers TEXT[] DEFAULT '{}',
  rest_periods TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own symptoms"
  ON public.symptoms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptoms"
  ON public.symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own symptoms"
  ON public.symptoms FOR DELETE
  USING (auth.uid() = user_id);

-- 5. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time_slot TEXT DEFAULT 'Morning',
  schedule_times TEXT[] DEFAULT '{"08:00"}',
  instructions TEXT,
  is_as_needed BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'Prescription',
  current_supply INTEGER,
  refill_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own medications"
  ON public.medications FOR ALL
  USING (auth.uid() = user_id);

-- 6. PACING TASKS TABLE
CREATE TABLE IF NOT EXISTS public.pacing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'care',
  spoon_cost INTEGER NOT NULL DEFAULT 1,
  is_restorative BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pacing_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pacing tasks"
  ON public.pacing_tasks FOR ALL
  USING (auth.uid() = user_id);

-- 7. ACTIVITIES TRACKER TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'personal_care',
  duration_minutes INTEGER,
  quantity NUMERIC,
  unit TEXT DEFAULT 'mins',
  target NUMERIC,
  completed BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id);

-- 8. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'pacing',
  tags TEXT[] DEFAULT '{}',
  reactions JSONB DEFAULT '{"hug": 1, "spoon": 1, "strength": 1, "heart": 1}'::jsonb,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view community posts
CREATE POLICY "Authenticated users can read all community posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert posts with their own user_id
CREATE POLICY "Users can insert community posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own posts
CREATE POLICY "Users can delete only their own community posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. COMMUNITY COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments"
  ON public.community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert comments"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 10. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_rating TEXT,
  energy_rating INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage only their own journal entries"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id);

-- =========================================================================
-- SUPABASE STORAGE BUCKET: medical_reports (Private Bucket)
-- =========================================================================
-- Run in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical_reports', 'medical_reports', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: Users can only upload and read files in their own folder (folder named after user_id)
CREATE POLICY "Users can upload medical files to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'medical_reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view medical files in own folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'medical_reports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete medical files in own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'medical_reports' AND (storage.foldername(name))[1] = auth.uid()::text);

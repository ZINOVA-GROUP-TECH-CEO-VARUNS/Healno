-- =========================================================================
-- HEALNO SUPABASE POSTGRESQL SCHEMA & RLS SETUP
-- Copy and paste this SQL into your Supabase SQL Editor.
-- =========================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  phone text,
  dob date,
  age integer,
  gender text,
  conditions text[],
  common_symptoms text[],
  daily_spoons_capacity integer default 12,
  dietary_preferences text[],
  allergies text[],
  streak_days integer default 0,
  xp integer default 0,
  badges text[],
  is_onboarded boolean default false,
  notification_prefs jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);


-- 2. SYMPTOMS TABLE
create table if not exists public.symptoms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  time text,
  category text,
  name text not null,
  intensity integer check (intensity between 1 and 10),
  notes text,
  tags text[],
  triggers text[],
  rest_periods text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptoms enable row level security;

create policy "Users can manage own symptoms" on public.symptoms for all using (auth.uid() = user_id);


-- 3. EMOTIONS TABLE
create table if not exists public.emotions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  happy integer check (happy between 0 and 100),
  sad integer check (sad between 0 and 100),
  calm integer check (calm between 0 and 100),
  anxious integer check (anxious between 0 and 100),
  dominant_mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.emotions enable row level security;

create policy "Users can manage own emotions" on public.emotions for all using (auth.uid() = user_id);


-- 4. JOURNAL ENTRIES TABLE
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  time text,
  title text not null,
  content text,
  mood_rating text,
  energy_rating integer,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.journal_entries enable row level security;

create policy "Users can manage own journal entries" on public.journal_entries for all using (auth.uid() = user_id);


-- 5. MEDICATIONS TABLE
create table if not exists public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  dosage text,
  time_slot text,
  schedule_times text[],
  instructions text,
  is_as_needed boolean default false,
  category text,
  current_supply integer,
  refill_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;

create policy "Users can manage own medications" on public.medications for all using (auth.uid() = user_id);


-- 6. PACING TASKS TABLE
create table if not exists public.pacing_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text,
  spoon_cost integer default 1,
  is_restorative boolean default false,
  completed boolean default false,
  date date not null,
  time text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pacing_tasks enable row level security;

create policy "Users can manage own pacing tasks" on public.pacing_tasks for all using (auth.uid() = user_id);


-- 7. MEDICAL REPORTS / DOCUMENTS TABLE
create table if not exists public.medical_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  document_type text,
  provider text,
  date date,
  file_name text,
  file_size text,
  file_url text,
  storage_path text,
  mime_type text,
  key_findings text[],
  plain_language_summary text,
  suggested_doctor_questions text[],
  unverified boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medical_reports enable row level security;

create policy "Users can manage own medical reports" on public.medical_reports for all using (auth.uid() = user_id);


-- 8. WELLNESS SESSIONS TABLE
create table if not exists public.wellness_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_type text,
  title text not null,
  duration_minutes integer,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date,
  time text,
  notes text,
  spoons_recovered integer default 1,
  pattern text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wellness_sessions enable row level security;

create policy "Users can manage own wellness sessions" on public.wellness_sessions for all using (auth.uid() = user_id);


-- 9. COMMUNITY POSTS TABLE
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  author_name text not null,
  title text not null,
  content text not null,
  topic text,
  tags text[],
  reactions jsonb default '{"hug": 0, "spoon": 0, "strength": 0, "heart": 0}'::jsonb,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;

create policy "Authenticated users can view community posts" on public.community_posts for select using (auth.role() = 'authenticated');
create policy "Users can create community posts" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own community posts" on public.community_posts for delete using (auth.uid() = user_id);

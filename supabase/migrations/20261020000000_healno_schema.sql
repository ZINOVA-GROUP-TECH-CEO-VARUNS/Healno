-- Healno PostgreSQL Schema & Row Level Security (RLS) Migration
-- Created for Healno Chronic Health Companion

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text not null default 'Friend',
  phone text,
  dob date,
  age integer,
  gender text,
  conditions text[] default array[]::text[],
  common_symptoms text[] default array[]::text[],
  daily_spoons_capacity integer not null default 12,
  dietary_preferences text[] default array[]::text[],
  allergies text[] default array[]::text[],
  streak_days integer default 1,
  xp integer default 50,
  badges text[] default array['badge_first_step']::text[],
  is_onboarded boolean default false,
  notification_prefs jsonb default '{"medications": true, "dailyCheckin": true, "appointments": true, "restBreaks": true}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Symptoms Table
create table if not exists public.symptoms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  time text not null default '12:00',
  category text not null check (category in ('fatigue', 'pain', 'sleep', 'mood', 'brain_fog', 'digestive', 'custom')),
  name text not null,
  intensity integer not null check (intensity between 1 and 10),
  notes text default '',
  tags text[] default array[]::text[],
  triggers text[] default array[]::text[],
  rest_periods text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptoms enable row level security;

create policy "Users can view own symptoms"
  on public.symptoms for select
  using (auth.uid() = user_id);

create policy "Users can insert own symptoms"
  on public.symptoms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own symptoms"
  on public.symptoms for update
  using (auth.uid() = user_id);

create policy "Users can delete own symptoms"
  on public.symptoms for delete
  using (auth.uid() = user_id);

-- 4. Emotions Table
create table if not exists public.emotions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  happy integer not null default 48,
  sad integer not null default 33,
  calm integer not null default 27,
  anxious integer not null default 40,
  dominant_mood text default 'Reflective',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.emotions enable row level security;

create policy "Users can manage own emotions"
  on public.emotions for all
  using (auth.uid() = user_id);

-- 4b. Personal Journal / Diary Table
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  time text not null default '12:00',
  title text not null,
  content text not null,
  mood_rating text,
  energy_rating integer check (energy_rating between 1 and 10),
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.journal_entries enable row level security;

create policy "Users can manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);

-- 5. Medications Table
create table if not exists public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dosage text not null,
  time_slot text not null check (time_slot in ('Morning', 'Afternoon', 'Evening', 'Bedtime', 'As Needed')),
  schedule_times text[] default array['08:00']::text[],
  instructions text default '',
  is_as_needed boolean default false,
  category text default 'Prescription',
  current_supply integer default 30,
  refill_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;

create policy "Users can manage own medications"
  on public.medications for all
  using (auth.uid() = user_id);

-- 6. Medication Events (Logs) Table
create table if not exists public.medication_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  medication_id uuid references public.medications(id) on delete cascade not null,
  date date not null default current_date,
  time_slot text not null,
  status text not null check (status in ('taken', 'skipped', 'snoozed', 'pending')),
  recorded_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, medication_id, date, time_slot)
);

alter table public.medication_events enable row level security;

create policy "Users can manage own med events"
  on public.medication_events for all
  using (auth.uid() = user_id);

-- 7. Pacing Tasks Table
create table if not exists public.pacing_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null check (category in ('work', 'personal', 'care', 'rest', 'household')),
  spoon_cost integer not null default 1,
  is_restorative boolean default false,
  completed boolean default false,
  date date not null default current_date,
  time text default '09:00',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pacing_tasks enable row level security;

create policy "Users can manage own pacing tasks"
  on public.pacing_tasks for all
  using (auth.uid() = user_id);

-- 8. Medical Documents Table
create table if not exists public.medical_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  document_type text not null,
  provider text not null,
  date date not null,
  file_name text not null,
  file_size text,
  key_findings text[] default array[]::text[],
  plain_language_summary text default '',
  suggested_doctor_questions text[] default array[]::text[],
  unverified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medical_documents enable row level security;

create policy "Users can manage own medical documents"
  on public.medical_documents for all
  using (auth.uid() = user_id);

-- 9. Appointments Table
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null,
  specialty text not null,
  location text not null,
  date date not null,
  time text not null,
  purpose text not null,
  reminder_set boolean default true,
  completed boolean default false,
  doctor_questions text[] default array[]::text[],
  talking_points text[] default array[]::text[],
  clinical_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

create policy "Users can manage own appointments"
  on public.appointments for all
  using (auth.uid() = user_id);

-- 10. Community Posts Table (Public Read, Author Write)
create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  is_anonymous boolean default false,
  topic text not null check (topic in ('pacing', 'fatigue', 'coping', 'nutrition', 'work_school', 'appointments')),
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  reactions jsonb default '{"hug": 0, "spoon": 0, "strength": 0, "heart": 0}'::jsonb,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;

create policy "Any user can view community posts"
  on public.community_posts for select
  using (true);

create policy "Users can insert own community posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own community posts"
  on public.community_posts for update
  using (auth.uid() = user_id);

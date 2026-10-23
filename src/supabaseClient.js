import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qbuzygcqbqauqxzmbywu.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidXp5Z2NxYnFhdXF4em1ieXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODYxNzQsImV4cCI6MjEwODA2MjE3NH0.4_kcbTIEOB6nkIn4xlKGHPSnh8n5_6qCV4T6mu9Bq0M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

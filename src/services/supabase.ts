import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or custom runtime configuration
const SUPABASE_URL_KEY = 'healno_custom_supabase_url';
const SUPABASE_ANON_KEY_KEY = 'healno_custom_supabase_anon';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_URL_KEY) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_ANON_KEY_KEY) : null;

  const url = storedUrl || envUrl || '';
  const key = storedKey || envKey || '';

  const isConfigured = Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('your-project-id') &&
    key !== 'your-anon-key'
  );

  return { url, key, isConfigured };
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem(SUPABASE_URL_KEY, url);
    localStorage.setItem(SUPABASE_ANON_KEY_KEY, key);
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY_KEY);
  }
};

const config = getSupabaseConfig();

export const supabase = config.isConfigured
  ? createClient(config.url, config.key)
  : null;

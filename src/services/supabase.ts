import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

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

export const supabase: SupabaseClient | null = config.isConfigured
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Official Supabase Authentication Service
export const authService = {
  isConfigured: () => Boolean(supabase),

  // Sign up with email & password
  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; session: Session | null; error?: string }> {
    if (!supabase) {
      return { user: null, session: null, error: 'Supabase credentials not configured. Working in local persistent mode.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (err: any) {
      return { user: null, session: null, error: err.message || 'Failed to sign up' };
    }
  },

  // Sign in with email & password
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error?: string }> {
    if (!supabase) {
      return { user: null, session: null, error: 'Supabase credentials not configured. Working in local persistent mode.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (err: any) {
      return { user: null, session: null, error: err.message || 'Invalid email or password' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    if (!supabase) return {};
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  // Password reset request
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase credentials not configured.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
    }
  },

  // Get active session
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  },
};

// Supabase Storage Bucket Helper for Private Medical Reports
export const supabaseStorageService = {
  bucketName: 'medical_reports',

  async uploadMedicalReport(
    file: File | Blob,
    fileName: string,
    userId: string
  ): Promise<{ path: string; signedUrl?: string; error?: string }> {
    if (!supabase) {
      return { path: '', error: 'Supabase is not configured' };
    }

    try {
      const fileExt = fileName.split('.').pop() || 'pdf';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${userId}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Create signed URL valid for 2 hours
      const { data: signedData, error: signedError } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 7200);

      return {
        path: filePath,
        signedUrl: signedData?.signedUrl || undefined,
        error: signedError?.message,
      };
    } catch (err: any) {
      console.warn('Supabase storage upload error:', err);
      return { path: '', error: err.message || 'Failed to upload to private bucket' };
    }
  },

  async getFileSignedUrl(filePath: string): Promise<string | null> {
    if (!supabase || !filePath) return null;
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 7200);
      if (error) throw error;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  async deleteMedicalReport(filePath: string): Promise<{ error?: string }> {
    if (!supabase || !filePath) return {};
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);
      if (error) throw error;
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },
};

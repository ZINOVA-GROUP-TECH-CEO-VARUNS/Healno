import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  Sparkles,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  KeyRound,
  Database,
} from 'lucide-react';
import { HealnoLogo } from '../common/HealnoLogo';
import { WelcomeHealthcareIllustration } from '../common/CodeIllustrations';
import { authService, getSupabaseConfig, setCustomSupabaseConfig } from '../../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  onStartOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onStartOnboarding,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'config'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Custom Supabase configuration inputs
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  const supabaseConfig = getSupabaseConfig();

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted && authMode === 'signup') {
      setErrorMsg('Please accept the privacy terms to continue.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const nameToUse = fullName.trim() || email.split('@')[0];
        if (authService.isConfigured()) {
          const { user, session, error } = await authService.signUp(email.trim(), password, nameToUse);
          if (error) {
            setErrorMsg(error);
            setIsLoading(false);
            return;
          }
          onLoginSuccess({
            id: user?.id,
            email: user?.email || email.trim(),
            name: nameToUse,
            isAuthenticated: true,
          });
        } else {
          // Local persistent fallback
          onLoginSuccess({
            email: email.trim(),
            name: nameToUse,
            isAuthenticated: true,
          });
        }
        onClose();
      } else {
        // Sign In
        if (authService.isConfigured()) {
          const { user, error } = await authService.signIn(email.trim(), password);
          if (error) {
            setErrorMsg(error);
            setIsLoading(false);
            return;
          }
          const userMetadataName = user?.user_metadata?.name;
          const fallbackName = user?.email?.split('@')[0] || 'Friend';
          onLoginSuccess({
            id: user?.id,
            email: user?.email || email.trim(),
            name: userMetadataName || fallbackName,
            isAuthenticated: true,
          });
        } else {
          // Local persistent fallback
          const rawName = email.split('@')[0].replace(/[._]/g, ' ');
          const computedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          onLoginSuccess({
            email: email.trim(),
            name: computedName || 'Friend',
            isAuthenticated: true,
          });
        }
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { success, error } = await authService.resetPassword(email.trim());
      if (success) {
        setSuccessMsg('Password reset instructions have been dispatched to your email.');
      } else {
        setErrorMsg(error || 'Failed to dispatch reset email. Ensure Supabase credentials are configured.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid 4-digit code (e.g. 1234).');
      return;
    }
    onLoginSuccess({
      phone,
      name: 'Varun',
      email: 'thexplorervaruns@gmail.com',
      isAuthenticated: true,
    });
    onClose();
  };

  const handleSaveCustomSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setErrorMsg('Please enter both your Supabase Project URL and Public Anon Key.');
      return;
    }
    setCustomSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132A1F]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#132A1F]/10 animate-in zoom-in-95 duration-200">
        {/* Visual Hero Header */}
        <div className="relative py-6 px-5 bg-gradient-to-br from-[#132A1F] to-[#2D6A4F] text-white flex items-center justify-between">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2 text-[#FF7A24] text-xs font-bold mb-0.5">
              <HealnoLogo size="xs" />
              <span>Healno Health Vault</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">A Calm Space for Your Health</h2>
            <p className="text-xs text-white/70">
              {supabaseConfig.isConfigured ? '🟢 Supabase PostgreSQL & Auth Active' : '🟡 Local Encrypted Session'}
            </p>
          </div>

          <div className="shrink-0 pl-3">
            <WelcomeHealthcareIllustration className="w-16 h-16" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4">
          {/* Segmented Auth Mode */}
          <div className="flex items-center bg-[#E8EFE9] p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                authMode === 'login' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                authMode === 'signup' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setAuthMode('forgot');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                authMode === 'forgot' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
            >
              Reset
            </button>
            <button
              onClick={() => {
                setAuthMode('config');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-1.5 px-2 rounded-xl transition-all ${
                authMode === 'config' ? 'bg-white text-[#2D6A4F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
              title="Supabase Database Settings"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#E76F51] bg-[#FFE5D9] p-2.5 rounded-xl flex items-start gap-1.5">
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-[#2D6A4F] bg-[#E8EFE9] p-2.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email / Password Forms */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Varun"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#132A1F]">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[10px] text-[#2D6A4F] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="w-4 h-4 accent-[#132A1F] mt-0.5 rounded"
                  />
                  <label htmlFor="consent" className="text-[11px] text-[#132A1F]/70 cursor-pointer">
                    I accept the Healno Privacy Terms for personal health records.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-md transition-colors font-display flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{authMode === 'login' ? 'Sign In to Healno' : 'Create Supabase Account'}</span>
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-xs text-[#132A1F]/70">
                Enter your account email address and we'll send a secure password reset link via Supabase Auth.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Reset Link</span>
              </button>
            </form>
          )}

          {/* Database / Supabase Config Settings */}
          {authMode === 'config' && (
            <form onSubmit={handleSaveCustomSupabase} className="space-y-3 text-xs">
              <div className="bg-[#E8EFE9] p-3 rounded-2xl text-[11px] text-[#132A1F]/80">
                <span className="font-bold block text-[#132A1F] mb-0.5">Supabase Configuration</span>
                <span>
                  Connect your real Supabase project to synchronize medical reports, profiles, and wellness sessions with PostgreSQL and private Storage.
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Supabase URL</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Public Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs"
              >
                Save & Connect Database
              </button>
            </form>
          )}

          {/* Guided Onboarding shortcut */}
          <div className="pt-2 text-center border-t border-[#132A1F]/10">
            <button
              onClick={() => {
                onClose();
                onStartOnboarding();
              }}
              className="text-xs text-[#2D6A4F] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <span>Take Guided Pacing Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

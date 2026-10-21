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
} from 'lucide-react';
import { HealnoLogo } from '../common/HealnoLogo';
import { WelcomeHealthcareIllustration } from '../common/CodeIllustrations';

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
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) {
      setErrorMsg('Please accept the privacy terms to continue.');
      return;
    }
    setErrorMsg('');
    onLoginSuccess({
      email,
      name: email.split('@')[0].replace('.', ' '),
      isAuthenticated: true,
    });
    onClose();
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMode('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid 4-digit code (e.g. 1234).');
      return;
    }
    onLoginSuccess({
      phone,
      name: 'Jose Maria',
      isAuthenticated: true,
    });
    onClose();
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    onLoginSuccess({
      name: provider === 'Google' ? 'Jose Maria' : 'Healno Explorer',
      email: `${provider.toLowerCase()}@healno.app`,
      isAuthenticated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132A1F]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#132A1F]/10 animate-in zoom-in-95 duration-200">
        {/* Visual Hero Header featuring code-based illustration */}
        <div className="relative py-6 px-5 bg-gradient-to-br from-[#132A1F] to-[#2D6A4F] text-white flex items-center justify-between">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2 text-[#FF7A24] text-xs font-bold mb-0.5">
              <HealnoLogo size="xs" />
              <span>Welcome to Healno</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">A Calm Space for Your Health</h2>
            <p className="text-xs text-white/70">Private, secure, and spoon-conscious</p>
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
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                authMode === 'signup' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
            >
              New Account
            </button>
            <button
              onClick={() => {
                setAuthMode('otp');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                authMode === 'otp' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#E76F51] bg-[#FFE5D9] p-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Email / Password Forms */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="w-4 h-4 accent-[#132A1F] mt-0.5 rounded"
                />
                <label htmlFor="consent" className="text-[11px] text-[#132A1F]/70 cursor-pointer">
                  I accept the Healno Privacy Consent & Terms for sensitive personal health records.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-md transition-colors font-display"
              >
                {authMode === 'login' ? 'Sign In to Healno' : 'Create Free Healno Account'}
              </button>
            </form>
          )}

          {/* Phone OTP Verification */}
          {authMode === 'otp' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Verification Code (Enter 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold bg-white border border-[#132A1F]/15 rounded-xl py-2 focus:outline-none font-display"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold text-xs shadow-md transition-colors font-display"
              >
                Verify & Enter
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-2 text-[10px] text-[#132A1F]/40 uppercase tracking-wider font-semibold">
            <div className="flex-1 h-px bg-[#132A1F]/10" />
            <span>or sign in with</span>
            <div className="flex-1 h-px bg-[#132A1F]/10" />
          </div>

          {/* Social Sign In Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="py-2.5 px-3 rounded-xl border border-[#132A1F]/15 bg-white hover:bg-[#F8F6F0] text-xs font-semibold text-[#132A1F] transition-colors flex items-center justify-center gap-2"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="py-2.5 px-3 rounded-xl border border-[#132A1F]/15 bg-white hover:bg-[#F8F6F0] text-xs font-semibold text-[#132A1F] transition-colors flex items-center justify-center gap-2"
            >
              <span>Apple</span>
            </button>
          </div>

          {/* Guided Onboarding shortcut */}
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onStartOnboarding();
              }}
              className="text-xs text-[#2D6A4F] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <span>New to Healno? Take Guided Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

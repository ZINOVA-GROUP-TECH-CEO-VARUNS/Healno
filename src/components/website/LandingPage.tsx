import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Heart,
  Phone,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Gauge,
  Users,
  Download,
  WifiOff,
  Smile,
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { HealnoLogo } from '../common/HealnoLogo';
import { SunMorningIllustration } from '../common/CodeIllustrations';

interface LandingPageProps {
  onLaunchApp: (mode?: 'login' | 'signup' | 'onboarding') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#132A1F] flex flex-col font-sans selection:bg-[#B7E4C7] selection:text-[#132A1F]">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#132A1F]/5 px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          {/* Brand with Official Vector Logo */}
          <div className="flex items-center gap-2.5">
            <HealnoLogo size="md" />
            <span className="text-xl font-bold font-display tracking-tight text-[#132A1F]">
              Healno
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#132A1F]/70">
            <a href="#features" className="hover:text-[#132A1F] transition-colors">Features</a>
            <a href="#pacing" className="hover:text-[#132A1F] transition-colors">Spoon Pacing</a>
            <a href="#companion" className="hover:text-[#132A1F] transition-colors">AI Companion</a>
            <a href="#community" className="hover:text-[#132A1F] transition-colors">Peer Support</a>
            <a href="#privacy" className="hover:text-[#132A1F] transition-colors">Privacy & Safety</a>
          </nav>

          {/* Action CTAs & PWA Install */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton variant="minimal" />

            <button
              onClick={() => onLaunchApp('login')}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#132A1F] hover:bg-[#E8EFE9] rounded-full transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onLaunchApp('onboarding')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#132A1F] hover:bg-[#2D6A4F] rounded-full shadow-xs transition-all flex items-center gap-1.5 active:scale-95 font-display"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-10 pb-16 md:pt-16 md:pb-24 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#132A1F] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>For Chronic Illness, Fatigue & Everyday Wellness</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#132A1F] font-display tracking-tight leading-[1.15]">
              A calm, supportive health companion that honors your pace.
            </h1>

            <p className="text-sm md:text-base text-[#132A1F]/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Living with chronic fatigue, POTS, pain, or brain fog is hard enough. Healno combines spoon theory energy pacing, an empathetic AI companion (text & voice), document OCR, and doctor preparation briefs—without judgment or clinical coldness.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onLaunchApp('onboarding')}
                className="py-3.5 px-7 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold text-sm shadow-md shadow-[#E89D35]/25 active:scale-[0.98] transition-all flex items-center gap-2 font-display"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLaunchApp('login')}
                className="py-3.5 px-6 rounded-full bg-white hover:bg-[#F8F6F0] text-[#132A1F] border border-[#132A1F]/15 font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Open Live App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <PWAInstallButton />
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#132A1F]/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Non-clinical & comforting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Private & offline-capable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Voice & text AI support</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Visual App Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] rounded-[40px] p-3 bg-[#132A1F] shadow-2xl border-4 border-[#132A1F]">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2" />

              {/* Phone Screen Canvas */}
              <div className="bg-[#FAF8F5] rounded-[32px] overflow-hidden p-3.5 space-y-3.5 text-[#132A1F] relative">
                {/* Mock Header with Official Vector Logo */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <HealnoLogo size="xs" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#132A1F]/50 font-bold">Healno</div>
                      <div className="text-sm font-bold font-display">Daily Dashboard</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-bold">
                      Streak Active
                    </span>
                    <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-bold">
                      Spoons Ready
                    </span>
                  </div>
                </div>

                {/* Sun Illustration Card with Code-based SVG */}
                <div className="bg-[#FFF4EB] rounded-2xl p-2.5 border border-[#FFE0C8]">
                  <div className="text-xs font-bold font-display text-[#132A1F]">Gentle Morning Pacing</div>
                  <div className="text-[10px] text-[#132A1F]/70">Begin with mindful reflections.</div>
                  <div className="mt-2 rounded-xl overflow-hidden h-24">
                    <SunMorningIllustration className="w-full h-full" />
                  </div>
                </div>

                {/* 4 Core Emotions capsule preview */}
                <div className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#132A1F]/60">
                    Emotions & Balance (420 Score)
                  </div>
                  <div className="grid grid-cols-4 gap-2 h-16 items-end">
                    <div className="bg-[#F4A236] rounded-full h-[80%] flex items-center justify-center text-[9px] text-white font-bold">
                      48%
                    </div>
                    <div className="bg-[#6B4435] rounded-full h-[60%] flex items-center justify-center text-[9px] text-white font-bold">
                      33%
                    </div>
                    <div className="bg-[#8DA38F] rounded-full h-[50%] flex items-center justify-center text-[9px] text-white font-bold">
                      27%
                    </div>
                    <div className="bg-[#5C6B5E] rounded-full h-[70%] flex items-center justify-center text-[9px] text-white font-bold">
                      40%
                    </div>
                  </div>
                </div>

                {/* Launch Button inside Mockup */}
                <button
                  onClick={() => onLaunchApp('onboarding')}
                  className="w-full py-2.5 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Interact with Live App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Bento Grid */}
      <section id="features" className="py-16 bg-[#F3F0E6] px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">
              Thoughtfully Designed Features
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#132A1F] font-display">
              Everything you need to pace, understand, and advocate.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Spoon Pacing */}
            <div id="pacing" className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]">
                <Gauge className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                Spoon Theory Energy Pacing
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Budget your daily capacity (e.g. 12 spoons) with flexible sliders. Schedule tasks with spoon costs, add restorative pauses (+1 spoon back), and receive gentle encouragement when over capacity.
              </p>
            </div>

            {/* Bento Card 2: AI Health Companion */}
            <div id="companion" className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE5D9] flex items-center justify-center text-[#6B4435]">
                <Phone className="w-5 h-5 text-[#E76F51]" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                AI Companion (Text & Voice Call)
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Talk hands-free when joint pain or fatigue strikes. Real speech recognition & soothing vocal synthesis with pulsing audio waves. Extracts draft records with editable confirmation previews.
              </p>
            </div>

            {/* Bento Card 3: Medical Document OCR */}
            <div className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]">
                <FileText className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                Medical Document Vault & OCR
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Upload PDFs and lab pictures. Plain-language explanations, key findings, and doctor talking points without medical jargon. Kept with "Unverified" patient safety tags until reviewed.
              </p>
            </div>

            {/* Bento Card 4: Doctor Prep & Care Finder */}
            <div className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFDF9] border border-[#E89D35]/30 flex items-center justify-center text-[#E89D35]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                Appointment Coordination & Briefs
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Generate 1-page clinician consultation briefs with your top 3 functional questions. Discover local clinics, specialists, and labs with addresses and phone scripts for rescheduling.
              </p>
            </div>

            {/* Bento Card 5: Spoon-Friendly Meals */}
            <div className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]">
                <Heart className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                Personalized Spoon-Aware Meals
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Meals generated based on your exact remaining spoons. Offers 10-minute 1-spoon warm broths for crash days, low-histamine choices, and zero-effort pantry alternatives.
              </p>
            </div>

            {/* Bento Card 6: Peer Circle Community */}
            <div id="community" className="bg-white rounded-3xl p-6 border border-[#132A1F]/10 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE5D9] flex items-center justify-center text-[#6B4435]">
                <Users className="w-5 h-5 text-[#E76F51]" />
              </div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                Supportive Peer Circle
              </h3>
              <p className="text-xs text-[#132A1F]/75 leading-relaxed">
                Share practical coping hacks, send energy spoons (🥄) and warm hugs (🫂), and connect anonymously with others navigating identical conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reassuring Patient Privacy, Sovereignty & Offline Care Section */}
      <section id="privacy" className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="bg-[#132A1F] text-white rounded-3xl p-6 md:p-10 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#B7E4C7] text-xs font-semibold mb-1">
                <Shield className="w-4 h-4" />
                <span>Patient Privacy & Sovereignty</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display">
                Private, secure, and completely in your control.
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-white/10 text-[#B7E4C7] px-3 py-1.5 rounded-full font-semibold border border-white/10 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Patient-Owned Data</span>
              </span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-2xl">
            Healno is designed with zero-compromise patient privacy. Your personal diary, symptom logs, medication events, and medical documents are kept strictly confidential, accessible only by you, and never sold to third parties or advertisers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#B7E4C7]">
                <Lock className="w-4 h-4 text-[#74C69D]" />
                <span>Total Data Sovereignty</span>
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Download your complete health records as a structured JSON file or print clean clinical appointment briefs anytime with one tap.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#B7E4C7]">
                <WifiOff className="w-4 h-4 text-[#E89D35]" />
                <span>Offline Support</span>
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Install Healno as a PWA on your phone or tablet. Log symptoms, check medications, and write in your diary even with no internet connection.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#B7E4C7]">
                <Heart className="w-4 h-4 text-[#FFE5D9]" />
                <span>Gentle Accountability</span>
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Streaks celebrate mindful presence rather than perfection. No punitive notifications, no aggressive gamification, and no shame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PWA App Install Banner */}
      <section className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <PWAInstallButton variant="banner" />
      </section>

      {/* Final Call to Action */}
      <section className="py-16 text-center px-4 max-w-xl mx-auto space-y-4">
        <div className="flex justify-center">
          <HealnoLogo size="lg" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-[#132A1F]">
          Begin pacing your days with kindness.
        </h2>
        <p className="text-xs text-[#132A1F]/70 leading-relaxed">
          Free, private, calm, and tailored to your energy.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onLaunchApp('onboarding')}
            className="py-3.5 px-8 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white font-bold text-sm shadow-lg shadow-[#FF7A24]/25 transition-all font-display"
          >
            Open Healno Application
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#132A1F]/10 py-6 px-4 text-center text-xs text-[#132A1F]/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HealnoLogo size="xs" />
            <span className="font-bold text-[#132A1F]">Healno</span>
            <span>· Supportive Health Companion</span>
          </div>
          <div>
            Healno is designed for wellness and pacing support; it does not diagnose or replace clinical medical care.
          </div>
        </div>
      </footer>
    </div>
  );
};

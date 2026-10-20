import React from 'react';
import { UserProfile } from '../../types';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface TopHeaderProps {
  profile: UserProfile;
  remainingSpoons: number;
  onOpenProfile: () => void;
  onOpenCalendar: () => void;
  onOpenAI: () => void;
  onBackToWebsite?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  remainingSpoons,
  onOpenProfile,
  onOpenCalendar,
  onOpenAI,
  onBackToWebsite,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F6F0]/95 backdrop-blur-md px-4 py-3 border-b border-[#132A1F]/5 transition-all">
      <div className="max-w-4xl mx-auto">
        {/* Top bar with Brand, Calendar in Profile Trigger, Streak, and User Avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWebsite}
              title="Return to Healno Landing Website"
              className="w-9 h-9 rounded-2xl bg-white border border-[#132A1F]/10 hover:border-[#132A1F]/30 p-1 flex items-center justify-center shadow-xs transition-transform active:scale-95"
            >
              <img
                src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
                alt="Healno Logo"
                className="w-full h-full object-contain"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onBackToWebsite}
                  className="text-[10px] tracking-wider uppercase text-[#132A1F]/60 hover:text-[#132A1F] font-semibold flex items-center gap-1"
                >
                  <span>Healno</span>
                  <span className="text-[9px] bg-[#E8EFE9] text-[#2D6A4F] px-1 rounded">Website ↗</span>
                </button>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-[#132A1F] font-display leading-none">
                Hi, {profile.name.split(' ')[0]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            <PWAInstallButton variant="minimal" className="hidden sm:inline-flex" />

            {/* Orange Button to open Calendar in Profile */}
            <button
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Open Activity Calendar in Profile"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            {/* Daily Streak */}
            <button
              onClick={onOpenCalendar}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE5D9] hover:bg-[#ffd9c9] text-[#6B4435] text-xs font-semibold shadow-xs transition-colors"
              title="View Streak History in Profile Calendar"
            >
              <Flame className="w-3.5 h-3.5 text-[#E76F51] fill-[#E76F51]" />
              <span>{profile.streakDays}d</span>
            </button>

            {/* Spoon count indicator */}
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8EFE9] text-[#132A1F] text-xs font-semibold shadow-xs">
              <span className="text-xs">🥄</span>
              <span>{remainingSpoons}/{profile.dailySpoonsCapacity}</span>
            </div>

            {/* Profile Avatar Trigger */}
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#132A1F]/10 hover:border-[#E89D35] transition-all active:scale-95 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E89D35]/30"
              title="Open Profile & Settings"
              aria-label="User Profile"
            >
              <img
                src={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


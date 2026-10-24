import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';
import { HealnoLogo } from '../common/HealnoLogo';
import { UserAvatar } from '../common/UserAvatar';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { SpoonCapacitySelector } from '../common/SpoonCapacitySelector';

interface TopHeaderProps {
  profile: UserProfile;
  remainingSpoons: number;
  onOpenProfile: () => void;
  onOpenCalendar: () => void;
  onOpenAI: () => void;
  onUpdateCapacity?: (newCapacity: number) => void;
  onBackToWebsite?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  remainingSpoons,
  onOpenProfile,
  onOpenCalendar,
  onOpenAI,
  onUpdateCapacity,
  onBackToWebsite,
}) => {
  const [isSpoonModalOpen, setIsSpoonModalOpen] = useState(false);
  const displayName = profile.name?.trim() && !profile.name.includes('@') 
    ? profile.name.split(' ')[0] 
    : 'Friend';

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#F8F6F0]/95 backdrop-blur-md px-4 py-3 border-b border-[#132A1F]/5 transition-all">
        <div className="max-w-4xl mx-auto">
          {/* Top bar with Brand Logo, Streak, Calendar, Spoons, and User Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onBackToWebsite}
                title="Return to Healno Landing Website"
                className="p-1 flex items-center justify-center transition-transform active:scale-95 focus:outline-none"
              >
                <HealnoLogo size={34} />
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
                  Hi, {displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* PWA Install Button */}
              <PWAInstallButton variant="minimal" className="hidden sm:inline-flex" />

              {/* Orange Button to open Calendar in Profile */}
              <button
                onClick={onOpenCalendar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF7A24] hover:bg-[#d86214] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Open Activity Calendar in Profile"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </button>

              {/* Daily Streak */}
              <button
                onClick={onOpenCalendar}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE5D9] hover:bg-[#ffd9c9] text-[#6B4435] text-xs font-semibold shadow-xs transition-colors"
                title="View Streak History in Profile Calendar"
              >
                <Flame className="w-3.5 h-3.5 text-[#FF7A24] fill-[#FF7A24]" />
                <span>{profile.streakDays || 0}d</span>
              </button>

              {/* Interactive Spoon count indicator */}
              <button
                onClick={() => setIsSpoonModalOpen(true)}
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8EFE9] hover:bg-[#d8e8da] text-[#132A1F] text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                title="Click to customize daily spoon count (12 to 24 or custom)"
              >
                <svg className="w-3.5 h-3.5 text-[#FF7A24]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.69 2 6 4.69 6 8c0 2.97 2.16 5.43 5 5.91V21a1 1 0 0 0 2 0v-7.09c2.84-.48 5-2.94 5-5.91 0-3.31-2.69-6-6-6z" />
                </svg>
                <span>{remainingSpoons}/{profile.dailySpoonsCapacity || 12}</span>
              </button>

              {/* User Avatar Trigger */}
              <button
                onClick={onOpenProfile}
                className="rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF7A24]/50"
                title="Open Profile & Settings"
                aria-label="User Profile"
              >
                <UserAvatar
                  name={profile.name}
                  email={profile.email}
                  avatarUrl={profile.avatarUrl}
                  size="md"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal for adjusting spoon capacity */}
      {isSpoonModalOpen && onUpdateCapacity && (
        <SpoonCapacitySelector
          currentCapacity={profile.dailySpoonsCapacity || 12}
          remainingSpoons={remainingSpoons}
          onUpdateCapacity={onUpdateCapacity}
          onClose={() => setIsSpoonModalOpen(false)}
        />
      )}
    </>
  );
};

import React from 'react';
import { Home, Activity, BookOpen, Compass, Users } from 'lucide-react';

export type NavTab = 'home' | 'symptoms' | 'myths' | 'space' | 'community';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

/**
 * BottomNav — 5 Primary Application Sections
 * 1. Home
 * 2. Symptoms
 * 3. Myths (Evidence-based learning)
 * 4. Space (Daily activity tracker, pacing & reflection)
 * 5. Community (Supportive shared experiences)
 *
 * (Quick Log and Emotion Core have been completely removed)
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'symptoms', label: 'Symptoms', icon: Activity },
    { tab: 'myths', label: 'Myths', icon: BookOpen },
    { tab: 'space', label: 'Space', icon: Compass },
    { tab: 'community', label: 'Community', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#132A1F]/95 backdrop-blur-md border-t border-[#132A1F]/10 px-3 py-2 transition-all shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-[#FF7A24] font-bold scale-105'
                  : 'text-[#132A1F]/60 hover:text-[#132A1F] hover:bg-black/5'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[#FF7A24] text-white shadow-md shadow-[#FF7A24]/30'
                    : 'text-[#132A1F]/70'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] tracking-tight mt-1 ${
                  isActive ? 'text-[#FF7A24] font-bold' : 'text-[#132A1F]/70 font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

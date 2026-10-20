import React from 'react';
import { Home, Activity, Pill, Gauge, Users, Plus, Sparkles } from 'lucide-react';

export type NavTab = 'home' | 'symptoms' | 'meds' | 'pace' | 'community';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickAction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onQuickAction,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#132A1F]/95 backdrop-blur-md border-t border-[#132A1F]/10 px-4 py-2 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-[#132A1F] font-bold'
              : 'text-[#132A1F]/50 hover:text-[#132A1F]'
          }`}
          aria-label="Home Dashboard"
        >
          <div className={`p-1 rounded-full ${currentTab === 'home' ? 'bg-[#132A1F] text-white' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* Tab 2: Symptoms */}
        <button
          onClick={() => onSelectTab('symptoms')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            currentTab === 'symptoms'
              ? 'text-[#132A1F] font-bold'
              : 'text-[#132A1F]/50 hover:text-[#132A1F]'
          }`}
          aria-label="Symptom & Mood Tracking"
        >
          <div className={`p-1 rounded-full ${currentTab === 'symptoms' ? 'bg-[#132A1F] text-white' : ''}`}>
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Symptoms</span>
        </button>

        {/* Center Floating Elevated Action Button (+) matching reference image */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onQuickAction}
            className="w-13 h-13 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white flex items-center justify-center shadow-lg shadow-[#E89D35]/35 active:scale-95 transition-transform border-4 border-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#E89D35]"
            title="Quick Log or AI Companion"
            aria-label="Quick Log & AI Companion"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-semibold text-[#132A1F]/70 mt-1">Quick Log</span>
        </div>

        {/* Tab 3: Meds */}
        <button
          onClick={() => onSelectTab('meds')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            currentTab === 'meds'
              ? 'text-[#132A1F] font-bold'
              : 'text-[#132A1F]/50 hover:text-[#132A1F]'
          }`}
          aria-label="Medications"
        >
          <div className={`p-1 rounded-full ${currentTab === 'meds' ? 'bg-[#132A1F] text-white' : ''}`}>
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Meds</span>
        </button>

        {/* Tab 4: Pace */}
        <button
          onClick={() => onSelectTab('pace')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            currentTab === 'pace'
              ? 'text-[#132A1F] font-bold'
              : 'text-[#132A1F]/50 hover:text-[#132A1F]'
          }`}
          aria-label="Pacing & Spoon Budget"
        >
          <div className={`p-1 rounded-full ${currentTab === 'pace' ? 'bg-[#132A1F] text-white' : ''}`}>
            <Gauge className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Pace</span>
        </button>

        {/* Tab 5: Community */}
        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            currentTab === 'community'
              ? 'text-[#132A1F] font-bold'
              : 'text-[#132A1F]/50 hover:text-[#132A1F]'
          }`}
          aria-label="Supportive Community"
        >
          <div className={`p-1 rounded-full ${currentTab === 'community' ? 'bg-[#132A1F] text-white' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Community</span>
        </button>
      </div>
    </nav>
  );
};

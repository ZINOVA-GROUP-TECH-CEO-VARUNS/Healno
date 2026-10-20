import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, CloudOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:right-auto z-50 flex items-center gap-2.5 rounded-2xl bg-[#132A1F]/95 text-white backdrop-blur-md px-4 py-2.5 text-xs font-medium shadow-xl border border-white/10 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E89D35] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E89D35]" />
      </span>
      <div className="flex-1">
        <span className="font-bold text-[#B7E4C7]">Offline Mode Active</span>
        <span className="block text-[11px] text-white/80">
          Your journal, symptom logs, and medication records are cached locally.
        </span>
      </div>
    </div>
  );
};

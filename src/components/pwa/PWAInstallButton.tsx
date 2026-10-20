import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'minimal' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as standalone PWA, suppress
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS (e.g., standard browser already or unsupported), still allow manual guide or keep clean
  if (!isInstallable && !isIOS) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#132A1F] bg-[#E8EFE9] hover:bg-[#d8e3da] transition-all shadow-2xs active:scale-95 ${className}`}
          title="Install Healno as an App"
        >
          <img
            src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
            alt="Healno Logo"
            className="w-3.5 h-3.5 object-contain"
          />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div
          className={`bg-linear-to-r from-[#132A1F] to-[#2D6A4F] text-white p-3.5 sm:p-4 rounded-3xl shadow-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
                alt="Healno"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-bold font-display text-[#B7E4C7] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Install Healno App</span>
              </div>
              <p className="text-[11px] text-white/80">
                Install on your device for one-tap daily access and full offline care.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold text-xs shadow-xs transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Install on iPhone / iPad' : 'Install App'}</span>
          </button>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Default Primary Button
  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-all active:scale-95 font-display ${className}`}
      >
        <img
          src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
          alt="Healno Logo"
          className="w-4 h-4 object-contain"
        />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#132A1F]/10 space-y-4 text-[#132A1F]">
        <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
              alt="Healno"
              className="w-6 h-6 object-contain"
            />
            <h3 className="text-base font-bold font-display">Install Healno on iOS</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center hover:bg-[#d8e3da] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#132A1F]/75 leading-relaxed">
          Install Healno directly on your iPhone or iPad home screen for an app-like experience with offline access:
        </p>

        <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#E8EFE9] text-[#2D6A4F] font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <span className="font-semibold">Tap the Share button</span> in the bottom bar of Safari (
              <Share className="w-3.5 h-3.5 inline text-[#2D6A4F]" />
              ).
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#E8EFE9] text-[#2D6A4F] font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <span className="font-semibold">Scroll down</span> and select{' '}
              <span className="font-bold inline-flex items-center gap-1 bg-[#F8F6F0] px-1.5 py-0.5 rounded border border-[#132A1F]/10">
                <PlusSquare className="w-3 h-3" /> Add to Home Screen
              </span>
              .
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#E8EFE9] text-[#2D6A4F] font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              Tap <span className="font-bold text-[#2D6A4F]">Add</span> in the top-right corner to finish.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-xs transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

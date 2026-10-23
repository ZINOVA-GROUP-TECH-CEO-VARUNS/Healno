import React, { useState } from 'react';
import { X, Check, Sparkles, Plus, Minus, Info } from 'lucide-react';

interface SpoonCapacitySelectorProps {
  currentCapacity: number;
  remainingSpoons: number;
  onUpdateCapacity: (newCapacity: number) => void;
  onClose?: () => void;
  variant?: 'modal' | 'inline';
}

const PRESET_COUNTS = [12, 14, 16, 18, 20, 22, 24];

export const SpoonCapacitySelector: React.FC<SpoonCapacitySelectorProps> = ({
  currentCapacity,
  remainingSpoons,
  onUpdateCapacity,
  onClose,
  variant = 'modal',
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(currentCapacity || 12);
  const [customInput, setCustomInput] = useState<string>(String(currentCapacity || 12));
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Compute delta to show user preview of new remaining spoons
  const spentOrRecoveredOffset = (currentCapacity || 12) - remainingSpoons;
  const previewRemaining = Math.max(0, selectedCount - spentOrRecoveredOffset);

  const handleSelectPreset = (count: number) => {
    setSelectedCount(count);
    setCustomInput(String(count));
    setErrorMsg('');
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 99) {
      setSelectedCount(parsed);
      setErrorMsg('');
    } else if (val === '') {
      setErrorMsg('Please enter a number between 1 and 99');
    } else {
      setErrorMsg('Spoon count must be between 1 and 99');
    }
  };

  const handleStep = (delta: number) => {
    const next = Math.min(99, Math.max(1, selectedCount + delta));
    setSelectedCount(next);
    setCustomInput(String(next));
    setErrorMsg('');
  };

  const handleSave = () => {
    const parsed = parseInt(customInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 99) {
      setErrorMsg('Please enter a valid spoon capacity between 1 and 99');
      return;
    }
    onUpdateCapacity(parsed);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onClose) onClose();
    }, 600);
  };

  const content = (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-[#E8EFE9] border border-[#2D6A4F]/20 rounded-2xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-[#2D6A4F]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.69 2 6 4.69 6 8c0 2.97 2.16 5.43 5 5.91V21a1 1 0 0 0 2 0v-7.09c2.84-.48 5-2.94 5-5.91 0-3.31-2.69-6-6-6z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#132A1F]">The Spoon Theory Energy Budget</h4>
          <p className="text-[11px] text-[#132A1F]/70 mt-0.5 leading-relaxed">
            Your daily spoon count is your starting energy reserve. Choose from standard presets (12 to 24) or customize to any number that aligns with your flare status.
          </p>
        </div>
      </div>

      {/* Quick Selection Presets (12 to 24) */}
      <div>
        <label className="block text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
          Quick Selection Presets (12 – 24)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {PRESET_COUNTS.map((count) => {
            const isSelected = selectedCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => handleSelectPreset(count)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-md shadow-[#FF7A24]/30 scale-102'
                    : 'bg-white hover:bg-[#F8F6F0] text-[#132A1F] border-[#132A1F]/15 hover:border-[#FF7A24]/40'
                }`}
              >
                <span className="text-sm">{count}</span>
                <span className="text-[9px] opacity-80">spoons</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Numeric Input */}
      <div>
        <label className="block text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
          Custom Spoon Capacity (Any Number 1 – 99)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={selectedCount <= 1}
            className="w-10 h-10 rounded-xl bg-white border border-[#132A1F]/15 hover:bg-[#F8F6F0] disabled:opacity-40 flex items-center justify-center text-[#132A1F] transition-all font-bold"
            title="Decrease by 1"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <input
              type="number"
              min={1}
              max={99}
              value={customInput}
              onChange={handleCustomInputChange}
              className="w-full px-4 py-2.5 bg-white border border-[#132A1F]/20 rounded-xl text-center text-lg font-bold text-[#132A1F] focus:outline-none focus:ring-2 focus:ring-[#FF7A24] focus:border-transparent transition-all"
              placeholder="e.g. 15"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#132A1F]/50 pointer-events-none">
              spoons / day
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={selectedCount >= 99}
            className="w-10 h-10 rounded-xl bg-white border border-[#132A1F]/15 hover:bg-[#F8F6F0] disabled:opacity-40 flex items-center justify-center text-[#132A1F] transition-all font-bold"
            title="Increase by 1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {errorMsg && <p className="text-[11px] text-red-600 font-medium mt-1">{errorMsg}</p>}
      </div>

      {/* Dynamic Real-Time Preview Card */}
      <div className="bg-[#FAF8F5] border border-[#132A1F]/10 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#FFE5D9] flex items-center justify-center text-[#FF7A24] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#132A1F]/60">Dynamically Updated Balance</div>
            <div className="text-xs font-bold text-[#132A1F]">
              Remaining Today: <span className="text-[#FF7A24] font-extrabold text-sm">{previewRemaining}</span> / {selectedCount} Spoons
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!!errorMsg}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
            isSaved
              ? 'bg-[#2D6A4F] text-white'
              : 'bg-[#FF7A24] hover:bg-[#e06516] text-white active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Apply Capacity</span>
          )}
        </button>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return <div className="p-1">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#132A1F]/10 relative animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF7A24]/10 flex items-center justify-center text-[#FF7A24]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.69 2 6 4.69 6 8c0 2.97 2.16 5.43 5 5.91V21a1 1 0 0 0 2 0v-7.09c2.84-.48 5-2.94 5-5.91 0-3.31-2.69-6-6-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#132A1F]">Adjust Daily Spoon Count</h3>
              <p className="text-[11px] text-[#132A1F]/60">Customize your daily energy budget</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#132A1F]/60 hover:text-[#132A1F] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {content}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ActivityEntry } from '../../types';
import { storageService } from '../../services/storage';
import {
  Compass,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Calendar,
  Trash2,
  CheckCircle2,
  Activity,
  Heart,
  Coffee,
  ShoppingBag,
  Home as HomeIcon,
  BookOpen,
  Footprints,
  Sliders,
  Filter,
} from 'lucide-react';
import { ActivityTrackerIllustration, EmptyStateIllustration } from '../common/CodeIllustrations';

interface SpaceScreenProps {
  onActivityLogged?: () => void;
  remainingSpoons?: number;
}

export const SpaceScreen: React.FC<SpaceScreenProps> = ({
  onActivityLogged,
  remainingSpoons = 12,
}) => {
  const [activities, setActivities] = useState<ActivityEntry[]>(() => storageService.getActivities());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [activityCategory, setActivityCategory] = useState<ActivityEntry['category']>('personal_care');
  const [activityName, setActivityName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  // Rest Timer State
  const [timerDuration, setTimerDuration] = useState(10 * 60); // 10 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTimerPreset, setSelectedTimerPreset] = useState(10);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = (presetMinutes: number = selectedTimerPreset) => {
    setIsTimerRunning(false);
    setSelectedTimerPreset(presetMinutes);
    setTimerDuration(presetMinutes * 60);
    setTimeLeft(presetMinutes * 60);
  };

  const handleLogRestSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((timerDuration - timeLeft) / 60));
    const newEntry: ActivityEntry = {
      id: `act_${Date.now()}`,
      category: 'personal_care',
      activityName: `Sensory Rest Pause (${elapsedMinutes}m)`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      durationMinutes: elapsedMinutes,
      notes: 'Completed calming sensory rest session to recover biological energy.',
      createdAt: new Date().toISOString(),
    };
    storageService.addActivity(newEntry);
    setActivities(storageService.getActivities());
    handleResetTimer(selectedTimerPreset);
    if (onActivityLogged) onActivityLogged();
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    const newEntry: ActivityEntry = {
      id: `act_${Date.now()}`,
      category: activityCategory,
      activityName: activityName.trim(),
      date,
      time,
      durationMinutes: Number(durationMinutes) || 15,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    storageService.addActivity(newEntry);
    setActivities(storageService.getActivities());
    setShowLogModal(false);
    setActivityName('');
    setNotes('');
    if (onActivityLogged) onActivityLogged();
  };

  const handleDeleteActivity = (id: string) => {
    storageService.deleteActivity(id);
    setActivities(storageService.getActivities());
  };

  const categories: { id: ActivityEntry['category']; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'personal_care', label: 'Personal Care', icon: Heart },
    { id: 'household', label: 'Household Cleaning', icon: HomeIcon },
    { id: 'groceries', label: 'Groceries & Errands', icon: ShoppingBag },
    { id: 'food_prep', label: 'Food & Meal Prep', icon: Coffee },
    { id: 'work_study', label: 'Work / Study', icon: BookOpen },
    { id: 'movement', label: 'Movement & Recreation', icon: Footprints },
    { id: 'custom', label: 'Custom Activity', icon: Sparkles },
  ];

  const filteredActivities = activities.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const timerProgress = timerDuration > 0 ? ((timerDuration - timeLeft) / timerDuration) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#FF7A24]" />
            <span>Space & Activity Tracker</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Log everyday activities, balance spoons, and cultivate intentional rest
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Rest & Pacing Tool Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132A1F] font-display">Sensory Rest & Pacing Pause</h3>
              <p className="text-[11px] text-[#132A1F]/60">Close your eyes, dim lights, and recharge without screens</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => handleResetTimer(mins)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                  selectedTimerPreset === mins && !isTimerRunning
                    ? 'bg-[#FF7A24] text-white shadow-xs'
                    : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Circular Timer Visual Display */}
        <div className="flex flex-col items-center justify-center py-3">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#F1EFE9"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#FF7A24"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * timerProgress) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500"
              />
            </svg>

            {/* Time inside circle */}
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-2xl font-black font-display text-[#132A1F] tabular-nums tracking-tight">
                {formattedTime}
              </span>
              <span className="text-[10px] font-semibold text-[#132A1F]/50 uppercase tracking-wider">
                {isTimerRunning ? 'Resting...' : timeLeft === 0 ? 'Completed' : 'Pause Ready'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleStartPause}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                isTimerRunning ? 'bg-[#6B4435] hover:bg-[#573527]' : 'bg-[#FF7A24] hover:bg-[#E06516] shadow-[#FF7A24]/30'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{timeLeft < timerDuration ? 'Resume Rest' : 'Begin Rest'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleResetTimer(selectedTimerPreset)}
              className="p-2.5 rounded-full bg-[#F8F6F0] hover:bg-[#E8EFE9] text-[#132A1F]/70 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {timeLeft < timerDuration && (
              <button
                onClick={handleLogRestSession}
                className="text-xs bg-[#E8EFE9] hover:bg-[#d8e3da] text-[#132A1F] font-bold px-3 py-2 rounded-full transition-colors"
              >
                Save Rest Log
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#132A1F]">
          <span>Tracked Activities</span>
          <span className="text-[#132A1F]/50 font-normal">{filteredActivities.length} logs</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#132A1F] text-white shadow-xs'
                : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
            }`}
          >
            All Activities
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#FF7A24] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities Feed / Empty State */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
          <EmptyStateIllustration type="tasks" />
          <h4 className="text-sm font-bold text-[#132A1F] font-display">No activities logged yet</h4>
          <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
            Record personal care, chores, grocery runs, food prep, or rest sessions to see your actual daily exertion and pace your spoons.
          </p>
          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Your First Activity</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const catMeta = categories.find((c) => c.id === act.category) || categories[0];
            const Icon = catMeta.icon;
            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs flex items-center justify-between hover:border-[#FF7A24]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#132A1F]">{act.activityName}</h4>
                      <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.2 rounded-full font-semibold">
                        {act.durationMinutes || 15}m
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#132A1F]/50 mt-0.5">
                      <span>{act.date}</span>
                      {act.time && <span>· {act.time}</span>}
                      <span>· {catMeta.label}</span>
                    </div>
                    {act.notes && (
                      <p className="text-[11px] text-[#132A1F]/70 mt-1 line-clamp-1 italic">
                        "{act.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="w-8 h-8 rounded-full bg-[#F8F6F0] hover:bg-red-50 text-[#132A1F]/40 hover:text-red-500 flex items-center justify-center transition-colors"
                  title="Delete activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">Log Daily Activity</h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Category</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = activityCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setActivityCategory(cat.id)}
                        className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                          isSelected
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-xs'
                            : 'bg-white text-[#132A1F] border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Folding laundry, Grocery walk, Gentle stretch"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Notes or Physical Sensations (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="How did you feel during and after? Needed a break?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

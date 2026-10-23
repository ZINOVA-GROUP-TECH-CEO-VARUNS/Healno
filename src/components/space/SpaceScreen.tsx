import React, { useState, useEffect, useRef } from 'react';
import { ActivityEntry, WellnessSession, WellnessActivityType } from '../../types';
import { storageService } from '../../services/storage';
import { dbService } from '../../services/db';
import {
  Compass,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  Circle,
  Heart,
  Coffee,
  ShoppingBag,
  Home as HomeIcon,
  BookOpen,
  Footprints,
  Edit2,
  Archive,
  ArchiveRestore,
  Target,
  BarChart3,
  Check,
  Wind,
  Flame,
  Clock,
  ChevronRight,
  History,
  X,
  Volume2,
  Sliders,
} from 'lucide-react';
import { EmptyStateIllustration } from '../common/CodeIllustrations';

interface SpaceScreenProps {
  onActivityLogged?: () => void;
  remainingSpoons?: number;
}

type StudioTab = 'rest' | 'breathing' | 'activities' | 'history';

interface BreathPattern {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    name: '4-4-4-4 Box Breathing',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    description: 'Regulates autonomic nervous system, lowers cortisol, and calms racing heart.',
  },
  {
    name: '4-7-8 Deep Relaxation Breath',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    description: 'Natural tranquilizer for the nervous system, eases anxiety and promotes sleep.',
  },
  {
    name: '5-5 Coherent Heart Rate Pacing',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    description: 'Optimizes heart rate variability (HRV) and restores vagal tone.',
  },
];

export const SpaceScreen: React.FC<SpaceScreenProps> = ({
  onActivityLogged,
  remainingSpoons = 12,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('rest');

  // Activities & habit state
  const [activities, setActivities] = useState<ActivityEntry[]>(() => storageService.getActivities());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | null>(null);

  // Form states for custom activities
  const [activityCategory, setActivityCategory] = useState<ActivityEntry['category']>('personal_care');
  const [activityName, setActivityName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('mins');
  const [target, setTarget] = useState<number | ''>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  // 1. Sensory Rest Timer State (Includes 5m, 10m, 15m, 30m, and custom!)
  const [restPreset, setRestPreset] = useState<number>(10);
  const [customRestMinutes, setCustomRestMinutes] = useState<string>('30');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(10 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // 2. Guided Breathing State
  const [selectedBreathPattern, setSelectedBreathPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingElapsedSeconds, setBreathingElapsedSeconds] = useState<number>(0);
  const [breathingTargetMinutes, setBreathingTargetMinutes] = useState<number>(5);

  // 3. Wellness History State
  const [wellnessSessions, setWellnessSessions] = useState<WellnessSession[]>([]);
  const [sessionSaveNotice, setSessionSaveNotice] = useState<string>('');

  // Load history on mount
  useEffect(() => {
    async function loadSessions() {
      const records = await dbService.getWellnessSessions();
      setWellnessSessions(records);
    }
    loadSessions();
  }, []);

  // Timer Countdown Effect for Sensory Rest
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handleSaveCompletedWellnessSession(
        'sensory_rest',
        `Sensory Rest Pause (${Math.round(timerDuration / 60)}m)`,
        Math.round(timerDuration / 60),
        1
      );
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerDuration]);

  // Breathing Engine Effect
  useEffect(() => {
    let breathInterval: any = null;
    if (isBreathingActive) {
      breathInterval = setInterval(() => {
        setBreathingElapsedSeconds((sec) => sec + 1);

        setPhaseSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Transition to next breathing phase
          const pat = selectedBreathPattern;
          if (breathPhase === 'Inhale') {
            if (pat.holdIn > 0) {
              setBreathPhase('Hold');
              return pat.holdIn;
            } else {
              setBreathPhase('Exhale');
              return pat.exhale;
            }
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return pat.exhale;
          } else if (breathPhase === 'Exhale') {
            if (pat.holdOut > 0) {
              setBreathPhase('Rest');
              return pat.holdOut;
            } else {
              setBreathPhase('Inhale');
              return pat.inhale;
            }
          } else {
            setBreathPhase('Inhale');
            return pat.inhale;
          }
        });
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isBreathingActive, breathPhase, selectedBreathPattern]);

  // Rest Timer Controls
  const handleStartPauseRest = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetRestTimer = (mins: number) => {
    setIsTimerRunning(false);
    setRestPreset(mins);
    setTimerDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  const handleApplyCustomRest = () => {
    const parsed = parseInt(customRestMinutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
      handleResetRestTimer(parsed);
      setIsCustomMode(false);
    }
  };

  // Save session to Supabase & local storage
  const handleSaveCompletedWellnessSession = async (
    type: WellnessActivityType,
    title: string,
    durationMinutes: number,
    spoonsRecovered: number = 1,
    pattern?: string
  ) => {
    const session: WellnessSession = {
      id: `well_${Date.now()}`,
      activityType: type,
      title,
      durationMinutes,
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      spoonsRecovered,
      pattern,
      notes: `Completed ${durationMinutes}m restorative session. Restored energy reserve.`,
    };

    await dbService.saveWellnessSession(session);
    setWellnessSessions(await dbService.getWellnessSessions());
    setSessionSaveNotice(`Restorative session saved! (+${spoonsRecovered} Spoon recovered)`);
    setTimeout(() => setSessionSaveNotice(''), 4000);
    if (onActivityLogged) onActivityLogged();
  };

  const handleDeleteSession = async (id: string) => {
    await dbService.deleteWellnessSession(id);
    setWellnessSessions(await dbService.getWellnessSessions());
  };

  // Activity modal helpers
  const openCreateModal = () => {
    setEditingActivity(null);
    setActivityCategory('personal_care');
    setActivityName('');
    setDurationMinutes(15);
    setQuantity('');
    setUnit('mins');
    setTarget('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setNotes('');
    setShowLogModal(true);
  };

  const openEditModal = (activity: ActivityEntry) => {
    setEditingActivity(activity);
    setActivityCategory(activity.category);
    setActivityName(activity.activityName);
    setDurationMinutes(activity.durationMinutes || 15);
    setQuantity(activity.quantity !== undefined ? activity.quantity : '');
    setUnit(activity.unit || 'mins');
    setTarget(activity.target !== undefined ? activity.target : '');
    setDate(activity.date);
    setTime(activity.time || new Date().toTimeString().slice(0, 5));
    setNotes(activity.notes || '');
    setShowLogModal(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    if (editingActivity) {
      const updated: ActivityEntry = {
        ...editingActivity,
        activityName: activityName.trim(),
        category: activityCategory,
        durationMinutes: Number(durationMinutes) || 15,
        quantity: quantity === '' ? undefined : Number(quantity),
        unit: unit.trim() || 'mins',
        target: target === '' ? undefined : Number(target),
        date,
        time,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      storageService.updateActivity(updated);
    } else {
      const newEntry: ActivityEntry = {
        id: `act_${Date.now()}`,
        category: activityCategory,
        activityName: activityName.trim(),
        date,
        time,
        durationMinutes: Number(durationMinutes) || 15,
        quantity: quantity === '' ? undefined : Number(quantity),
        unit: unit.trim() || 'mins',
        target: target === '' ? undefined : Number(target),
        completed: false,
        archived: false,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      storageService.addActivity(newEntry);
    }

    setActivities(storageService.getActivities());
    setShowLogModal(false);
    if (onActivityLogged) onActivityLogged();
  };

  const handleToggleComplete = (id: string) => {
    storageService.toggleActivityComplete(id);
    setActivities(storageService.getActivities());
    if (onActivityLogged) onActivityLogged();
  };

  const handleToggleArchive = (id: string) => {
    storageService.toggleActivityArchive(id);
    setActivities(storageService.getActivities());
  };

  const handleDeleteActivity = (id: string) => {
    storageService.deleteActivity(id);
    setActivities(storageService.getActivities());
  };

  const categories = [
    { id: 'all', label: 'All Activities', icon: Compass },
    { id: 'personal_care', label: 'Personal Care', icon: Heart },
    { id: 'household', label: 'Household', icon: HomeIcon },
    { id: 'groceries', label: 'Errands', icon: ShoppingBag },
    { id: 'food_prep', label: 'Food Prep', icon: Coffee },
    { id: 'work_study', label: 'Work/Study', icon: BookOpen },
    { id: 'movement', label: 'Gentle Movement', icon: Footprints },
    { id: 'custom', label: 'Custom', icon: Sparkles },
  ];

  const activeActivities = activities.filter((a) => !a.archived);
  const archivedActivities = activities.filter((a) => a.archived);
  const displayedActivities = (viewTab === 'active' ? activeActivities : archivedActivities).filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  // Time format helpers
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedRestTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const timerProgress = timerDuration > 0 ? ((timerDuration - timeLeft) / timerDuration) * 100 : 0;

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#FF7A24]" />
            <span>Wellness & Pacing Studio</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Sensory rest pauses, somatic breathing, habit pacing, and recovery logs
          </p>
        </div>
      </div>

      {/* Save Notification */}
      {sessionSaveNotice && (
        <div className="bg-[#2D6A4F] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{sessionSaveNotice}</span>
          </div>
          <button onClick={() => setSessionSaveNotice('')} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'rest' as const, label: 'Sensory Rest', icon: Coffee },
          { id: 'breathing' as const, label: 'Guided Breathing', icon: Wind },
          { id: 'activities' as const, label: 'Activities & Habits', icon: Target },
          { id: 'history' as const, label: `History (${wellnessSessions.length})`, icon: History },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#132A1F] text-white border-[#132A1F] shadow-xs'
                  : 'bg-white hover:bg-[#F8F6F0] text-[#132A1F]/70 border-[#132A1F]/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: SENSORY REST & PACING PAUSE (5m, 10m, 15m, 30m, custom) ================= */}
      {activeTab === 'rest' && (
        <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132A1F] font-display">Sensory Rest & Pacing Pause</h3>
                <p className="text-[11px] text-[#132A1F]/60">Dim lights, close eyes, and recharge biological energy</p>
              </div>
            </div>

            {/* Presets: 5m, 10m, 15m, 30m, and Custom */}
            <div className="flex items-center gap-1 flex-wrap">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setIsCustomMode(false);
                    handleResetRestTimer(mins);
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                    restPreset === mins && !isCustomMode && !isTimerRunning
                      ? 'bg-[#FF7A24] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                  }`}
                >
                  {mins}m
                </button>
              ))}

              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border ${
                  isCustomMode
                    ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                    : 'bg-[#F8F6F0] text-[#132A1F]/70 border-[#132A1F]/10'
                }`}
              >
                Custom...
              </button>
            </div>
          </div>

          {/* Custom Duration Input Drawer */}
          {isCustomMode && (
            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#132A1F]/10 flex items-center justify-between gap-3 text-xs animate-fadeIn">
              <span className="font-semibold text-[#132A1F]">Set Custom Pause Duration:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={customRestMinutes}
                  onChange={(e) => setCustomRestMinutes(e.target.value)}
                  className="w-16 px-2.5 py-1 text-center bg-white border border-[#132A1F]/20 rounded-xl font-bold"
                />
                <span className="text-gray-500 font-medium">mins</span>
                <button
                  onClick={handleApplyCustomRest}
                  className="px-3 py-1 bg-[#2D6A4F] text-white font-bold rounded-xl"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Circular Timer Visual Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#F1EFE9" strokeWidth="6" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#FF7A24"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * timerProgress) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute text-center flex flex-col items-center">
                <span className="text-3xl font-black font-display text-[#132A1F] tabular-nums tracking-tight">
                  {formattedRestTime}
                </span>
                <span className="text-[10px] font-semibold text-[#132A1F]/50 uppercase tracking-wider mt-0.5">
                  {isTimerRunning ? 'Resting Peacefully...' : timeLeft === 0 ? 'Pause Complete' : 'Ready to Pause'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2.5 mt-4">
              <button
                onClick={handleStartPauseRest}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                  isTimerRunning ? 'bg-[#6B4435] hover:bg-[#573527]' : 'bg-[#FF7A24] hover:bg-[#E06516] shadow-[#FF7A24]/30'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Rest</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{timeLeft < timerDuration ? 'Resume Rest' : 'Begin Rest'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleResetRestTimer(restPreset)}
                className="p-2.5 rounded-full bg-[#F8F6F0] hover:bg-[#E8EFE9] text-[#132A1F]/70 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {timeLeft < timerDuration && (
                <button
                  onClick={() => {
                    const elapsed = Math.max(1, Math.round((timerDuration - timeLeft) / 60));
                    handleSaveCompletedWellnessSession('sensory_rest', `Sensory Rest Pause (${elapsed}m)`, elapsed, 1);
                    handleResetRestTimer(restPreset);
                  }}
                  className="text-xs bg-[#E8EFE9] hover:bg-[#d8e3da] text-[#2D6A4F] font-bold px-3.5 py-2 rounded-full transition-colors"
                >
                  Save & Recover Spoon
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: GUIDED BREATHING ================= */}
      {activeTab === 'breathing' && (
        <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E8EFE9] text-[#2D6A4F] flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#132A1F] font-display">Guided Somatic Breathing</h3>
                <p className="text-[11px] text-[#132A1F]/60">Soothes sympathetic nerve overdrive and relieves tension</p>
              </div>
            </div>
          </div>

          {/* Pattern selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BREATH_PATTERNS.map((pat) => (
              <button
                key={pat.name}
                onClick={() => {
                  setSelectedBreathPattern(pat);
                  setBreathPhase('Inhale');
                  setPhaseSecondsLeft(pat.inhale);
                  setIsBreathingActive(false);
                }}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedBreathPattern.name === pat.name
                    ? 'bg-[#E8EFE9] border-[#2D6A4F] text-[#132A1F]'
                    : 'bg-[#FAF8F5] border-transparent hover:border-[#132A1F]/10 text-[#132A1F]/80'
                }`}
              >
                <div className="text-xs font-bold">{pat.name}</div>
                <div className="text-[10px] text-[#132A1F]/60 mt-0.5 leading-snug">{pat.description}</div>
              </button>
            ))}
          </div>

          {/* Visual Breathing Bubble */}
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-center transition-all duration-1000 shadow-lg ${
                breathPhase === 'Inhale'
                  ? 'scale-110 bg-gradient-to-br from-[#B7E4C7] to-[#74C69D] text-[#132A1F]'
                  : breathPhase === 'Hold'
                  ? 'scale-110 bg-gradient-to-br from-[#FFD166] to-[#F4A261] text-[#132A1F]'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] text-white'
                  : 'scale-90 bg-gradient-to-br from-[#E8EFE9] to-[#D8E2DC] text-[#132A1F]'
              }`}
            >
              <span className="text-lg font-extrabold uppercase tracking-wider">{breathPhase}</span>
              <span className="text-3xl font-black mt-1 tabular-nums">{phaseSecondsLeft}s</span>
              <span className="text-[10px] opacity-80 mt-1">
                {breathPhase === 'Inhale'
                  ? 'Slowly through nose'
                  : breathPhase === 'Hold'
                  ? 'Soft & relaxed'
                  : 'Gently through mouth'}
              </span>
            </div>

            {/* Breathing controls */}
            <div className="flex items-center gap-2.5 mt-5">
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                  isBreathingActive
                    ? 'bg-[#6B4435] hover:bg-[#573527]'
                    : 'bg-[#2D6A4F] hover:bg-[#1B4332] shadow-[#2D6A4F]/30'
                }`}
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isBreathingActive ? 'Pause Breathing' : 'Start Breathing Guide'}</span>
              </button>

              {breathingElapsedSeconds > 30 && (
                <button
                  onClick={() => {
                    const elapsedMins = Math.max(1, Math.round(breathingElapsedSeconds / 60));
                    handleSaveCompletedWellnessSession(
                      'breathing',
                      `${selectedBreathPattern.name} (${elapsedMins}m)`,
                      elapsedMins,
                      1,
                      selectedBreathPattern.name
                    );
                    setBreathingElapsedSeconds(0);
                    setIsBreathingActive(false);
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#E8EFE9] text-[#2D6A4F] text-xs font-bold hover:bg-[#d8e6da]"
                >
                  Log Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ACTIVITIES & HABITS TRACKER ================= */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-3xl border border-[#132A1F]/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewTab('active')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewTab === 'active' ? 'bg-[#132A1F] text-white shadow-xs' : 'text-[#132A1F]/60'
                }`}
              >
                Active ({activeActivities.length})
              </button>
              <button
                onClick={() => setViewTab('archived')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewTab === 'archived' ? 'bg-[#132A1F] text-white shadow-xs' : 'text-[#132A1F]/60'
                }`}
              >
                Archived ({archivedActivities.length})
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Activity</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === c.id
                    ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                    : 'bg-white text-[#132A1F]/70 border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Activities List */}
          {displayedActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#132A1F]/10">
              <EmptyStateIllustration className="w-16 h-16 mx-auto mb-2 text-[#132A1F]/40" />
              <h4 className="text-sm font-bold text-[#132A1F]">No activities found in this view</h4>
              <p className="text-xs text-[#132A1F]/60 mt-1 max-w-xs mx-auto">
                Customize your habits, hydration goals, gentle walks, and household chores with numerical targets.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedActivities.map((act) => (
                <div
                  key={act.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                    act.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#132A1F]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(act.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                        act.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-[#132A1F]/30 hover:border-[#132A1F]'
                      }`}
                    >
                      {act.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className={`text-xs font-bold text-[#132A1F] ${act.completed ? 'line-through opacity-70' : ''}`}>
                        {act.activityName}
                      </div>
                      <div className="text-[10px] text-[#132A1F]/60 mt-0.5 flex items-center gap-2">
                        {act.quantity !== undefined && (
                          <span className="font-semibold text-[#2D6A4F]">
                            Progress: {act.quantity} {act.unit || ''} {act.target ? `/ ${act.target}` : ''}
                          </span>
                        )}
                        <span>{act.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(act)}
                      className="p-1.5 text-gray-400 hover:text-[#132A1F] rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(act.id)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg"
                      title={act.archived ? 'Restore' : 'Archive'}
                    >
                      {act.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: WELLNESS HISTORY LOG ================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/8">
            <h3 className="text-sm font-bold text-[#132A1F] flex items-center gap-2">
              <History className="w-4 h-4 text-[#2D6A4F]" />
              <span>Wellness Sessions History ({wellnessSessions.length})</span>
            </h3>
            <span className="text-[11px] text-[#2D6A4F] font-bold">
              +{wellnessSessions.reduce((sum, s) => sum + (s.spoonsRecovered || 1), 0)} Spoons Restored
            </span>
          </div>

          {wellnessSessions.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Coffee className="w-10 h-10 text-[#132A1F]/30 mx-auto" />
              <p className="text-xs text-[#132A1F]/70 font-medium">No wellness sessions recorded yet.</p>
              <p className="text-[11px] text-[#132A1F]/50 max-w-xs mx-auto">
                Complete a guided somatic breathing or sensory rest pause above to log your restorative records.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {wellnessSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[#FAF8F5] rounded-2xl p-3 border border-[#132A1F]/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#132A1F] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                      <span>{session.title}</span>
                    </div>
                    <div className="text-[10px] text-[#132A1F]/60 flex items-center gap-2">
                      <span>{session.date} {session.time ? `· ${session.time}` : ''}</span>
                      <span className="text-[#FF7A24] font-bold">+{session.spoonsRecovered || 1} spoon</span>
                      <span>{session.durationMinutes} mins</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Create/Edit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-[#132A1F]/10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#132A1F]/10 pb-3">
              <h3 className="text-base font-bold text-[#132A1F]">
                {editingActivity ? 'Edit Activity' : 'Add New Activity'}
              </h3>
              <button onClick={() => setShowLogModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#132A1F] mb-1">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. 15-Minute Forest Stroll"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#132A1F] mb-1">Category</label>
                  <select
                    value={activityCategory}
                    onChange={(e) => setActivityCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-2.5 py-2 text-xs font-medium"
                  >
                    <option value="personal_care">Personal Care</option>
                    <option value="household">Household</option>
                    <option value="groceries">Groceries / Errands</option>
                    <option value="food_prep">Food Prep</option>
                    <option value="work_study">Work / Study</option>
                    <option value="movement">Gentle Movement</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#132A1F] mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#132A1F] mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#132A1F] mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="steps / mins"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#132A1F] mb-1">Target</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#132A1F] mb-1">Pacing Notes</label>
                <textarea
                  placeholder="How did your energy feel during this task?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7A24] text-white font-bold"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

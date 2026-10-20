import React, { useState, useMemo } from 'react';
import { UserProfile, Achievement, JournalEntry, SymptomLog, EmotionScore, MedicationEvent, PacingTask } from '../../types';
import {
  User,
  Shield,
  Bell,
  Award,
  Download,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
  FileDown,
  LogOut,
  Moon,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookOpen,
  Activity,
  Pill,
  Battery,
  Clock,
  Tag,
  Plus,
  Info,
} from 'lucide-react';
import { storageService } from '../../services/storage';

interface ProfileScreenProps {
  profile: UserProfile;
  achievements: Achievement[];
  initialTab?: 'profile' | 'calendar' | 'achievements' | 'privacy';
  onUpdateProfile: (updated: UserProfile) => void;
  onExportAllData: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onBack: () => void;
  onOpenJournal?: () => void;
  onOpenSymptoms?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  achievements,
  initialTab,
  onUpdateProfile,
  onExportAllData,
  onResetData,
  onLogout,
  onBack,
  onOpenJournal,
  onOpenSymptoms,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'achievements' | 'privacy'>(
    initialTab || 'profile'
  );

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // 7-day quick scroller strip moved from home page to profile section
  const sevenDays = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - 3 + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === baseDate.toISOString().split('T')[0];
      return { dayName, dayNumber, dateStr, isToday };
    });
  }, []);


  // Calculate real streak directly from actual persisted records using local date
  const realStreak = useMemo(() => {
    return storageService.calculateRealStreak();
  }, [profile, activeTab]);

  // Map of all active dates with activity types
  const activeDateMap = useMemo(() => {
    return storageService.getAllActiveDates();
  }, [profile, activeTab]);

  // Selected date historical day data
  const selectedDayData = useMemo(() => {
    return storageService.getHistoricalDayData(selectedCalendarDate);
  }, [selectedCalendarDate, profile, activeTab]);

  // Toggle notifications
  const handleToggleNotification = (key: keyof UserProfile['notificationPrefs']) => {
    const updated = {
      ...profile,
      notificationPrefs: {
        ...profile.notificationPrefs,
        [key]: !profile.notificationPrefs[key],
      },
    };
    onUpdateProfile(updated);
  };

  // Calendar navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedCalendarDate(now.toISOString().split('T')[0]);
  };

  // Month grid calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Days from previous month for padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, pDay);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNumber: pDay,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(currentYear, currentMonth, d);
      // Format to YYYY-MM-DD using local numbers
      const y = thisDate.getFullYear();
      const m = String(thisDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${day}`,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Remaining days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      days.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Month stats calculation
  const monthStats = useMemo(() => {
    const currentPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    let activeDays = 0;
    let journalCount = 0;
    let symptomCount = 0;
    let medCount = 0;

    Object.entries(activeDateMap).forEach(([dateStr, activities]) => {
      if (dateStr.startsWith(currentPrefix)) {
        if (activities.journal || activities.symptoms || activities.meds || activities.tasks) {
          activeDays++;
        }
        if (activities.journal) journalCount++;
        if (activities.symptoms) symptomCount++;
        if (activities.meds) medCount++;
      }
    });

    return { activeDays, journalCount, symptomCount, medCount };
  }, [currentYear, currentMonth, activeDateMap]);

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Profile & Settings</h2>
          <p className="text-xs text-[#132A1F]/60">Your health identity, activity calendar, and data privacy</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E89D35] hover:bg-[#d88d25] text-white px-4 py-1.5 rounded-full font-bold shadow-xs transition-colors active:scale-95"
        >
          Back
        </button>
      </div>

      {/* Tabs with Healno Orange active state */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-[#E89D35] text-white shadow-xs'
              : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'calendar'
              ? 'bg-[#E89D35] text-white shadow-xs'
              : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'achievements'
              ? 'bg-[#E89D35] text-white shadow-xs'
              : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Badges ({profile.badges.length})
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'privacy'
              ? 'bg-[#E89D35] text-white shadow-xs'
              : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Privacy & Data
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* User Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#132A1F]/20 shadow-xs">
              <img
                src={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#132A1F] font-display truncate">{profile.name}</h3>
              <p className="text-xs text-[#132A1F]/60 truncate">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                  {profile.age || 32} years old
                </span>
                <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#E76F51] fill-[#E76F51]" />
                  <span>{realStreak} Day Streak</span>
                </span>
                <span className="text-[10px] bg-[#FFFDF9] border border-[#E89D35]/30 text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                  {profile.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calendar Trigger Banner in Profile */}
          <div
            onClick={() => setActiveTab('calendar')}
            className="bg-linear-to-r from-[#132A1F] to-[#2D6A4F] text-white rounded-3xl p-5 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B7E4C7]">
                  <CalendarIcon className="w-4 h-4 text-[#E89D35]" />
                  <span>Activity Calendar & Streak History</span>
                </div>
                <h4 className="text-base font-bold font-display text-white">
                  {realStreak} Day Active Streak
                </h4>
                <p className="text-[11px] text-white/80 max-w-[280px]">
                  Explore your interactive calendar, daily check-ins, journal reflections, and historical logs.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold px-3.5 py-1.5 rounded-full shadow-xs transition-transform active:scale-95">
                    <span>Open Calendar & History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-[#E89D35] text-white flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-md">
                <CalendarIcon className="w-6 h-6" />
              </div>
            </div>
            {/* Subtle decorative glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#E89D35]/20 blur-xl pointer-events-none" />
          </div>

          {/* Health Conditions */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
              Recorded Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.conditions.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Preferences and Allergies */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-1.5">
                Dietary Focus
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.dietaryPreferences.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#F8F6F0] text-[#132A1F] border border-[#132A1F]/10 px-2.5 py-1 rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#132A1F]/5">
              <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-1.5">
                Known Allergies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.allergies.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#FFE5D9] text-[#6B4435] px-2.5 py-1 rounded-full font-semibold"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
              Gentle Reminders & Quiet Hours
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#132A1F]">Medication reminders</div>
                  <div className="text-[10px] text-[#132A1F]/60">Timely gentle check-ins</div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationPrefs.medications}
                  onChange={() => handleToggleNotification('medications')}
                  className="w-4 h-4 accent-[#132A1F]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#132A1F]">Daily rest break prompts</div>
                  <div className="text-[10px] text-[#132A1F]/60">Pacing reminder when active</div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationPrefs.restBreaks}
                  onChange={() => handleToggleNotification('restBreaks')}
                  className="w-4 h-4 accent-[#132A1F]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#132A1F]">Upcoming appointment prep</div>
                  <div className="text-[10px] text-[#132A1F]/60">Prompt 48h prior to visits</div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationPrefs.appointments}
                  onChange={() => handleToggleNotification('appointments')}
                  className="w-4 h-4 accent-[#132A1F]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CALENDAR & HISTORY */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Header Card with Real Streak and Month Stats */}
          <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7E4C7]">
                  Persisted Health Records
                </span>
                <h3 className="text-lg font-bold font-display mt-0.5">
                  Activity & Streak Calendar
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FFE5D9] text-[#6B4435] px-3 py-1.5 rounded-full font-bold text-xs shadow-xs">
                <Flame className="w-4 h-4 text-[#E76F51] fill-[#E76F51]" />
                <span>{realStreak} Day Streak</span>
              </div>
            </div>

            {/* Monthly stats badges */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-base font-bold font-display text-[#B7E4C7]">
                  {monthStats.activeDays}
                </div>
                <div className="text-[10px] text-white/70">Active Days</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-base font-bold font-display text-[#F7C04A]">
                  {monthStats.journalCount}
                </div>
                <div className="text-[10px] text-white/70">Journal Days</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-base font-bold font-display text-[#74C69D]">
                  {monthStats.symptomCount}
                </div>
                <div className="text-[10px] text-white/70">Symptoms</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-base font-bold font-display text-[#FFE5D9] text-peach-200">
                  {monthStats.medCount}
                </div>
                <div className="text-[10px] text-white/70">Med Logs</div>
              </div>
            </div>
          </div>

          {/* 7-Day Quick Activity Selector Strip (moved from Home page to Profile Calendar section) */}
          <div className="bg-white rounded-3xl p-4 border border-[#132A1F]/10 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#132A1F] flex items-center gap-1.5 font-display">
                <CalendarIcon className="w-3.5 h-3.5 text-[#E89D35]" />
                <span>7-Day Quick Activity Strip</span>
              </span>
              <span className="text-[11px] font-bold text-[#E89D35]">
                {selectedCalendarDate === today.toISOString().split('T')[0] ? 'Today' : selectedCalendarDate}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
              {sevenDays.map((item) => {
                const isSelected = selectedCalendarDate === item.dateStr;
                const hasActivity = !!activeDateMap[item.dateStr];
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => {
                      setSelectedCalendarDate(item.dateStr);
                      const d = new Date(item.dateStr);
                      setCurrentYear(d.getFullYear());
                      setCurrentMonth(d.getMonth());
                    }}
                    className={`flex flex-col items-center justify-center flex-1 min-w-[42px] py-2 px-1 rounded-2xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#E89D35] text-white shadow-md shadow-[#E89D35]/30 scale-105 font-bold'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:text-[#132A1F] hover:bg-[#E8EFE9]'
                    }`}
                  >
                    <span className="text-[10px] font-medium tracking-tight mb-0.5">
                      {item.dayName}
                    </span>
                    <span className="text-sm leading-tight tabular-nums font-display">
                      {item.dayNumber}
                    </span>
                    {hasActivity && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#E89D35]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Month Calendar Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            {/* Month Navigation Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/5">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#132A1F] font-display">
                  {monthNames[currentMonth]} {currentYear}
                </h4>
                <button
                  onClick={handleJumpToToday}
                  className="text-[10px] bg-[#E89D35] hover:bg-[#d88d25] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs transition-colors active:scale-95"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-full bg-[#F8F6F0] hover:bg-[#E8EFE9] text-[#132A1F] flex items-center justify-center transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-full bg-[#F8F6F0] hover:bg-[#E8EFE9] text-[#132A1F] flex items-center justify-center transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Activity Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#132A1F]/70 px-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E89D35]" />
                <span>Journal / Diary</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                <span>Symptom Log</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
                <span>Meds Taken</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#52B788]" />
                <span>Pacing Task</span>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#132A1F]/50 uppercase tracking-wider py-1">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell) => {
                const isSelected = selectedCalendarDate === cell.dateStr;
                const isToday = cell.dateStr === today.toISOString().split('T')[0];
                const activity = activeDateMap[cell.dateStr];
                const hasActivity = Boolean(
                  activity &&
                  (activity.journal || activity.symptoms || activity.meds || activity.tasks)
                );

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedCalendarDate(cell.dateStr)}
                    className={`h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#132A1F] text-white shadow-md font-bold scale-102 z-10 ring-2 ring-[#132A1F]/20'
                        : isToday
                        ? 'bg-[#E8EFE9] text-[#132A1F] font-bold border border-[#2D6A4F]/30'
                        : cell.isCurrentMonth
                        ? 'bg-[#F8F6F0] hover:bg-[#E8EFE9]/60 text-[#132A1F]'
                        : 'bg-transparent text-[#132A1F]/25 hover:text-[#132A1F]/60'
                    }`}
                  >
                    <span className="text-xs leading-none font-display">
                      {cell.dayNumber}
                    </span>

                    {/* Indicator dots for recorded activity */}
                    {hasActivity && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {activity?.journal && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#F7C04A]' : 'bg-[#E89D35]'
                            }`}
                            title="Journal Entry Recorded"
                          />
                        )}
                        {activity?.symptoms && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#B7E4C7]' : 'bg-[#2D6A4F]'
                            }`}
                            title="Symptom Check-in"
                          />
                        )}
                        {activity?.meds && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#FFE5D9]' : 'bg-[#E76F51]'
                            }`}
                            title="Medication Logged"
                          />
                        )}
                        {activity?.tasks && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#52B788]'
                            }`}
                            title="Pacing Task Done"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Historical Record Details for Selected Day */}
          <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D6A4F]">
                  Historical Record
                </span>
                <h4 className="text-base font-bold text-[#132A1F] font-display">
                  {new Date(selectedCalendarDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
              </div>

              {selectedDayData.hasActivity ? (
                <span className="text-[10px] bg-[#E8EFE9] text-[#2D6A4F] px-2.5 py-1 rounded-full font-bold">
                  Activity Recorded
                </span>
              ) : (
                <span className="text-[10px] bg-gray-100 text-[#132A1F]/50 px-2.5 py-1 rounded-full font-medium">
                  Quiet / Rest Day
                </span>
              )}
            </div>

            {/* Detail Blocks */}
            {selectedDayData.hasActivity ? (
              <div className="space-y-4">
                {/* 1. Journal & Diary Entries */}
                {selectedDayData.journal.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#132A1F]">
                        <BookOpen className="w-3.5 h-3.5 text-[#E89D35]" />
                        <span>Journal & Diary ({selectedDayData.journal.length})</span>
                      </div>
                      {onOpenJournal && (
                        <button
                          onClick={onOpenJournal}
                          className="text-[10px] text-[#2D6A4F] hover:underline font-semibold"
                        >
                          Open in Diary ↗
                        </button>
                      )}
                    </div>

                    {selectedDayData.journal.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="text-xs font-bold text-[#132A1F] font-display">
                            {entry.title}
                          </h5>
                          <div className="flex items-center gap-1 shrink-0">
                            {entry.moodRating && (
                              <span className="text-[9px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-medium">
                                {entry.moodRating}
                              </span>
                            )}
                            {entry.energyRating && (
                              <span className="text-[9px] bg-[#E8EFE9] text-[#132A1F] px-1.5 py-0.5 rounded-md font-bold">
                                ⚡ {entry.energyRating}/10
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#132A1F]/80 leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-3 rounded-xl border border-[#132A1F]/5">
                          {entry.content}
                        </p>

                        <div className="flex flex-wrap items-center justify-between text-[10px] text-[#132A1F]/40 pt-1">
                          <span>Recorded at {entry.time}</span>
                          {entry.tags && entry.tags.length > 0 && (
                            <span className="text-[#2D6A4F]">#{entry.tags.join(' #')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Symptom & Intensity Records */}
                {selectedDayData.symptoms.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#132A1F]">
                        <Activity className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Symptoms Tracked ({selectedDayData.symptoms.length})</span>
                      </div>
                      {onOpenSymptoms && (
                        <button
                          onClick={onOpenSymptoms}
                          className="text-[10px] text-[#2D6A4F] hover:underline font-semibold"
                        >
                          View Symptoms Tab ↗
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDayData.symptoms.map((symptom) => (
                        <div
                          key={symptom.id}
                          className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#132A1F]">{symptom.name}</span>
                            <span className="text-[10px] font-bold text-[#E76F51] bg-[#FFE5D9] px-2 py-0.5 rounded-full">
                              Intensity: {symptom.intensity}/10
                            </span>
                          </div>

                          {symptom.notes && (
                            <p className="text-[11px] text-[#132A1F]/70 italic line-clamp-2">
                              "{symptom.notes}"
                            </p>
                          )}

                          {symptom.restPeriods && (
                            <div className="text-[10px] text-[#2D6A4F] bg-[#E8EFE9] px-2 py-0.5 rounded-md font-medium">
                              Rest: {symptom.restPeriods}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Mood & Emotion Scores */}
                {selectedDayData.emotions && (
                  <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#132A1F]">
                        Emotional Balance: {selectedDayData.emotions.dominantMood}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-[#FFE8D6] rounded-xl p-2 border border-[#F4A261]/20">
                        <div className="font-bold text-[#6B4435]">{selectedDayData.emotions.happy}%</div>
                        <div className="text-[10px] text-[#6B4435]/70">Happy</div>
                      </div>
                      <div className="bg-[#FFE5D9] rounded-xl p-2 border border-[#E76F51]/20">
                        <div className="font-bold text-[#6B4435]">{selectedDayData.emotions.sad}%</div>
                        <div className="text-[10px] text-[#6B4435]/70">Sad</div>
                      </div>
                      <div className="bg-[#E8EFE9] rounded-xl p-2 border border-[#2D6A4F]/20">
                        <div className="font-bold text-[#2D6A4F]">{selectedDayData.emotions.calm}%</div>
                        <div className="text-[10px] text-[#2D6A4F]/70">Calm</div>
                      </div>
                      <div className="bg-[#E5DFD3] rounded-xl p-2 border border-[#132A1F]/15">
                        <div className="font-bold text-[#132A1F]">{selectedDayData.emotions.anxious}%</div>
                        <div className="text-[10px] text-[#132A1F]/70">Anxious</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Medication Logs */}
                {selectedDayData.medLogs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#132A1F]">
                      <Pill className="w-3.5 h-3.5 text-[#E76F51]" />
                      <span>Medication History ({selectedDayData.medLogs.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedDayData.medLogs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-white rounded-xl p-2.5 border border-[#132A1F]/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#132A1F]">{log.medName}</span>
                            <span className="text-[#132A1F]/50 ml-1.5">{log.dosage}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              log.status === 'taken'
                                ? 'bg-[#E8EFE9] text-[#2D6A4F]'
                                : 'bg-[#FFE5D9] text-[#E76F51]'
                            }`}
                          >
                            {log.status} at {log.recordedAt || 'scheduled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Energy Pacing Tasks */}
                {selectedDayData.tasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#132A1F]">
                      <Battery className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Pacing Tasks & Rest Windows ({selectedDayData.tasks.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedDayData.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl p-2.5 border border-[#132A1F]/10 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={task.completed ? 'text-[#2D6A4F]' : 'text-gray-400'}>
                              {task.completed ? '✓' : '○'}
                            </span>
                            <span className={`font-medium ${task.completed ? 'line-through text-[#132A1F]/60' : 'text-[#132A1F]'}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.isRestorative ? 'bg-[#E8EFE9] text-[#2D6A4F]' : 'bg-[#FFFDF9] text-[#E89D35] border border-[#E89D35]/30'
                          }`}>
                            {task.isRestorative ? '+ Spoons Restored' : `${task.spoonCost} Spoons`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Soothing Empty State for Quiet Rest Days */
              <div className="text-center py-6 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E8EFE9] text-[#2D6A4F] flex items-center justify-center mx-auto text-xl">
                  🌿
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#132A1F] font-display">
                    Quiet Day or Restful Period
                  </h5>
                  <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto mt-1 leading-relaxed">
                    No active check-in or journal entry recorded for this day. In chronic illness management, rest days without tracking are completely valid. Rest is never wasted.
                  </p>
                </div>

                {onOpenJournal && (
                  <button
                    onClick={onOpenJournal}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#132A1F] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#2D6A4F] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Write in Diary</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Kindness & Consistency Badges
              </h3>
              <span className="text-xs font-bold text-[#E89D35]">
                {profile.xp} Total XP
              </span>
            </div>
            <p className="text-xs text-[#132A1F]/70">
              Healno honors rest, self-compassion, and gentle daily presence. Never competitive or punitive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => {
              const isUnlocked = profile.badges.includes(ach.id) || ach.isUnlocked;
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-white border-[#74C69D]/40 shadow-xs'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">
                      {isUnlocked ? '🏅' : '🔒'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#132A1F]">{ach.title}</h4>
                      <span className="text-[10px] text-[#E89D35] font-semibold">+{ach.xp} XP</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#132A1F]/70 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & DATA */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-sm font-bold text-[#132A1F] font-display">
                Data Ownership & Protection
              </h3>
            </div>
            <p className="text-xs text-[#132A1F]/80 leading-relaxed">
              Your health diary, symptoms, medications, and document summaries are stored locally and encrypted in transit. You hold exclusive sovereignty over your health data.
            </p>

            <div className="pt-2 border-t border-[#132A1F]/5 space-y-2">
              <button
                onClick={onExportAllData}
                className="w-full py-2.5 px-4 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete JSON Health Export</span>
              </button>

              <button
                onClick={onResetData}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Local Data & Re-seed</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onLogout}
              className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-semibold flex items-center justify-center gap-1.5 mx-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

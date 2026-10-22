import React, { useMemo } from 'react';
import {
  UserProfile,
  SymptomLog,
  Medication,
  MedicationEvent,
  JournalTask,
  Appointment,
  MealRecipe,
  Lesson,
} from '../../types';
import {
  MessageSquare,
  Phone,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  Utensils,
  BookOpen,
  Award,
  Plus,
  Compass,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Pill,
  Target,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { SunMorningIllustration, EmptyStateIllustration } from '../common/CodeIllustrations';
import { storageService, getLocalGreeting } from '../../services/storage';

interface HomeDashboardProps {
  profile: UserProfile;
  remainingSpoons: number;
  recentSymptoms: SymptomLog[];
  medications: Medication[];
  medEvents: MedicationEvent[];
  tasks?: any[];
  pacingTasks?: any[];
  appointments?: Appointment[];
  featuredMeal?: MealRecipe;
  featuredLesson?: Lesson;
  onOpenAI: (initialPrompt?: string) => void;
  onOpenVoiceCall: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleTask: (taskId: string) => void;
  onRecordMedication: (medId: string, status: 'taken' | 'snoozed') => void;
  onQuickReflection: (title: string, prompt: string) => void;
  onOpenJournal: () => void;
  onOpenSymptoms?: () => void;
  onOpenMyths?: () => void;
  onOpenSpace?: () => void;
  onOpenMeals?: () => void;
  onOpenLessons?: () => void;
  onOpenDocuments?: () => void;
  onOpenAppointments?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  remainingSpoons,
  recentSymptoms,
  medications,
  medEvents,
  tasks,
  pacingTasks,
  appointments = [],
  featuredMeal,
  featuredLesson,
  onOpenAI,
  onOpenVoiceCall,
  onNavigateTab,
  onToggleTask,
  onRecordMedication,
  onQuickReflection,
  onOpenJournal,
  onOpenSymptoms = () => onNavigateTab('symptoms'),
  onOpenMyths = () => onNavigateTab('myths'),
  onOpenSpace = () => onNavigateTab('space'),
  onOpenMeals = () => onNavigateTab('meals'),
  onOpenLessons,
  onOpenDocuments = () => onNavigateTab('profile'),
  onOpenAppointments = () => onNavigateTab('appointments'),
}) => {
  const effectiveTasks = tasks || pacingTasks || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const displayName = profile.name?.trim() ? profile.name.split(' ')[0] : 'Friend';
  const dailyCapacity = profile.dailySpoonsCapacity || 12;

  // Real local timezone greeting
  const localGreeting = useMemo(() => {
    return getLocalGreeting(profile.location, profile.timeZone, displayName);
  }, [profile.location, profile.timeZone, displayName]);

  // Saved documents
  const documents = useMemo(() => {
    return storageService.getDocuments();
  }, []);
  const recentReport = documents[0] || null;

  // Saved daily meal plan
  const dailyMealPlan = useMemo(() => {
    return storageService.getDailyMealPlan();
  }, []);

  // Saved activities
  const activities = useMemo(() => {
    return storageService.getActivities();
  }, []);
  const activeActivities = activities.filter((a) => !a.archived);
  const completedActivitiesToday = activeActivities.filter((a) => a.completed);

  // Active medications
  const activeMeds = medications.filter((m) => m.status !== 'discontinued');

  // Next upcoming doctor appointment
  const upcomingAppointment = useMemo(() => {
    return appointments
      .filter((a) => !a.isCancelled && !a.completed && a.date >= todayStr)
      .sort((a, b) => (a.date > b.date ? 1 : -1))[0] || null;
  }, [appointments, todayStr]);

  // Today's pending or upcoming medications from real saved records
  const todayMeds = activeMeds.slice(0, 3).map((med) => {
    const event = medEvents.find(
      (e) => e.medicationId === med.id && e.date === todayStr
    );
    return {
      med,
      status: event?.status || 'pending',
    };
  });

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Dynamic Greeting & Spoons Capacity Hero Bar */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#FF7A24] uppercase tracking-wider flex items-center gap-1.5">
              <span>{localGreeting.greeting}</span>
              {profile.location && (
                <span className="text-[#B7E4C7] font-normal lowercase">
                  · {profile.location} ({localGreeting.timeString})
                </span>
              )}
            </span>
            <span className="text-xs text-[#B7E4C7]/90 font-medium">
              {profile.streakDays > 0 ? `${profile.streakDays} Day Continuous Streak` : 'Today is Day 1'}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-display tabular-nums tracking-tight text-white flex items-center gap-2">
                <span>{remainingSpoons}</span>
                <span className="text-sm font-normal text-[#B7E4C7]">/ {dailyCapacity} spoons remaining</span>
              </div>
              <p className="text-xs text-white/80 mt-1">
                {remainingSpoons > 4
                  ? "Gentle, steady capacity for today's paced activities."
                  : "Lower capacity today. Prioritize rest without any guilt."}
              </p>
            </div>

            <button
              onClick={onOpenSpace}
              className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <span>Activity Space</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spoon progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 mt-3.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8F3D] to-[#FF7A24] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, (remainingSpoons / dailyCapacity) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#FF7A24]/15 blur-2xl pointer-events-none" />
      </div>

      {/* ================= CLINICAL & DATA SUMMARIES (CLICKABLE) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#132A1F] uppercase tracking-wider">
            Health Status & Records
          </h2>
          <span className="text-[11px] text-[#132A1F]/50">Click any card to manage</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Upcoming Appointments */}
          <div
            onClick={onOpenAppointments}
            className="bg-white rounded-2xl p-3.5 border border-[#132A1F]/10 hover:border-[#FF7A24]/40 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#FF7A24] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Next Visit</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#132A1F]/30 group-hover:text-[#FF7A24] transition-colors" />
              </div>

              {upcomingAppointment ? (
                <div>
                  <h4 className="text-xs font-bold text-[#132A1F] truncate">
                    {upcomingAppointment.doctorName || upcomingAppointment.provider}
                  </h4>
                  <p className="text-[10px] text-[#132A1F]/60 mt-0.5 truncate">
                    {upcomingAppointment.date} · {upcomingAppointment.time}
                  </p>
                  <p className="text-[10px] text-[#132A1F]/50 truncate mt-0.5">
                    {upcomingAppointment.specialty}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-[#132A1F]">No visits booked</h4>
                  <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Tap to schedule visit</p>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#FF7A24] mt-2 group-hover:underline">
              {upcomingAppointment ? 'View Brief →' : 'Schedule →'}
            </span>
          </div>

          {/* Card 2: Recent Medical Reports */}
          <div
            onClick={onOpenDocuments}
            className="bg-white rounded-2xl p-3.5 border border-[#132A1F]/10 hover:border-[#FF7A24]/40 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Lab Reports</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#132A1F]/30 group-hover:text-blue-600 transition-colors" />
              </div>

              {recentReport ? (
                <div>
                  <h4 className="text-xs font-bold text-[#132A1F] truncate">
                    {recentReport.title}
                  </h4>
                  <p className="text-[10px] text-[#132A1F]/60 mt-0.5 truncate">
                    {recentReport.date} · {recentReport.documentType}
                  </p>
                  <p className="text-[10px] text-[#2D6A4F] truncate mt-0.5 font-medium">
                    {recentReport.keyFindings?.length || 0} Key findings identified
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-[#132A1F]">No reports filed</h4>
                  <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Upload test or scan</p>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-2 group-hover:underline">
              {recentReport ? 'Review Records →' : 'Upload →'}
            </span>
          </div>

          {/* Card 3: Active Medications */}
          <div
            onClick={onOpenSymptoms}
            className="bg-white rounded-2xl p-3.5 border border-[#132A1F]/10 hover:border-[#FF7A24]/40 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  <span>Active Medicines</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#132A1F]/30 group-hover:text-purple-600 transition-colors" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#132A1F]">
                  {activeMeds.length} Active Prescriptions
                </h4>
                {activeMeds.length > 0 ? (
                  <p className="text-[10px] text-[#132A1F]/60 mt-0.5 truncate">
                    Next: {activeMeds[0].name} ({activeMeds[0].dosage})
                  </p>
                ) : (
                  <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Add current medications</p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-600 mt-2 group-hover:underline">
              Manage Medicines →
            </span>
          </div>

          {/* Card 4: Activity Completion Progress */}
          <div
            onClick={onOpenSpace}
            className="bg-white rounded-2xl p-3.5 border border-[#132A1F]/10 hover:border-[#FF7A24]/40 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>Activity Progress</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#132A1F]/30 group-hover:text-[#2D6A4F] transition-colors" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#132A1F]">
                  {completedActivitiesToday.length} of {activeActivities.length} Done
                </h4>
                <div className="w-full bg-[#F1EFE9] rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${
                        activeActivities.length > 0
                          ? Math.round((completedActivitiesToday.length / activeActivities.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#2D6A4F] mt-2 group-hover:underline">
              Pacing Space →
            </span>
          </div>
        </div>

        {/* Card 5: Today's Personalized Meal Plan (Full Width Clickable Card) */}
        <div
          onClick={onOpenMeals}
          className="bg-gradient-to-r from-[#FFFDF9] to-[#FFF4EB] rounded-2xl p-4 border border-[#FFE0C8] hover:border-[#FF7A24] cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24] shrink-0">
              <Utensils className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">
                  Personalized Meal Plan
                </span>
                {dailyMealPlan && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    Today
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-[#132A1F] mt-0.5">
                {dailyMealPlan
                  ? `Breakfast: ${dailyMealPlan.breakfast.name} · Lunch: ${dailyMealPlan.lunch.name}`
                  : 'Generate Today\'s Spoon-Aware Nutrition Plan'}
              </h4>

              <p className="text-[11px] text-[#132A1F]/60 mt-0.5">
                {dailyMealPlan
                  ? `Dinner: ${dailyMealPlan.dinner.name} (Respecting allergies & energy)`
                  : 'AI suggestions tailored to your dietary restrictions and current spoon capacity'}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-2">
            <span className="text-xs bg-[#FF7A24] text-white px-3 py-1.5 rounded-full font-bold shadow-xs group-hover:bg-[#E06516] transition-colors flex items-center gap-1">
              <span>{dailyMealPlan ? 'View Plan' : 'Generate'}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Prominent AI Companion Section with Orange Action Buttons */}
      <div className="bg-[#FFFDF9] rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#132A1F] flex items-center justify-center text-[#FF7A24]">
              <Sparkles className="w-4 h-4 text-[#FF7A24]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132A1F] font-display">AI Healthcare Assistant & Test Companion</h3>
              <p className="text-[11px] text-[#132A1F]/60">Connected to authorized records & report Q&A</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] border border-[#FF7A24]/30 px-2 py-0.5 rounded-full font-bold">
            Authorized
          </span>
        </div>

        <p className="text-xs text-[#132A1F]/80 italic bg-[#F8F6F0] rounded-xl p-3 mb-3 border border-[#132A1F]/5">
          "Upload medical reports or ask questions about your symptoms, medications, and pacing thresholds."
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpenAI()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF7A24] hover:bg-[#d86214] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Assistant</span>
          </button>

          <button
            onClick={onOpenVoiceCall}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-[#B7E4C7]" />
            <span>Voice Session</span>
          </button>
        </div>
      </div>

      {/* Quick Journal / Check-in Prompts */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold font-display text-[#132A1F]">My Journal</h2>
          <button
            onClick={onOpenJournal}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95"
          >
            All Prompts
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => onQuickReflection('Pause & Reflect', 'What felt manageable or peaceful today?')}
            className="bg-[#FFEFE5] rounded-2xl p-3.5 cursor-pointer hover:shadow-xs transition-all border border-[#FF7A24]/20 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#9A3412] flex items-center gap-1 mb-1 font-display">
                <span>Pause & reflect</span>
                <span>🌱</span>
              </div>
              <p className="text-[11px] text-[#9A3412]/80 line-clamp-2">
                What felt manageable or peaceful today?
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[#9A3412]/70">
              <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold">Today</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold">Gratitude</span>
            </div>
          </div>

          <div
            onClick={() => onQuickReflection('Pacing Intentions', 'How do you want to pace your energy today?')}
            className="bg-[#E8EFE9] rounded-2xl p-3.5 cursor-pointer hover:shadow-xs transition-all border border-[#52B788]/20 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#1B4332] flex items-center gap-1 mb-1 font-display">
                <span>Set Intentions</span>
                <span>🌼</span>
              </div>
              <p className="text-[11px] text-[#1B4332]/80 line-clamp-2">
                How do you want to pace your energy today?
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[#1B4332]/70">
              <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold">Today</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold">Energy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Today's Personal Tasks
            </h3>
            <p className="text-[11px] text-[#132A1F]/60">User-created tasks for today</p>
          </div>
          <button
            onClick={onOpenJournal}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95"
          >
            + Add Task
          </button>
        </div>

        {effectiveTasks.length > 0 ? (
          <div className="space-y-2">
            {effectiveTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                  task.completed
                    ? 'bg-[#E8EFE9]/40 border-[#74C69D]/30 opacity-75'
                    : 'bg-[#F8F6F0] border-[#132A1F]/5 hover:bg-[#f2efe7]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      task.completed
                        ? 'bg-[#2D6A4F] text-white'
                        : 'border-2 border-[#132A1F]/30'
                    }`}
                  >
                    {task.completed && '✓'}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-[#132A1F]/60' : 'text-[#132A1F]'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-[10px] text-[#132A1F]/60 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                </div>

                {task.priority && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4EB] text-[#FF7A24]">
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#132A1F]/15">
            <EmptyStateIllustration type="tasks" className="w-12 h-12 mx-auto mb-1 opacity-70" />
            <p className="text-xs text-[#132A1F]/70 font-medium">No personal tasks scheduled for today.</p>
            <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Add tasks you choose to complete, or enjoy guilt-free rest.</p>
          </div>
        )}
      </div>

      {/* Recent Symptoms Section */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Recent Reported Symptoms
            </h3>
            <p className="text-[11px] text-[#132A1F]/60">Your logged health timeline</p>
          </div>
          <button
            onClick={onOpenSymptoms}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95"
          >
            Log Symptom
          </button>
        </div>

        {recentSymptoms.length > 0 ? (
          <div className="space-y-2">
            {recentSymptoms.slice(0, 3).map((sym) => (
              <div
                key={sym.id}
                className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#132A1F]/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#132A1F]">{sym.name}</div>
                  <div className="text-[10px] text-[#132A1F]/60">
                    {sym.date} {sym.time && `at ${sym.time}`} · Severity {sym.intensity}/10
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4EB] text-[#FF7A24]">
                  Severity {sym.intensity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#132A1F]/15">
            <EmptyStateIllustration type="symptoms" className="w-12 h-12 mx-auto mb-1 opacity-70" />
            <p className="text-xs text-[#132A1F]/70 font-medium">No symptoms recorded yet.</p>
            <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Your symptom timeline will appear here as you log entries.</p>
          </div>
        )}
      </div>

      {/* Quick Launch Cards into Myths, Space, and Community */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onOpenMyths}
          className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 text-left hover:border-[#FF7A24]/40 transition-all flex flex-col justify-between group shadow-xs active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFF4EB] text-[#FF7A24] flex items-center justify-center mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#132A1F] font-display">Myths</div>
            <p className="text-[10px] text-[#132A1F]/60 mt-0.5">Evidence & tests</p>
          </div>
          <span className="text-[10px] font-bold text-[#FF7A24] mt-2 group-hover:underline">Explore →</span>
        </button>

        <button
          onClick={onOpenSpace}
          className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 text-left hover:border-[#FF7A24]/40 transition-all flex flex-col justify-between group shadow-xs active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#E8EFE9] text-[#2D6A4F] flex items-center justify-center mb-2">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#132A1F] font-display">Space</div>
            <p className="text-[10px] text-[#132A1F]/60 mt-0.5">Daily activity</p>
          </div>
          <span className="text-[10px] font-bold text-[#2D6A4F] mt-2 group-hover:underline">Track →</span>
        </button>

        <button
          onClick={() => onNavigateTab('community')}
          className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 text-left hover:border-[#FF7A24]/40 transition-all flex flex-col justify-between group shadow-xs active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFEFE5] text-[#9A3412] flex items-center justify-center mb-2">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#132A1F] font-display">Community</div>
            <p className="text-[10px] text-[#132A1F]/60 mt-0.5">Peer stories</p>
          </div>
          <span className="text-[10px] font-bold text-[#9A3412] mt-2 group-hover:underline">Connect →</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
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
} from 'lucide-react';
import { SunMorningIllustration, EmptyStateIllustration } from '../common/CodeIllustrations';

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
  onOpenCareFinder?: () => void;
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
  onOpenMeals,
  onOpenLessons,
  onOpenDocuments,
  onOpenCareFinder,
}) => {
  const effectiveTasks = tasks || pacingTasks || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointment = appointments.find((a) => !a.completed);

  // Today's pending or upcoming medications from real saved records
  const todayMeds = medications.slice(0, 3).map((med) => {
    const event = medEvents.find(
      (e) => e.medicationId === med.id && e.date === todayStr
    );
    return {
      med,
      status: event?.status || 'pending',
    };
  });

  const displayName = profile.name?.trim() ? profile.name.split(' ')[0] : 'Friend';
  const dailyCapacity = profile.dailySpoonsCapacity || 12;

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Supportive Greeting & Spoons Capacity Hero Bar */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#B7E4C7] uppercase tracking-wider">
              Today's Energy Balance
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
              onClick={() => onNavigateTab('space')}
              className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <span>Activity Tracker</span>
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

        {/* Subtle decorative background shapes */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#2D6A4F]/30 blur-2xl pointer-events-none" />
      </div>

      {/* Hero "My Journal / Daily Flow" Cards with upright, readable layouts */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold font-display text-[#132A1F]">My Journal</h2>
            <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] border border-[#FF7A24]/20 px-2 py-0.5 rounded-full font-bold">
              Diary & Tasks
            </span>
          </div>
          <button
            onClick={onOpenJournal}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all flex items-center gap-1 active:scale-95"
          >
            <span>Open Diary</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid with Code-Based Sun Illustration & Clean Upright Evening Card */}
        <div className="grid grid-cols-12 gap-3 items-stretch">
          {/* Main Card with Sun Illustration (Code-Based SVG) */}
          <div
            onClick={onOpenJournal}
            className="col-span-8 bg-[#FFF8E7] rounded-3xl p-4 cursor-pointer relative overflow-hidden border border-[#FF7A24]/20 hover:shadow-md transition-all group"
          >
            <div className="relative z-10 max-w-[200px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF7A24]">
                Morning
              </span>
              <h3 className="text-base font-bold text-[#132A1F] font-display leading-tight mt-0.5 mb-1">
                Let's start your day
              </h3>
              <p className="text-xs text-[#132A1F]/80 leading-relaxed">
                Reflect on your energy and write your morning thoughts.
              </p>
            </div>

            {/* Code-Based Sun Morning Illustration */}
            <div className="mt-2 rounded-2xl overflow-hidden h-28 relative shadow-xs border border-[#FF7A24]/10">
              <SunMorningIllustration className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>

          {/* Upright, readable Evening Card (Fixed Layout: upright text, proper order) */}
          <div
            onClick={onOpenJournal}
            className="col-span-4 bg-[#F2EDE4] rounded-3xl p-4 flex flex-col justify-between cursor-pointer hover:bg-[#eae4da] transition-all border border-[#132A1F]/10 group"
          >
            <div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base mb-2 shadow-xs group-hover:scale-110 transition-transform">
                🌙
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#132A1F]/60 block">
                Evening
              </span>
              <h4 className="text-sm font-bold text-[#132A1F] font-display leading-tight mt-0.5">
                Wind Down & Rest
              </h4>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-[#132A1F]/70 leading-snug">
                Log evening thoughts before sleep.
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#FF7A24] font-bold">
                <span>Reflect</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Journal / Check-in Prompts */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold font-display text-[#132A1F]">Quick Reflections</h2>
          <button
            onClick={onOpenJournal}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95"
          >
            All Prompts
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Pause & reflect */}
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

          {/* Card 2: Set Intentions */}
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

      {/* Prominent AI Companion Section with Orange Action Buttons */}
      <div className="bg-[#FFFDF9] rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#132A1F] flex items-center justify-center text-[#FF7A24]">
              <Sparkles className="w-4 h-4 text-[#FF7A24]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132A1F] font-display">Healno Health Companion</h3>
              <p className="text-[11px] text-[#132A1F]/60">Private, nonjudgmental health ally</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] border border-[#FF7A24]/30 px-2 py-0.5 rounded-full font-bold">
            Ready
          </span>
        </div>

        <p className="text-xs text-[#132A1F]/80 italic bg-[#F8F6F0] rounded-xl p-3 mb-3 border border-[#132A1F]/5">
          "Rest is never wasted time. What would feel kindest to your body right now?"
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpenAI()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF7A24] hover:bg-[#d86214] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Text Companion</span>
          </button>

          <button
            onClick={onOpenVoiceCall}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-[#B7E4C7]" />
            <span>Voice Call</span>
          </button>
        </div>
      </div>

      {/* Today's Tasks Section (Real User Tasks Only) */}
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

      {/* Recent Symptoms Section (Real Data Only) */}
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

      {/* Medications Routine (Real Data Only) */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Medications & Supplements
            </h3>
            <p className="text-[11px] text-[#132A1F]/60">Today's routine</p>
          </div>
          <button
            onClick={() => onNavigateTab('space')}
            className="text-xs bg-[#FF7A24] hover:bg-[#d86214] text-white font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95"
          >
            Manage
          </button>
        </div>

        {todayMeds.length > 0 ? (
          <div className="space-y-2">
            {todayMeds.map(({ med, status }) => (
              <div
                key={med.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  status === 'taken'
                    ? 'bg-[#E8EFE9]/40 border-[#74C69D]/30 text-[#132A1F]/70'
                    : 'bg-[#F8F6F0] border-[#132A1F]/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() =>
                      onRecordMedication(med.id, status === 'taken' ? 'snoozed' : 'taken')
                    }
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      status === 'taken'
                        ? 'bg-[#2D6A4F] text-white'
                        : 'border-2 border-[#132A1F]/30 hover:border-[#FF7A24]'
                    }`}
                    aria-label={`Mark ${med.name} taken`}
                  >
                    {status === 'taken' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className={`text-xs font-semibold ${status === 'taken' ? 'line-through' : 'text-[#132A1F]'}`}>
                      {med.name} ({med.dosage})
                    </div>
                    <div className="text-[10px] text-[#132A1F]/60">
                      {med.timeSlot} · {med.instructions.slice(0, 38)}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  status === 'taken' ? 'bg-[#D8F3DC] text-[#1B4332]' : 'bg-[#FFE5D9] text-[#6B4435]'
                }`}>
                  {status === 'taken' ? 'Taken' : 'Due'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#132A1F]/15">
            <EmptyStateIllustration type="meds" className="w-12 h-12 mx-auto mb-1 opacity-70" />
            <p className="text-xs text-[#132A1F]/70 font-medium">No medications currently recorded.</p>
            <p className="text-[10px] text-[#132A1F]/50 mt-0.5">Add supplements or medicines in your profile when needed.</p>
          </div>
        )}
      </div>

      {/* Upcoming Appointments (Real Data Only — No Fake Evelyn Vance!) */}
      {upcomingAppointment ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#FF7A24] uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Visit</span>
            </span>
            <span className="text-xs text-[#132A1F]/70">{upcomingAppointment.date}</span>
          </div>

          <h4 className="text-sm font-bold text-[#132A1F]">
            {upcomingAppointment.provider} ({upcomingAppointment.specialty})
          </h4>
          <p className="text-xs text-[#132A1F]/70 mt-0.5">{upcomingAppointment.purpose}</p>
        </div>
      ) : null}

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
            <p className="text-[10px] text-[#132A1F]/60 mt-0.5">Shared experiences</p>
          </div>
          <span className="text-[10px] font-bold text-[#9A3412] mt-2 group-hover:underline">Connect →</span>
        </button>
      </div>
    </div>
  );
};

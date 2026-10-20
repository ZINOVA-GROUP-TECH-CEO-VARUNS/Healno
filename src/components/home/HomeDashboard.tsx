import React from 'react';
import {
  UserProfile,
  SymptomLog,
  Medication,
  MedicationEvent,
  PacingTask,
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
  Battery,
  AlertCircle,
} from 'lucide-react';

interface HomeDashboardProps {
  profile: UserProfile;
  remainingSpoons: number;
  recentSymptoms: SymptomLog[];
  medications: Medication[];
  medEvents: MedicationEvent[];
  pacingTasks: PacingTask[];
  appointments: Appointment[];
  featuredMeal: MealRecipe;
  featuredLesson: Lesson;
  onOpenAI: (initialPrompt?: string) => void;
  onOpenVoiceCall: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleTask: (taskId: string) => void;
  onRecordMedication: (medId: string, status: 'taken' | 'snoozed') => void;
  onQuickReflection: (title: string, prompt: string) => void;
  onOpenMeals: () => void;
  onOpenLessons: () => void;
  onOpenDocuments: () => void;
  onOpenCareFinder: () => void;
  onOpenJournal: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  remainingSpoons,
  recentSymptoms,
  medications,
  medEvents,
  pacingTasks,
  appointments,
  featuredMeal,
  featuredLesson,
  onOpenAI,
  onOpenVoiceCall,
  onNavigateTab,
  onToggleTask,
  onRecordMedication,
  onQuickReflection,
  onOpenMeals,
  onOpenLessons,
  onOpenDocuments,
  onOpenCareFinder,
  onOpenJournal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointment = appointments.find((a) => !a.completed);

  // Today's pending or upcoming medications
  const todayMeds = medications.slice(0, 3).map((med) => {
    const event = medEvents.find(
      (e) => e.medicationId === med.id && e.date === todayStr
    );
    return {
      med,
      status: event?.status || 'pending',
    };
  });

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Supportive Greeting & Spoons Capacity Hero Bar */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-4.5 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#B7E4C7] uppercase tracking-wider">
              Today's Energy Balance
            </span>
            <span className="text-xs text-[#B7E4C7]/80">
              {profile.streakDays} Days Harmonious Streak
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-display tabular-nums tracking-tight text-white flex items-center gap-2">
                <span>{remainingSpoons}</span>
                <span className="text-sm font-normal text-[#B7E4C7]">/ {profile.dailySpoonsCapacity} spoons</span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                {remainingSpoons > 4
                  ? "Gentle, steady capacity for today's paced activities."
                  : "Lower capacity today. Prioritize rest without any guilt."}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('pace')}
              className="text-xs bg-[#B7E4C7]/20 hover:bg-[#B7E4C7]/30 text-[#B7E4C7] font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <span>Manage Pace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spoon progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E89D35] to-[#74C69D] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, (remainingSpoons / profile.dailySpoonsCapacity) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Subtle decorative background shapes */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#2D6A4F]/30 blur-2xl pointer-events-none" />
      </div>

      {/* Hero "My Journal / Let's start your day" Card matching Reference Image */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold font-display text-[#132A1F]">My Journal</h2>
            <span className="text-[10px] bg-[#E8EFE9] text-[#2D6A4F] px-2 py-0.5 rounded-full font-semibold">
              Diary
            </span>
          </div>
          <button
            onClick={onOpenJournal}
            className="text-xs text-[#2D6A4F] hover:text-[#132A1F] font-bold flex items-center gap-0.5"
          >
            <span>Open Diary</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3 items-stretch">
          {/* Main Card with Sun Illustration */}
          <div
            onClick={onOpenJournal}
            className="col-span-9 bg-[#F7C04A]/25 rounded-3xl p-4 cursor-pointer relative overflow-hidden border border-[#E89D35]/20 hover:shadow-md transition-all group"
          >
            <div className="relative z-10 max-w-[200px]">
              <h3 className="text-base font-bold text-[#132A1F] font-display leading-tight mb-1">
                Let's start your day
              </h3>
              <p className="text-xs text-[#132A1F]/80 leading-relaxed">
                Begin with mindful morning reflections in your diary.
              </p>
            </div>

            {/* Generated Sun Illustration Asset */}
            <div className="mt-2 rounded-2xl overflow-hidden h-28 relative shadow-xs">
              <img
                src="/src/assets/images/healno_sun_morning_1792488330089.jpg"
                alt="Smiling morning sun over rolling green hills"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Evening Peek Card matching reference image */}
          <div
            onClick={onOpenJournal}
            className="col-span-3 bg-[#E5DFD3] rounded-3xl p-3 flex flex-col justify-between items-center text-center cursor-pointer hover:bg-[#DDD6C8] transition-colors border border-[#132A1F]/10"
          >
            <div className="writing-vertical-lr rotate-180 text-xs font-bold text-[#132A1F]/70 tracking-wider uppercase my-auto font-display">
              Evening
            </div>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-[#132A1F] text-xs">
              🌙
            </div>
          </div>
        </div>
      </div>

      {/* Quick Journal / Check-in Cards Carousel matching reference image */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold font-display text-[#132A1F]">Quick Check-in</h2>
          <button
            onClick={() => onNavigateTab('symptoms')}
            className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-medium"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Peach card "Pause & reflect" */}
          <div
            onClick={() => onQuickReflection('Pause & Reflect', 'What are you grateful for today?')}
            className="bg-[#FFE5D9] rounded-2xl p-3.5 cursor-pointer hover:shadow-sm transition-all border border-[#F4A261]/20 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#6B4435] flex items-center gap-1 mb-1 font-display">
                <span>Pause & reflect</span>
                <span>🌱</span>
              </div>
              <p className="text-[11px] text-[#6B4435]/80 line-clamp-2">
                What are you grateful for today?
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[#6B4435]/70">
              <span className="bg-white/60 px-2 py-0.5 rounded-md font-medium">Today</span>
              <span className="bg-white/60 px-2 py-0.5 rounded-md font-medium">Personal</span>
            </div>
          </div>

          {/* Card 2: Soft lavender / mint card "Set Intentions" */}
          <div
            onClick={() => onQuickReflection('Set Intentions', 'How do you want to feel and pace today?')}
            className="bg-[#E2E8F0]/70 rounded-2xl p-3.5 cursor-pointer hover:shadow-sm transition-all border border-[#132A1F]/10 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#132A1F] flex items-center gap-1 mb-1 font-display">
                <span>Set Intentions</span>
                <span>🌼</span>
              </div>
              <p className="text-[11px] text-[#132A1F]/80 line-clamp-2">
                How do you want to feel today?
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[#132A1F]/70">
              <span className="bg-white/60 px-2 py-0.5 rounded-md font-medium">Today</span>
              <span className="bg-white/60 px-2 py-0.5 rounded-md font-medium">Harmony</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent AI Companion Section with Text and Call */}
      <div className="bg-[#FFFDF9] rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#132A1F] flex items-center justify-center text-[#B7E4C7]">
              <Sparkles className="w-4 h-4 text-[#B7E4C7]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132A1F] font-display">Healno AI Companion</h3>
              <p className="text-[11px] text-[#132A1F]/60">Your private, nonjudgmental health ally</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
            Ready
          </span>
        </div>

        {/* Empathy Quote */}
        <p className="text-xs text-[#132A1F]/80 italic bg-[#F8F6F0] rounded-xl p-3 mb-3 border border-[#132A1F]/5">
          "Rest is part of your progress. What would feel manageable for you today?"
        </p>

        {/* Action Buttons: Text & Call */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpenAI()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#B7E4C7]" />
            <span>Text Companion</span>
          </button>

          <button
            onClick={onOpenVoiceCall}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Voice Call</span>
          </button>
        </div>
      </div>

      {/* Upcoming Medication Checklist */}
      <div className="bg-white rounded-3xl p-4 border border-[#132A1F]/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5">
            <span>Medications & Routine</span>
          </h3>
          <button
            onClick={() => onNavigateTab('meds')}
            className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-medium"
          >
            Manage Meds
          </button>
        </div>

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
                      : 'border-2 border-[#132A1F]/30 hover:border-[#132A1F]'
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
                    {med.timeSlot} · {med.instructions.slice(0, 38)}...
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
      </div>

      {/* "Your plan" Bento Grid Section matching the 2nd Reference Image */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-bold font-display text-[#132A1F]">Your plan</h2>
          <button
            onClick={() => onNavigateTab('pace')}
            className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-medium"
          >
            Full Pacing
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* Left Bento: Warm Amber Yoga/Stretch Card */}
          <div
            onClick={() => onQuickReflection('Gentle Movement', 'Ready for a 15-minute gentle floor stretch?')}
            className="col-span-7 bg-[#F4A236]/30 hover:bg-[#F4A236]/35 rounded-3xl p-4 border border-[#E89D35]/25 cursor-pointer transition-all flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <span className="text-[10px] bg-white/70 text-[#6B4435] px-2.5 py-0.5 rounded-full font-bold">
                Medium · 2 Spoons
              </span>
              <h3 className="text-base font-bold text-[#132A1F] font-display mt-2 leading-tight">
                Floor Yoga & Stretch
              </h3>
              <div className="text-[11px] text-[#132A1F]/70 mt-1">
                <div>Today · 14:00–14:30</div>
                <div>Quiet Mat Space</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"
                  alt="Tiffany"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[10px] leading-tight">
                <div className="text-[#132A1F]/50">Guide</div>
                <div className="font-bold text-[#132A1F]">Tiffany Way</div>
              </div>
            </div>
          </div>

          {/* Right Bento Column */}
          <div className="col-span-5 flex flex-col gap-3">
            {/* Top Right: Light Blue Balance & Vagus Reset Card */}
            <div
              onClick={() => onQuickReflection('Vagus Reset', 'Take a 5-minute cold water palm reset.')}
              className="bg-[#D9EAFD] hover:bg-[#cbdef5] rounded-3xl p-3.5 border border-[#B6D4F7]/40 cursor-pointer transition-all flex flex-col justify-between flex-1"
            >
              <div>
                <span className="text-[10px] bg-white/70 text-[#132A1F] px-2 py-0.5 rounded-full font-bold">
                  Light · 1 Spoon
                </span>
                <h4 className="text-xs font-bold text-[#132A1F] font-display mt-1.5 leading-tight">
                  Vagus Balance
                </h4>
                <div className="text-[10px] text-[#132A1F]/60 mt-0.5">
                  18:00 · Recline
                </div>
              </div>

              <div className="text-right text-lg">
                🧘
              </div>
            </div>

            {/* Bottom Right: Soft Pink Audio/Social Pause Card */}
            <div
              onClick={() => onOpenAI('Play a calming restorative soundscape for 10 minutes')}
              className="bg-[#FFD6E8] hover:bg-[#f7c2d9] rounded-2xl p-2.5 border border-[#F8B4D9]/40 flex items-center justify-around cursor-pointer transition-colors"
            >
              <span className="text-xs" title="Soundscapes">🎧</span>
              <span className="text-xs" title="Breath Timer">🫧</span>
              <span className="text-xs" title="Gentle Guidance">🌿</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Pacing Tasks */}
      <div className="bg-white rounded-3xl p-4 border border-[#132A1F]/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#132A1F] font-display">
            Today's Paced Tasks
          </h3>
          <button
            onClick={() => onNavigateTab('pace')}
            className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-medium"
          >
            Adjust Plan
          </button>
        </div>

        <div className="space-y-2">
          {pacingTasks.slice(0, 4).map((task) => (
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
                  {task.isRestorative && (
                    <span className="ml-1.5 text-[9px] bg-[#B7E4C7] text-[#132A1F] px-1.5 py-0.2 rounded-full font-bold">
                      Restorative (+1 Spoon)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-semibold text-[#132A1F]/70 tabular-nums">
                {task.spoonCost > 0 ? `${task.spoonCost} 🥄` : `+${Math.abs(task.spoonCost)} 🥄`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointment & Doctor Prep Banner */}
      {upcomingAppointment && (
        <div className="bg-[#FFFDF9] rounded-3xl p-4 border border-[#132A1F]/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#E89D35] uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Visit</span>
            </span>
            <span className="text-xs text-[#132A1F]/70">{upcomingAppointment.date}</span>
          </div>

          <h4 className="text-sm font-bold text-[#132A1F]">
            {upcomingAppointment.provider} ({upcomingAppointment.specialty})
          </h4>
          <p className="text-xs text-[#132A1F]/70 mt-0.5">{upcomingAppointment.purpose}</p>

          <div className="mt-3 pt-3 border-t border-[#132A1F]/5 flex items-center justify-between">
            <span className="text-[11px] text-[#132A1F]/60">
              {upcomingAppointment.doctorQuestions.length} clinician talking points ready
            </span>
            <button
              onClick={() => onOpenCareFinder()}
              className="text-xs bg-[#132A1F] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#2D6A4F] transition-colors"
            >
              Review Prep Brief
            </button>
          </div>
        </div>
      )}

      {/* Personalized Meal Suggestion Card */}
      {featuredMeal && (
        <div
          onClick={onOpenMeals}
          className="bg-white rounded-3xl p-4 border border-[#132A1F]/10 shadow-xs cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" />
              <span>Spoon-Friendly Nourishment</span>
            </span>
            <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
              {featuredMeal.prepTimeMinutes} mins · {featuredMeal.spoonCost} Spoon
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#132A1F] group-hover:text-[#2D6A4F] transition-colors">
            {featuredMeal.name}
          </h4>
          <p className="text-xs text-[#132A1F]/70 mt-1 line-clamp-2">
            {featuredMeal.nutritionNotes}
          </p>
        </div>
      )}

      {/* Learning Progress & Medical Hub Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={onOpenLessons}
          className="bg-[#E8EFE9] rounded-2xl p-3.5 cursor-pointer hover:bg-[#d8e3da] transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-7 h-7 rounded-full bg-[#132A1F] text-[#B7E4C7] flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#132A1F] font-display">Learning Hub</div>
            <p className="text-[10px] text-[#132A1F]/70 mt-0.5">Spoon theory, fatigue science & quizzes</p>
          </div>
          <span className="text-[10px] font-bold text-[#2D6A4F] mt-2">+30 XP available</span>
        </div>

        <div
          onClick={onOpenDocuments}
          className="bg-[#FFE5D9]/60 rounded-2xl p-3.5 cursor-pointer hover:bg-[#FFE5D9] transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-7 h-7 rounded-full bg-[#E76F51] text-white flex items-center justify-center mb-2">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#6B4435] font-display">Medical Vault</div>
            <p className="text-[10px] text-[#6B4435]/80 mt-0.5">Labs, OCR summaries & timelines</p>
          </div>
          <span className="text-[10px] font-bold text-[#E76F51] mt-2">Export for Clinician</span>
        </div>
      </div>
    </div>
  );
};

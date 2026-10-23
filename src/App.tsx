import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SymptomLog,
  EmotionScore,
  Medication,
  MedicationEvent,
  PacingTask,
  MedicalDocument,
  Appointment,
  Lesson,
  CommunityPost,
  MealRecipe,
  JournalEntry,
} from './types';
import { storageService, defaultProfile } from './services/storage';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { HomeDashboard } from './components/home/HomeDashboard';
import { SymptomsScreen } from './components/symptoms/SymptomsScreen';
import { MedsScreen } from './components/meds/MedsScreen';
import { PaceScreen } from './components/pace/PaceScreen';
import { CommunityScreen } from './components/community/CommunityScreen';
import { DocumentsScreen } from './components/documents/DocumentsScreen';
import { AppointmentsScreen } from './components/appointments/AppointmentsScreen';
import { LearningScreen } from './components/learning/LearningScreen';
import { MythsScreen } from './components/learning/MythsScreen';
import { SpaceScreen } from './components/space/SpaceScreen';
import { MealsScreen } from './components/meals/MealsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { JournalScreen } from './components/journal/JournalScreen';
import { AICompanionModal } from './components/ai/AICompanionModal';
import { VoiceCallModal } from './components/ai/VoiceCallModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { ExportSummaryModal } from './components/documents/ExportSummaryModal';
import { LandingPage } from './components/website/LandingPage';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { dbService } from './services/db';

export default function App() {
  // Website First Landing Experience State: Returning onboarded users launch directly to app
  const [viewMode, setViewMode] = useState<'website' | 'app'>(() => {
    const p = storageService.getProfile();
    return p.isAuthenticated && p.isOnboarded ? 'app' : 'website';
  });

  // Core state from storageService & dbService
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [symptoms, setSymptoms] = useState<SymptomLog[]>(() => storageService.getSymptoms());
  const [emotions, setEmotions] = useState<EmotionScore[]>(() => storageService.getEmotions());
  const [medications, setMedications] = useState<Medication[]>(() => storageService.getMedications());
  const [medEvents, setMedEvents] = useState<MedicationEvent[]>(() => storageService.getMedEvents());
  const [pacingTasks, setPacingTasks] = useState<PacingTask[]>(() => storageService.getPacingTasks());
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => storageService.getDocuments());
  const [appointments, setAppointments] = useState<Appointment[]>(() => storageService.getAppointments());
  const [lessons, setLessons] = useState<Lesson[]>(() => storageService.getLessons());
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => storageService.getCommunityPosts());
  const [meals, setMeals] = useState<MealRecipe[]>(() => storageService.getMeals());
  const [achievements, setAchievements] = useState(() => storageService.getAchievements());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => storageService.getJournalEntries());

  // Navigation & Modals state
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeSecondaryView, setActiveSecondaryView] = useState<
    'documents' | 'appointments' | 'meals' | 'lessons' | 'profile' | 'journal' | null
  >(null);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'documents' | 'timeline' | 'calendar' | 'achievements' | 'privacy'>('profile');

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync with live database on mount
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [dbProfile, dbSymptoms, dbEmotions, dbMeds, dbTasks, dbJournals] = await Promise.all([
          dbService.getProfile(),
          dbService.getSymptoms(),
          dbService.getEmotions(),
          dbService.getMedications(),
          dbService.getPacingTasks(),
          dbService.getJournalEntries(),
        ]);
        if (dbProfile) setProfile(dbProfile);
        if (dbSymptoms.length > 0) setSymptoms(dbSymptoms);
        if (dbEmotions.length > 0) setEmotions(dbEmotions);
        if (dbMeds.length > 0) setMedications(dbMeds);
        if (dbTasks.length > 0) setPacingTasks(dbTasks);
        if (dbJournals.length > 0) setJournalEntries(dbJournals);
        
        // Recalculate real streak from actual persisted records
        const realStreak = storageService.calculateRealStreak();
        setProfile((prev) => ({ ...prev, streakDays: realStreak }));
      } catch (err) {
        console.warn('Initial data synchronization', err);
      }
    }
    syncBackendData();
  }, []);

  // Dynamic Spoons Calculation
  // Daily Spoons Capacity - spent spoons from completed non-restorative tasks + recovered spoons
  const spentSpoons = pacingTasks
    .filter((t) => t.completed && !t.isRestorative)
    .reduce((sum, t) => sum + t.spoonCost, 0);

  const recoveredSpoons = pacingTasks
    .filter((t) => t.completed && t.isRestorative)
    .reduce((sum, t) => sum + Math.abs(t.spoonCost), 0);

  const remainingSpoons = profile.dailySpoonsCapacity - spentSpoons + recoveredSpoons;

  // Handlers
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    storageService.setProfile(updated);
  };

  const handleUpdateCapacity = (newCapacity: number) => {
    const updated = { ...profile, dailySpoonsCapacity: newCapacity };
    handleUpdateProfile(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const task = pacingTasks.find((t) => t.id === taskId);
    if (task) {
      const updated = { ...task, completed: !task.completed };
      storageService.savePacingTask(updated);
      setPacingTasks(storageService.getPacingTasks());
    }
  };

  const handleAddSymptom = (symptom: SymptomLog) => {
    storageService.addSymptom(symptom);
    setSymptoms(storageService.getSymptoms());
    // Award XP & sync real streak
    const realStreak = storageService.calculateRealStreak();
    const updatedProfile = { ...profile, xp: profile.xp + 10, streakDays: realStreak };
    handleUpdateProfile(updatedProfile);
  };

  const handleDeleteSymptom = (id: string) => {
    storageService.deleteSymptom(id);
    setSymptoms(storageService.getSymptoms());
    const realStreak = storageService.calculateRealStreak();
    handleUpdateProfile({ ...profile, streakDays: realStreak });
  };

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    storageService.saveJournalEntry(entry);
    dbService.saveJournalEntry(entry);
    setJournalEntries(storageService.getJournalEntries());
    const realStreak = storageService.calculateRealStreak();
    const updatedProfile = { ...profile, xp: profile.xp + 25, streakDays: realStreak };
    handleUpdateProfile(updatedProfile);
  };

  const handleDeleteJournalEntry = (id: string) => {
    storageService.deleteJournalEntry(id);
    dbService.deleteJournalEntry(id);
    setJournalEntries(storageService.getJournalEntries());
    const realStreak = storageService.calculateRealStreak();
    handleUpdateProfile({ ...profile, streakDays: realStreak });
  };

  const handleUpdateEmotion = (score: EmotionScore) => {
    storageService.addEmotion(score);
    setEmotions(storageService.getEmotions());
  };

  const handleSaveMedication = (med: Medication) => {
    storageService.saveMedication(med);
    setMedications(storageService.getMedications());
  };

  const handleDeleteMedication = (id: string) => {
    storageService.deleteMedication(id);
    setMedications(storageService.getMedications());
  };

  const handleRecordMedEvent = (event: MedicationEvent) => {
    storageService.recordMedEvent(event);
    setMedEvents(storageService.getMedEvents());
    const realStreak = storageService.calculateRealStreak();
    handleUpdateProfile({ ...profile, streakDays: realStreak });
  };

  const handleAddTask = (task: PacingTask) => {
    storageService.savePacingTask(task);
    setPacingTasks(storageService.getPacingTasks());
  };

  const handleDeleteTask = (id: string) => {
    storageService.deletePacingTask(id);
    setPacingTasks(storageService.getPacingTasks());
  };

  const handleSaveDocument = (doc: MedicalDocument) => {
    storageService.saveDocument(doc);
    setDocuments(storageService.getDocuments());
  };

  const handleDeleteDocument = (id: string) => {
    storageService.deleteDocument(id);
    setDocuments(storageService.getDocuments());
  };

  const handleSaveAppointment = (apt: Appointment) => {
    storageService.saveAppointment(apt);
    setAppointments(storageService.getAppointments());
  };

  const handleCompleteLesson = (lessonId: string) => {
    storageService.markLessonComplete(lessonId);
    setLessons(storageService.getLessons());
    setProfile(storageService.getProfile());
  };

  const handleAddCommunityPost = (post: CommunityPost) => {
    storageService.addCommunityPost(post);
    setCommunityPosts(storageService.getCommunityPosts());
    const updatedProfile = { ...profile, xp: profile.xp + 15 };
    handleUpdateProfile(updatedProfile);
  };

  const handleReactCommunityPost = (postId: string, reaction: 'hug' | 'spoon' | 'strength' | 'heart') => {
    storageService.reactToPost(postId, reaction);
    setCommunityPosts(storageService.getCommunityPosts());
  };

  const handleAddCommunityComment = (postId: string, comment: string) => {
    storageService.addCommentToPost(postId, comment, profile.name.split(' ')[0]);
    setCommunityPosts(storageService.getCommunityPosts());
  };

  const handleDeleteCommunityPost = async (postId: string) => {
    await dbService.deleteCommunityPost(postId);
    setCommunityPosts(storageService.getCommunityPosts());
  };

  const handleRemoveAllCommunityPosts = async () => {
    await dbService.clearAllCommunityPosts();
    setCommunityPosts([]);
  };

  const handleSaveMeal = (meal: MealRecipe) => {
    storageService.saveMeal(meal);
    setMeals(storageService.getMeals());
  };

  const handleQuickReflection = (title: string, promptText: string) => {
    setIsAIModalOpen(true);
  };

  const handleExportAllJSON = () => {
    const jsonStr = storageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healno_health_records_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all Healno data to default harmonious chronic care baseline?')) {
      storageService.resetAllData();
      window.location.reload();
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveSecondaryView(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Website First Landing Experience
  if (viewMode === 'website') {
    return (
      <>
        <LandingPage
          onLaunchApp={(mode) => {
            setViewMode('app');
            const hasCompleted = storageService.isOnboardingCompleted() || profile.isOnboarded;
            if (mode === 'login') {
              setIsAuthModalOpen(true);
            } else if (mode === 'signup') {
              setIsAuthModalOpen(true);
            } else if (mode === 'onboarding') {
              if (!hasCompleted) setIsOnboardingOpen(true);
            } else {
              if (!hasCompleted) setIsOnboardingOpen(true);
            }
          }}
        />
        <OfflineIndicator />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(updatedUser) => {
            const hasCompleted = storageService.isOnboardingCompleted() || profile.isOnboarded || updatedUser.isOnboarded;
            const nextProfile = {
              ...profile,
              ...updatedUser,
              isOnboarded: Boolean(hasCompleted),
              isAuthenticated: true,
            };
            handleUpdateProfile(nextProfile);
            setIsAuthModalOpen(false);
            setViewMode('app');
            if (!hasCompleted) {
              setIsOnboardingOpen(true);
            }
          }}
          onStartOnboarding={() => {
            setIsAuthModalOpen(false);
            if (!storageService.isOnboardingCompleted() && !profile.isOnboarded) {
              setIsOnboardingOpen(true);
            }
          }}
        />
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(newProfile) => {
            storageService.setOnboardingCompleted(true);
            const finishedProfile = { ...profile, ...newProfile, isOnboarded: true, isAuthenticated: true };
            handleUpdateProfile(finishedProfile);
            setIsOnboardingOpen(false);
            setViewMode('app');
          }}
          initialProfile={profile}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#132A1F] flex flex-col font-sans selection:bg-[#B7E4C7] selection:text-[#132A1F]">
      {/* Top Header */}
      <TopHeader
        profile={profile}
        remainingSpoons={remainingSpoons}
        onOpenProfile={() => {
          setProfileInitialTab('profile');
          setActiveSecondaryView('profile');
        }}
        onOpenCalendar={() => {
          setProfileInitialTab('calendar');
          setActiveSecondaryView('profile');
        }}
        onUpdateCapacity={handleUpdateCapacity}
        onOpenAI={() => setIsAIModalOpen(true)}
        onBackToWebsite={() => setViewMode('website')}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {/* Secondary Hub Views */}
        {activeSecondaryView === 'documents' && (
          <DocumentsScreen
            documents={documents}
            onSaveDocument={handleSaveDocument}
            onDeleteDocument={handleDeleteDocument}
            onExportSummary={() => setIsExportModalOpen(true)}
            onBack={() => setActiveSecondaryView(null)}
          />
        )}

        {activeSecondaryView === 'appointments' && (
          <AppointmentsScreen
            appointments={appointments}
            recentSymptoms={symptoms}
            medications={medications}
            onSaveAppointment={handleSaveAppointment}
            onDeleteAppointment={(id) => {
              storageService.deleteAppointment(id);
              setAppointments(storageService.getAppointments());
            }}
            onBack={() => setActiveSecondaryView(null)}
            userName={profile.name || 'Friend'}
          />
        )}

        {activeSecondaryView === 'meals' && (
          <MealsScreen
            meals={meals}
            remainingSpoons={remainingSpoons}
            userDietaryPreferences={profile.dietaryPreferences}
            userProfile={profile}
            onSaveMeal={handleSaveMeal}
            onBack={() => setActiveSecondaryView(null)}
          />
        )}

        {activeSecondaryView === 'lessons' && (
          <LearningScreen
            lessons={lessons}
            onCompleteLesson={handleCompleteLesson}
            onBack={() => setActiveSecondaryView(null)}
          />
        )}

        {activeSecondaryView === 'profile' && (
          <ProfileScreen
            profile={profile}
            achievements={achievements}
            initialTab={profileInitialTab}
            onUpdateProfile={handleUpdateProfile}
            onExportAllData={handleExportAllJSON}
            onResetData={handleResetData}
            onLogout={() => setIsAuthModalOpen(true)}
            onBack={() => setActiveSecondaryView(null)}
            onOpenJournal={() => setActiveSecondaryView('journal')}
            onOpenSymptoms={() => {
              setActiveSecondaryView(null);
              handleSelectTab('symptoms');
            }}
            onOpenAppointments={() => setActiveSecondaryView('appointments')}
          />
        )}

        {activeSecondaryView === 'journal' && (
          <JournalScreen
            entries={journalEntries}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            onBack={() => setActiveSecondaryView(null)}
          />
        )}

        {/* Primary Navigation Tabs */}
        {!activeSecondaryView && currentTab === 'home' && (
          <HomeDashboard
            profile={profile}
            remainingSpoons={remainingSpoons}
            recentSymptoms={symptoms}
            medications={medications}
            medEvents={medEvents}
            pacingTasks={pacingTasks}
            appointments={appointments}
            featuredMeal={meals[0]}
            featuredLesson={lessons[0]}
            onOpenAI={() => setIsAIModalOpen(true)}
            onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
            onNavigateTab={handleSelectTab}
            onToggleTask={handleToggleTask}
            onRecordMedication={(medId, status) => {
              handleRecordMedEvent({
                id: `me_${Date.now()}`,
                medicationId: medId,
                date: selectedDate,
                timeSlot: 'Morning',
                status,
                recordedAt: new Date().toTimeString().slice(0, 5),
              });
            }}
            onQuickReflection={handleQuickReflection}
            onOpenMeals={() => setActiveSecondaryView('meals')}
            onOpenLessons={() => setActiveSecondaryView('lessons')}
            onOpenDocuments={() => {
              setProfileInitialTab('documents');
              setActiveSecondaryView('profile');
            }}
            onOpenAppointments={() => setActiveSecondaryView('appointments')}
            onOpenJournal={() => setActiveSecondaryView('journal')}
            onUpdateCapacity={handleUpdateCapacity}
          />
        )}

        {!activeSecondaryView && currentTab === 'symptoms' && (
          <SymptomsScreen
            symptoms={symptoms}
            onAddSymptom={handleAddSymptom}
            onDeleteSymptom={handleDeleteSymptom}
            onExportSummary={() => setIsExportModalOpen(true)}
            xpScore={profile.xp}
          />
        )}

        {!activeSecondaryView && currentTab === 'myths' && (
          <MythsScreen
            lessons={lessons}
            onCompleteLesson={handleCompleteLesson}
          />
        )}

        {!activeSecondaryView && currentTab === 'space' && (
          <SpaceScreen
            remainingSpoons={remainingSpoons}
            onActivityLogged={() => {
              const realStreak = storageService.calculateRealStreak();
              setProfile((prev) => ({ ...prev, streakDays: realStreak }));
            }}
          />
        )}

        {!activeSecondaryView && currentTab === 'community' && (
          <CommunityScreen
            posts={communityPosts}
            currentUserName={profile.name}
            onAddPost={handleAddCommunityPost}
            onReact={handleReactCommunityPost}
            onAddComment={handleAddCommunityComment}
            onDeletePost={handleDeleteCommunityPost}
            onRemoveAllMessages={handleRemoveAllCommunityPosts}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation with 5 tabs */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* AI Health Companion Conversational Modal */}
      <AICompanionModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
        userProfile={profile}
        remainingSpoons={remainingSpoons}
        onSymptomLogged={() => setSymptoms(storageService.getSymptoms())}
      />

      {/* Live Voice Call Companion Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        userProfile={profile}
        remainingSpoons={remainingSpoons}
      />

      {/* Welcome & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(updatedUser) => {
          handleUpdateProfile({ ...profile, ...updatedUser });
        }}
        onStartOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Guided Onboarding Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newProfile) => {
          handleUpdateProfile({ ...profile, ...newProfile });
        }}
        initialProfile={profile}
      />

      {/* Printable Clinical Health Summary Modal */}
      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        symptoms={symptoms}
        medications={medications}
        emotions={emotions}
        appointments={appointments}
      />
      {/* Offline Connectivity Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}

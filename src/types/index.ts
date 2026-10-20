export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  age?: number;
  gender?: string;
  conditions: string[];
  commonSymptoms: string[];
  currentMedicationsSummary?: string;
  dailySpoonsCapacity: number;
  dietaryPreferences: string[];
  allergies: string[];
  dailyGoals: string[];
  notificationPrefs: {
    medications: boolean;
    dailyCheckin: boolean;
    appointments: boolean;
    restBreaks: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeFont: boolean;
  };
  streakDays: number;
  xp: number;
  badges: string[];
  isOnboarded: boolean;
  isAuthenticated: boolean;
  avatarUrl?: string;
}

export interface SymptomLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'fatigue' | 'pain' | 'sleep' | 'mood' | 'brain_fog' | 'digestive' | 'custom';
  name: string;
  intensity: number; // 1 to 10
  notes: string;
  tags: string[];
  triggers: string[];
  restPeriods?: string;
}

export interface EmotionScore {
  date: string;
  happy: number; // 0 - 100
  sad: number;
  calm: number;
  anxious: number;
  dominantMood: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  content: string;
  moodRating?: 'Joyful' | 'Peaceful' | 'Reflective' | 'Tender' | 'Low / Exhausted' | 'Anxious' | 'Grateful';
  energyRating?: number; // 1 to 10
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'As Needed';
  instructions: string;
  isAsNeeded: boolean;
  refillDate?: string;
  currentSupply?: number;
  refillReminder?: boolean;
  prescriber?: string;
  category: 'Prescription' | 'Supplement' | 'OTC';
}

export interface MedicationEvent {
  id: string;
  medicationId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'taken' | 'skipped' | 'snoozed' | 'pending';
  recordedAt?: string;
  note?: string;
}

export interface PacingTask {
  id: string;
  title: string;
  category: 'work' | 'personal' | 'care' | 'rest' | 'household';
  spoonCost: number; // e.g. 1, 2, 3, or negative for rest (+1 spoon recovered)
  isRestorative?: boolean;
  completed: boolean;
  date: string;
  time?: string;
  notes?: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  documentType: 'Lab Report' | 'Clinic Note' | 'Imaging' | 'Prescription' | 'Test Result';
  provider: string;
  date: string;
  fileName: string;
  fileSize?: string;
  keyFindings: string[];
  plainLanguageSummary: string;
  suggestedDoctorQuestions: string[];
  unverified: boolean; // Must be unverified until user confirms
  connectedSymptoms?: string[];
  userNotes?: string;
}

export interface Appointment {
  id: string;
  provider: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  purpose: string;
  reminderSet: boolean;
  completed: boolean;
  doctorQuestions: string[];
  talkingPoints: string[];
  clinicalNotes?: string;
}

export interface CareProvider {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Lab' | 'Specialist';
  specialty: string;
  address: string;
  phone: string;
  distanceMiles: number;
  rating: number;
  bookingUrl?: string;
  verified: boolean;
  openNow: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  readingMinutes: number;
  xpReward: number;
  completed: boolean;
  intro: string;
  keyTakeaway: string;
  biteSizedSections: {
    title: string;
    content: string;
    visualHint?: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  reflectionPrompt: string;
  badgeName: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  authorAvatar?: string;
  timeAgo: string;
  topic: 'pacing' | 'fatigue' | 'coping' | 'nutrition' | 'work_school' | 'appointments';
  title: string;
  content: string;
  tags: string[];
  reactions: {
    hug: number;
    spoon: number;
    strength: number;
    heart: number;
  };
  userReacted?: ('hug' | 'spoon' | 'strength' | 'heart')[];
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  xp: number;
}

export interface MealRecipe {
  id: string;
  name: string;
  imageUrl?: string;
  spoonCost: number; // 1 = Low Effort, 2 = Balanced, 3 = High Energy
  prepTimeMinutes: number;
  difficulty: 'Low Effort' | 'Moderate' | 'Involved';
  dietaryTags: string[];
  ingredients: string[];
  instructions: string[];
  lowEffortAlternative: string;
  nutritionNotes: string;
  storageGuidance: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'log_symptom' | 'log_medication' | 'pacing_tip';
    title: string;
    details: string;
    data?: any;
  } | null;
}

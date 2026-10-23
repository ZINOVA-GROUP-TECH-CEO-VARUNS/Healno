export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  age?: number;
  gender?: string;
  location?: string; // City or Location for personalized timezone greeting
  timeZone?: string; // IANA timezone e.g. America/New_York
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
  symptomBehavior?: string;
  sharingPreference?: string;
}

export interface SymptomLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'fatigue' | 'pain' | 'sleep' | 'mood' | 'brain_fog' | 'digestive' | 'custom' | 'condition';
  name: string;
  intensity: number; // 1 to 10
  notes: string;
  tags: string[];
  triggers: string[];
  restPeriods?: string;
  isCondition?: boolean; // Distinguishes chronic disorders/diagnosed conditions from acute daily symptoms
  diagnosedDate?: string;
  status?: 'active' | 'managed' | 'resolved';
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
  frequency?: string; // e.g. "Once daily", "Twice daily", "Every 8 hours", "As needed"
  startDate?: string;
  endDate?: string;
  associatedCondition?: string; // linked symptom or medical condition
  status?: 'active' | 'discontinued' | 'completed';
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'As Needed';
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  instructions: string;
  isAsNeeded: boolean;
  refillDate?: string;
  currentSupply?: number;
  refillReminder?: boolean;
  prescriber?: string;
  category: 'Prescription' | 'Supplement' | 'OTC';
  createdAt?: string;
  updatedAt?: string;
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

export interface JournalTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
}

export interface ActivityEntry {
  id: string;
  category: 'personal_care' | 'household' | 'groceries' | 'food_prep' | 'work_study' | 'movement' | 'custom';
  activityName: string;
  date: string;
  time?: string;
  durationMinutes?: number;
  quantity?: number; // Numerical progress/measurement
  unit?: string; // e.g. "steps", "mins", "glasses", "reps", "pages", "hours"
  target?: number; // Target quantity
  completed?: boolean;
  archived?: boolean; // Active vs Archived completion status
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  documentType: 'Lab Report' | 'Clinic Note' | 'Imaging' | 'Prescription' | 'Test Result';
  provider: string;
  date: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string; // Stored base64 Data URL or safe local/remote URL for preview and download
  mimeType?: string;
  associatedEvent?: string; // Link to specific appointment or symptom episode
  keyFindings: string[];
  plainLanguageSummary: string;
  suggestedDoctorQuestions: string[];
  unverified: boolean; // Must be unverified until user confirms
  connectedSymptoms?: string[];
  userNotes?: string;
  notes?: string;
  storagePath?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  provider: string; // Doctor name or clinic
  doctorName?: string; // Specific doctor name
  specialty: string;
  location: string; // Clinic or Hospital name / address
  date: string;
  time: string;
  purpose: string;
  reminderSet: boolean;
  completed: boolean;
  isRescheduled?: boolean;
  isCancelled?: boolean;
  doctorQuestions: string[];
  talkingPoints: string[];
  clinicalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  openNow?: boolean;
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
  isAnonymous?: boolean;
  authorAvatar?: string;
  timeAgo: string;
  topic: 'pacing' | 'fatigue' | 'coping' | 'nutrition' | 'work_school' | 'appointments' | string;
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
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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

export interface DailyMealPlan {
  id: string;
  date: string;
  breakfast: MealRecipe;
  lunch: MealRecipe;
  dinner: MealRecipe;
  snack?: MealRecipe;
  dietaryNotes?: string;
  generatedAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedDocument?: {
    name: string;
    type: string;
    summary?: string;
  };
  suggestedAction?: {
    type: 'log_symptom' | 'log_medication' | 'pacing_tip';
    title: string;
    details: string;
    data?: any;
  } | null;
}

export type WellnessActivityType =
  | 'breathing'
  | 'meditation'
  | 'mindfulness'
  | 'stretching'
  | 'relaxation'
  | 'sensory_rest';

export interface WellnessSession {
  id: string;
  userId?: string;
  activityType: WellnessActivityType;
  title: string;
  durationMinutes: number;
  completedAt: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
  spoonsRecovered: number;
  pattern?: string;
  createdAt?: string;
}

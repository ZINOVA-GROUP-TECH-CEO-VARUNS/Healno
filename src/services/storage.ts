import {
  UserProfile,
  SymptomLog,
  EmotionScore,
  Medication,
  MedicationEvent,
  PacingTask,
  MedicalDocument,
  Appointment,
  CareProvider,
  Lesson,
  CommunityPost,
  Achievement,
  MealRecipe,
  JournalEntry,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'healno_profile',
  SYMPTOMS: 'healno_symptoms',
  EMOTIONS: 'healno_emotions',
  JOURNAL: 'healno_journal',
  MEDICATIONS: 'healno_medications',
  MED_EVENTS: 'healno_med_events',
  PACING_TASKS: 'healno_pacing_tasks',
  DOCUMENTS: 'healno_documents',
  APPOINTMENTS: 'healno_appointments',
  LESSONS: 'healno_lessons',
  COMMUNITY_POSTS: 'healno_community_posts',
  ACHIEVEMENTS: 'healno_achievements',
  MEALS: 'healno_meals',
};

// Seed initial profile
export const defaultProfile: UserProfile = {
  id: 'user_01',
  name: 'Jose Maria',
  email: 'jose.maria@healno.app',
  phone: '+1 (555) 234-5678',
  dob: '1994-06-14',
  age: 32,
  gender: 'Non-binary',
  conditions: ['Dysautonomia / POTS', 'Chronic Fatigue Syndrome', 'Mild Sensory Sensitivity'],
  commonSymptoms: ['Fatigue', 'Brain Fog', 'Joint Discomfort', 'Lightheadedness'],
  currentMedicationsSummary: 'Fludrocortisone 0.1mg, CoQ10 200mg, Electrolytes daily',
  dailySpoonsCapacity: 12,
  dietaryPreferences: ['Low Histamine', 'Gluten-Conscious', 'High Hydration'],
  allergies: ['Penicillin', 'Sulfa'],
  dailyGoals: ['Protect morning energy', 'Take pacing rest breaks', 'Stay hydrated'],
  notificationPrefs: {
    medications: true,
    dailyCheckin: true,
    appointments: true,
    restBreaks: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeFont: false,
  },
  streakDays: 5,
  xp: 420,
  badges: ['badge_pacing_start', 'badge_gentle_morning', 'badge_first_week'],
  isOnboarded: true,
  isAuthenticated: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

// Seed initial emotions (matches the reference image 420 score and 4 core emotions: Happy 48%, Sad 33%, Calm 27%, Anxious 40%)
export const defaultEmotions: EmotionScore[] = [
  {
    date: new Date().toISOString().split('T')[0],
    happy: 48,
    sad: 33,
    calm: 27,
    anxious: 40,
    dominantMood: 'Gently Reflective',
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    happy: 55,
    sad: 20,
    calm: 45,
    anxious: 25,
    dominantMood: 'Peaceful',
  },
  {
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    happy: 40,
    sad: 45,
    calm: 30,
    anxious: 50,
    dominantMood: 'Fatigued',
  },
];

export const defaultJournalEntries: JournalEntry[] = [
  {
    id: 'entry_1',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    title: 'Morning Reflections & Protecting My Spoons',
    content: `Woke up feeling that familiar heavy fog, but instead of forcing myself out of bed in a rush, I took 20 minutes lying horizontal with slow belly breaths.

Noticing that my wrists feel softer today after taking the magnesium glycinate last night. Today my primary intention is simple: do not push through the 2:00 PM dip. The dishes and laundry can wait until tomorrow. My peace and neurological calm come first.`,
    moodRating: 'Reflective',
    energyRating: 5,
    tags: ['Morning Reflection', 'Pacing Intention', 'Self-Compassion'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'entry_2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '16:45',
    title: 'A Gentle Afternoon Victory',
    content: `Usually after an errand run I crash and beat myself up. Today I did something different: I sat on the kitchen stool while making tea, drank my electrolytes slowly, and took an unhurried rest break with eyes closed.

I didn't crash. Stopping before the threshold really does change the outcome. Feeling genuinely grateful for this gentle shift.`,
    moodRating: 'Grateful',
    energyRating: 6,
    tags: ['Pacing Win', 'Electrolytes', 'Gratitude'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'entry_3',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    time: '20:15',
    title: 'Evening Quiet & Breathwork',
    content: `A quiet sensory evening. Dimmed all overhead lamps by 7:30 PM. Listened to the Healno wind-down guide. It's okay that I only completed two tasks today; my body is doing restorative work around the clock.`,
    moodRating: 'Peaceful',
    energyRating: 4,
    tags: ['Sensory Rest', 'Wind Down', 'Pacing'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const defaultSymptoms: SymptomLog[] = [
  {
    id: 'sym_1',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    category: 'fatigue',
    name: 'Persistent Fatigue',
    intensity: 6,
    notes: 'Felt heavy after waking up, took an extra 20 min lying flat.',
    tags: ['Morning', 'Unrefreshing Sleep'],
    triggers: ['Poor sleep latency'],
    restPeriods: '20 min horizontal rest',
  },
  {
    id: 'sym_2',
    date: new Date().toISOString().split('T')[0],
    time: '11:15',
    category: 'brain_fog',
    name: 'Brain Fog',
    intensity: 4,
    notes: 'Mild word-finding difficulty during reading.',
    tags: ['Reading', 'Cognitive'],
    triggers: ['Bright screen'],
    restPeriods: '15 min audio-only pause',
  },
  {
    id: 'sym_3',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '15:00',
    category: 'pain',
    name: 'Joint Discomfort',
    intensity: 5,
    notes: 'Ache across upper back and wrists.',
    tags: ['Post-Desk Work'],
    triggers: ['Typing session'],
    restPeriods: 'Warm compress + reclined rest',
  },
  {
    id: 'sym_4',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    time: '18:00',
    category: 'fatigue',
    name: 'Post-Exertional Fatigue',
    intensity: 7,
    notes: 'Crashed after errand run.',
    tags: ['Overexertion', 'Errands'],
    triggers: ['Standing in line'],
    restPeriods: 'Full quiet rest',
  },
];

export const defaultMedications: Medication[] = [
  {
    id: 'med_1',
    name: 'Fludrocortisone',
    dosage: '0.1 mg',
    scheduleTimes: ['08:00'],
    timeSlot: 'Morning',
    instructions: 'Take with full glass of water and electrolytes after breakfast.',
    isAsNeeded: false,
    refillDate: '2026-11-15',
    currentSupply: 24,
    refillReminder: true,
    prescriber: 'Dr. Evelyn Vance (Autonomic Neurology)',
    category: 'Prescription',
  },
  {
    id: 'med_2',
    name: 'Coenzyme Q10 (Ubiquinol)',
    dosage: '200 mg',
    scheduleTimes: ['08:00'],
    timeSlot: 'Morning',
    instructions: 'Take with morning meal containing healthy fats for cellular support.',
    isAsNeeded: false,
    currentSupply: 45,
    refillReminder: false,
    category: 'Supplement',
  },
  {
    id: 'med_3',
    name: 'Magnesium Glycinate',
    dosage: '300 mg',
    scheduleTimes: ['21:30'],
    timeSlot: 'Bedtime',
    instructions: 'Take 30 minutes before sleep to support muscular relaxation.',
    isAsNeeded: false,
    refillDate: '2026-11-01',
    currentSupply: 12,
    refillReminder: true,
    category: 'Supplement',
  },
  {
    id: 'med_4',
    name: 'Oral Rehydration Salts',
    dosage: '1 Packet in 500ml',
    scheduleTimes: ['14:00'],
    timeSlot: 'Afternoon',
    instructions: 'Sip slowly when feeling orthostatic or lightheaded.',
    isAsNeeded: true,
    currentSupply: 18,
    category: 'OTC',
  },
];

export const defaultMedEvents: MedicationEvent[] = [
  {
    id: 'me_1',
    medicationId: 'med_1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning',
    status: 'taken',
    recordedAt: '08:15',
  },
  {
    id: 'me_2',
    medicationId: 'med_2',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning',
    status: 'taken',
    recordedAt: '08:15',
  },
  {
    id: 'me_3',
    medicationId: 'med_4',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Afternoon',
    status: 'pending',
  },
  {
    id: 'me_4',
    medicationId: 'med_3',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Bedtime',
    status: 'pending',
  },
];

export const defaultPacingTasks: PacingTask[] = [
  {
    id: 'task_1',
    title: 'Mindful Morning Reflection',
    category: 'personal',
    spoonCost: 1,
    completed: true,
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    notes: 'Journaled 3 gentle thoughts',
  },
  {
    id: 'task_2',
    title: 'Hydration & Morning Electrolytes',
    category: 'care',
    spoonCost: 1,
    completed: true,
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
  },
  {
    id: 'task_3',
    title: 'Gentle Pacing Rest Break',
    category: 'rest',
    spoonCost: -1, // Restores 1 spoon!
    isRestorative: true,
    completed: true,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    notes: '15 minutes quiet room lying flat',
  },
  {
    id: 'task_4',
    title: 'Review Blood Pressure & Heart Rate Log',
    category: 'care',
    spoonCost: 1,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    time: '13:00',
  },
  {
    id: 'task_5',
    title: 'Prepare Questions for Dr. Vance',
    category: 'care',
    spoonCost: 2,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    time: '15:30',
  },
  {
    id: 'task_6',
    title: 'Evening Dim-Light Wind Down',
    category: 'rest',
    spoonCost: -1,
    isRestorative: true,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
  },
];

export const defaultDocuments: MedicalDocument[] = [
  {
    id: 'doc_1',
    title: 'Comprehensive Metabolic & Iron Panel',
    documentType: 'Lab Report',
    provider: 'Pacific Diagnostics Laboratory',
    date: '2026-10-05',
    fileName: 'metabolic_iron_panel_oct2026.pdf',
    fileSize: '1.4 MB',
    keyFindings: [
      'Serum Ferritin: 19 ng/mL (Reference: 15 - 150 ng/mL) — Borderline low',
      'Vitamin D (25-OH): 28 ng/mL (Reference: 30 - 100 ng/mL) — Mild insufficiency',
      'Sodium: 141 mEq/L (Normal)',
      'Potassium: 4.2 mEq/L (Normal)',
    ],
    plainLanguageSummary: 'Your metabolic values and electrolytes look balanced. Your iron reserve (ferritin) and vitamin D are near the low threshold, which may be tied to daytime fatigue.',
    suggestedDoctorQuestions: [
      'Could my low-normal ferritin be contributing to my post-exertional fatigue?',
      'Do you suggest starting a gentle, non-constipating iron or vitamin D3 supplement?',
      'Should we retest these markers in 3 months?',
    ],
    unverified: false,
    connectedSymptoms: ['Fatigue', 'Brain Fog'],
    userNotes: 'Discussed briefly via patient portal; to review in person at next check-in.',
  },
  {
    id: 'doc_2',
    title: 'Autonomic Tilt Table Summary Note',
    documentType: 'Clinic Note',
    provider: 'St. Jude Neurological Specialty Clinic',
    date: '2026-08-12',
    fileName: 'tilt_table_autonomic_eval.pdf',
    fileSize: '840 KB',
    keyFindings: [
      'Resting Supine HR: 68 bpm; Upright 10-min HR: 112 bpm (+44 bpm increase)',
      'Blood pressure remained stable without significant orthostatic drop',
      'Consistent with postural orthostatic tachycardia criteria',
    ],
    plainLanguageSummary: 'The test documented an upright heart rate increase exceeding 30 beats per minute without a blood pressure drop, meeting the standard criteria for POTS.',
    suggestedDoctorQuestions: [
      'What are our optimal salt and fluid intake targets based on these results?',
      'Is compression wear (waist-high vs knee-high) recommended for my symptom profile?',
    ],
    unverified: false,
    connectedSymptoms: ['Lightheadedness', 'Fatigue'],
  },
];

export const defaultAppointments: Appointment[] = [
  {
    id: 'apt_1',
    provider: 'Dr. Evelyn Vance',
    specialty: 'Autonomic Neurology',
    location: 'Northwestern Neuro Center, Suite 410',
    date: '2026-10-28',
    time: '14:00',
    purpose: '6-Month POTS & Energy Pacing Follow-up',
    reminderSet: true,
    completed: false,
    doctorQuestions: [
      'Should we adjust the timing of fludrocortisone for morning peaks?',
      'Can we review my borderline ferritin results from the October panel?',
      'What are gentle guidelines for reconditioning during flare-ups?',
    ],
    talkingPoints: [
      'Energy has been around 6-7 spoons average, dipping on days with errands.',
      'Hydration routine has reduced afternoon lightheaded episodes.',
      'Brain fog remains noticeable when reading for more than 45 minutes.',
    ],
    clinicalNotes: 'Bring updated symptom export and medication checklist.',
  },
  {
    id: 'apt_2',
    provider: 'Dr. Marcus Chen',
    specialty: 'Integrative Primary Care',
    location: 'City Green Health Clinic',
    date: '2026-11-12',
    time: '10:30',
    purpose: 'Routine Labs & Vitamin D Review',
    reminderSet: true,
    completed: false,
    doctorQuestions: [
      'Is vitamin D3 + K2 appropriate for winter months?',
      'Check fasting blood sugar and lipid trends.',
    ],
    talkingPoints: [
      'Daily joint comfort has improved with magnesium glycinate at night.',
    ],
  },
];

export const defaultCareProviders: CareProvider[] = [
  {
    id: 'prov_1',
    name: 'Northwestern Neuro & Autonomic Care',
    type: 'Specialist',
    specialty: 'Dysautonomia & Neurology',
    address: '675 N Michigan Ave, Suite 410',
    phone: '(312) 555-0192',
    distanceMiles: 2.4,
    rating: 4.9,
    bookingUrl: 'https://healno-directory.example/northwestern-neuro',
    verified: true,
    openNow: true,
  },
  {
    id: 'prov_2',
    name: 'Kindred Integrative Family Medicine',
    type: 'Clinic',
    specialty: 'Chronic Illness & Primary Care',
    address: '1420 W Belmont Ave',
    phone: '(773) 555-0188',
    distanceMiles: 3.1,
    rating: 4.8,
    bookingUrl: 'https://healno-directory.example/belmont-clinic',
    verified: true,
    openNow: true,
  },
  {
    id: 'prov_3',
    name: 'Quest Diagnostic Patient Service Center',
    type: 'Lab',
    specialty: 'Bloodwork & Diagnostic Testing',
    address: '2800 N Lincoln Ave',
    phone: '(866) 555-0120',
    distanceMiles: 1.8,
    rating: 4.6,
    bookingUrl: 'https://healno-directory.example/quest-lincoln',
    verified: true,
    openNow: true,
  },
  {
    id: 'prov_4',
    name: 'Memorial Community Hospital Outpatient',
    type: 'Hospital',
    specialty: 'Comprehensive Diagnostics & Imaging',
    address: '2520 N Lakeview Ave',
    phone: '(312) 555-0100',
    distanceMiles: 4.0,
    rating: 4.7,
    bookingUrl: 'https://healno-directory.example/memorial-hospital',
    verified: true,
    openNow: true,
  },
];

export const defaultLessons: Lesson[] = [
  {
    id: 'les_1',
    title: 'The Art of Spoon Theory & Pacing',
    category: 'Pacing & Energy',
    readingMinutes: 4,
    xpReward: 30,
    completed: true,
    intro: 'Energy with chronic health conditions is not unlimited; understanding your personal energy currency allows you to thrive without guilt.',
    keyTakeaway: 'Stopping before you reach your limit is preventive medicine, not giving up.',
    biteSizedSections: [
      {
        title: '1. What Are Spoons?',
        content: 'Originating from Christine Miserandino, the Spoon Theory describes energy as physical units. A healthy person might wake up with 40 spoons, while someone managing chronic illness may start with 10 to 14 spoons for the entire day.',
        visualHint: '🥄 Each task has a spoon cost: showering (2), commuting (3), cooking (2).',
      },
      {
        title: '2. The Energy Envelope',
        content: 'Your "Energy Envelope" is the boundary where you can function without triggering post-exertional malaise (PEM). Staying within 75-80% of capacity prevents severe boom-and-bust cycles.',
      },
      {
        title: '3. Restorative Pacing',
        content: 'True rest means zero sensory input: lying flat, dim lights, eyes resting, or listening to calm soundscapes. Scrolling social media or watching intense television still burns cognitive spoons.',
      },
    ],
    quiz: {
      question: 'What is the primary goal of pacing your daily spoons?',
      options: [
        'To force yourself to work through exhaustion',
        'To stay within your energy envelope and prevent severe symptom crashes',
        'To eliminate all daily rest periods',
        'To measure energy as a strict medical diagnosis',
      ],
      correctIndex: 1,
      explanation: 'Pacing aims to keep you within your safe energy envelope so your body avoids the boom-and-bust flare cycle.',
    },
    reflectionPrompt: 'What is one activity you can simplify or postpone today to save 1 or 2 spoons?',
    badgeName: 'Pacing Pioneer',
  },
  {
    id: 'les_2',
    title: 'Decoding Persistent Fatigue vs. Tiredness',
    category: 'Fatigue Science',
    readingMinutes: 5,
    xpReward: 35,
    completed: false,
    intro: 'Healthy sleep cures ordinary tiredness; chronic fatigue requires a multi-layered approach to nervous system support.',
    keyTakeaway: 'Cellular fatigue reflects energy production differences, not lack of willpower.',
    biteSizedSections: [
      {
        title: '1. Why Rest Doesn’t Always Fix It',
        content: 'Chronic fatigue often involves mitochondrial signaling, autonomic dysregulation, and neuro-inflammation. It is a biological response, not laziness.',
      },
      {
        title: '2. Identifying Your Warning Signs',
        content: 'Common early warning signs before a crash include heavy limbs, sudden chilliness, word stumble, increased light sensitivity, and irritability.',
      },
      {
        title: '3. Gentle Reset Micro-Breaks',
        content: 'Taking 5-minute pre-emptive rests every 60-90 minutes preserves up to 30% more energy across the day than waiting until you feel drained.',
      },
    ],
    quiz: {
      question: 'Which of the following is an early biological warning sign of reaching your energy limit?',
      options: [
        'Sudden heightened euphoria',
        'Mild word-finding difficulty, heavy limbs, or sensory sensitivity',
        'Desire to run a marathon',
        'Immediate drop in appetite for water',
      ],
      correctIndex: 1,
      explanation: 'Subtle neuro-sensory shifts like word slips, photophobia, and heavy limbs frequently signal that you are approaching your threshold.',
    },
    reflectionPrompt: 'Notice how your body feels right now: are your shoulders relaxed? Take one soft exhale.',
    badgeName: 'Fatigue Scholar',
  },
  {
    id: 'les_3',
    title: 'Collaborating Effectively With Healthcare Clinicians',
    category: 'Care Coordination',
    readingMinutes: 4,
    xpReward: 30,
    completed: false,
    intro: 'Doctor appointments can feel rushed and overwhelming. Having a structured one-page brief levels the playing field.',
    keyTakeaway: 'Focus on functional impacts (what you cannot do) rather than just numbers.',
    biteSizedSections: [
      {
        title: '1. Frame Symptoms Around Function',
        content: 'Instead of saying "I am very tired", say "My fatigue prevents me from preparing dinner 4 days a week and requires 3 hours of horizontal rest after grocery runs."',
      },
      {
        title: '2. The Rule of Three Questions',
        content: 'Clinicians rarely have time for 10 topics. Pick your top 2 or 3 priority questions and share them at the first minute of your visit.',
      },
    ],
    quiz: {
      question: 'Which statement is most effective during a 15-minute medical consultation?',
      options: [
        'Vague descriptions like "I just do not feel right"',
        'Concrete functional impact: "I cannot stand for more than 10 minutes without dizziness"',
        'Arguing over medical textbooks',
        'Keeping quiet about your real daily struggles',
      ],
      correctIndex: 1,
      explanation: 'Functional statements provide clinicians with concrete clinical criteria to evaluate and support with treatment.',
    },
    reflectionPrompt: 'Write down your #1 question you want answered at your next medical visit.',
    badgeName: 'Advocacy Champion',
  },
];

export const defaultCommunityPosts: CommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'Rowan K.',
    isAnonymous: false,
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    timeAgo: '2h ago',
    topic: 'pacing',
    title: 'Reminder: Giving yourself permission to rest without earning it first',
    content: 'For years I thought I had to "earn" lying on the couch by finishing laundry or answering emails. Today my body whispered that it was running on empty, so I paused midway. Healing is not a performance review.',
    tags: ['Self-Compassion', 'Spoon Theory', 'Rest'],
    reactions: {
      hug: 42,
      spoon: 58,
      strength: 31,
      heart: 64,
    },
    userReacted: ['hug', 'spoon'],
    commentsCount: 12,
    comments: [
      {
        id: 'c_1',
        author: 'Elena M.',
        content: 'Needed to read this exact message today. Sitting with my tea and leaving the dishes for tomorrow.',
        timeAgo: '1h ago',
      },
      {
        id: 'c_2',
        author: 'Sam P.',
        content: 'Sending spoons! Rest is biological maintenance, not a luxury.',
        timeAgo: '45m ago',
      },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Alex (POTS & ME)',
    isAnonymous: false,
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    timeAgo: '5h ago',
    topic: 'coping',
    title: 'My top 3 low-spoon kitchen hacks for dinner when standing is hard',
    content: '1. A rolling stool in the kitchen so I can chop seated. 2. Pre-cooked rice bowls + frozen veg + bone broth. 3. Microwave steamers instead of heavy pots. What are your favorite low-energy meal savers?',
    tags: ['KitchenHacks', 'LowSpoons', 'POTS'],
    reactions: {
      hug: 18,
      spoon: 73,
      strength: 29,
      heart: 35,
    },
    userReacted: ['spoon'],
    commentsCount: 8,
    comments: [
      {
        id: 'c_3',
        author: 'Jordan T.',
        content: 'The shower chair and the kitchen stool changed my entire week. Zero shame in using tools!',
        timeAgo: '3h ago',
      },
    ],
  },
  {
    id: 'post_3',
    authorName: 'Anonymous Friend',
    isAnonymous: true,
    timeAgo: '8h ago',
    topic: 'appointments',
    title: 'Prepared my doctor visit brief using Healno and for the first time I was heard',
    content: 'Normally I get brain fog the minute I step into the exam room and forget half my symptoms. Printing out the 1-page summary of my heart rate spikes and top 3 questions kept us totally focused. Doctor took me seriously and ordered the ferritin recheck.',
    tags: ['DoctorPrep', 'Advocacy', 'Win'],
    reactions: {
      hug: 24,
      spoon: 39,
      strength: 51,
      heart: 48,
    },
    userReacted: ['heart'],
    commentsCount: 5,
    comments: [],
  },
];

export const defaultAchievements: Achievement[] = [
  {
    id: 'badge_pacing_start',
    title: 'Pacing Pioneer',
    description: 'Set your daily spoon budget and logged activities without exceeding capacity.',
    iconName: 'Sparkles',
    unlockedAt: '2026-10-15',
    isUnlocked: true,
    xp: 50,
  },
  {
    id: 'badge_gentle_morning',
    title: 'Mindful Morning',
    description: 'Began the day with a gentle check-in before rushing into chores.',
    iconName: 'Sun',
    unlockedAt: '2026-10-18',
    isUnlocked: true,
    xp: 40,
  },
  {
    id: 'badge_first_week',
    title: '5-Day Harmony Streak',
    description: 'Consistently checked in with your symptoms and energy for 5 days.',
    iconName: 'Heart',
    unlockedAt: '2026-10-20',
    isUnlocked: true,
    xp: 100,
  },
  {
    id: 'badge_advocate',
    title: 'Care Advocate',
    description: 'Prepared clinical questions before an upcoming medical appointment.',
    iconName: 'ShieldCheck',
    isUnlocked: false,
    xp: 60,
  },
  {
    id: 'badge_rest_champion',
    title: 'Rest Champion',
    description: 'Completed a scheduled 20-minute restorative sensory pause.',
    iconName: 'Moon',
    isUnlocked: false,
    xp: 50,
  },
];

export const defaultMeals: MealRecipe[] = [
  {
    id: 'meal_1',
    name: '10-Minute Soothing Ginger Miso Broth & Rice',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80',
    spoonCost: 1,
    prepTimeMinutes: 10,
    difficulty: 'Low Effort',
    dietaryTags: ['Low Histamine', 'Gluten-Free', 'Quick Low-Spoon'],
    ingredients: [
      '1 tbsp mild white sweet miso paste',
      '1 cup warm bone broth or mineral veggie broth',
      '1 cup pre-cooked jasmine or brown rice (warm)',
      '1/2 tsp fresh grated ginger or powder',
      'Handful tender baby spinach leaves',
      '1 tsp sesame oil & pinch of sea salt',
    ],
    instructions: [
      'Pour warm broth into a wide bowl or deep mug.',
      'Dissolve miso paste and ginger using a small whisk or fork.',
      'Fold in warm pre-cooked rice and fresh spinach leaves (they wilt in seconds).',
      'Drizzle with sesame oil. Requires only 1 bowl and 1 spoon to clean.',
    ],
    lowEffortAlternative: 'Use a thermos of warm store-bought broth with instant rice cakes or gluten-free toast.',
    nutritionNotes: 'Easily digestible complex carbs paired with soothing gut-friendly probiotics and bioavailable minerals.',
    storageGuidance: 'Best made fresh on demand in under 10 minutes.',
  },
  {
    id: 'meal_2',
    name: 'Gentle Quinoa & Roasted Sweet Potato Nourish Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
    spoonCost: 2,
    prepTimeMinutes: 20,
    difficulty: 'Moderate',
    dietaryTags: ['Anti-inflammatory', 'Gluten-Free', 'Fiber-Rich'],
    ingredients: [
      '1 cup cooked fluffy quinoa',
      '1 cup cubed roasted sweet potatoes & zucchini',
      '1/2 cup tender chickpeas or poached chicken',
      '2 tbsp creamy tahini lemon dressing',
      '1 tbsp toasted pumpkin seeds',
    ],
    instructions: [
      'Layer warm quinoa in the base of your bowl.',
      'Arrange roasted sweet potatoes, zucchini, and protein alongside.',
      'Spoon creamy tahini dressing over top and finish with pumpkin seeds.',
    ],
    lowEffortAlternative: 'Buy pre-roasted sweet potatoes or canned chickpeas to skip the cooking step.',
    nutritionNotes: 'High in potassium and beta-carotene, ideal for sustaining steady afternoon blood pressure.',
    storageGuidance: 'Keep leftovers in an airtight glass container for up to 3 days.',
  },
  {
    id: 'meal_3',
    name: 'Warm Turmeric Golden Oat Porridge with Blueberries',
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=500&q=80',
    spoonCost: 1,
    prepTimeMinutes: 8,
    difficulty: 'Low Effort',
    dietaryTags: ['Anti-inflammatory', 'Comforting', 'Dairy-Free'],
    ingredients: [
      '1/2 cup rolled gluten-free oats',
      '1 cup oat milk or almond milk',
      '1/4 tsp ground turmeric + pinch black pepper',
      '1 tsp pure maple syrup or raw honey',
      '1/4 cup wild blueberries (fresh or frozen)',
    ],
    instructions: [
      'Simmer oats in milk with turmeric on low heat for 5 minutes.',
      'Stir in maple syrup and transfer to a bowl.',
      'Top with blueberries which gently thaw and release warm juices.',
    ],
    lowEffortAlternative: 'Use instant single-serve oatmeal packet with warm milk and a dash of turmeric.',
    nutritionNotes: 'Rich in polyphenols and calming curcumin to soothe systemic discomfort.',
    storageGuidance: 'Serve warm immediately.',
  },
];

// Helper functions for reading & writing to storage
export const storageService = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  },
  setProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },

  getEmotions: (): EmotionScore[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMOTIONS);
      return data ? JSON.parse(data) : defaultEmotions;
    } catch {
      return defaultEmotions;
    }
  },
  addEmotion: (score: EmotionScore): void => {
    const list = storageService.getEmotions();
    const existingIdx = list.findIndex(e => e.date === score.date);
    if (existingIdx >= 0) {
      list[existingIdx] = score;
    } else {
      list.unshift(score);
    }
    localStorage.setItem(STORAGE_KEYS.EMOTIONS, JSON.stringify(list));
  },

  getSymptoms: (): SymptomLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYMPTOMS);
      return data ? JSON.parse(data) : defaultSymptoms;
    } catch {
      return defaultSymptoms;
    }
  },
  addSymptom: (symptom: SymptomLog): void => {
    const list = storageService.getSymptoms();
    list.unshift(symptom);
    localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
  },
  deleteSymptom: (id: string): void => {
    const list = storageService.getSymptoms().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
  },

  getMedications: (): Medication[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return data ? JSON.parse(data) : defaultMedications;
    } catch {
      return defaultMedications;
    }
  },
  saveMedication: (med: Medication): void => {
    const list = storageService.getMedications();
    const idx = list.findIndex(m => m.id === med.id);
    if (idx >= 0) {
      list[idx] = med;
    } else {
      list.push(med);
    }
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(list));
  },
  deleteMedication: (id: string): void => {
    const list = storageService.getMedications().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(list));
  },

  getMedEvents: (): MedicationEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MED_EVENTS);
      return data ? JSON.parse(data) : defaultMedEvents;
    } catch {
      return defaultMedEvents;
    }
  },
  recordMedEvent: (event: MedicationEvent): void => {
    const list = storageService.getMedEvents();
    const idx = list.findIndex(e => e.medicationId === event.medicationId && e.date === event.date && e.timeSlot === event.timeSlot);
    if (idx >= 0) {
      list[idx] = event;
    } else {
      list.push(event);
    }
    localStorage.setItem(STORAGE_KEYS.MED_EVENTS, JSON.stringify(list));
  },

  getPacingTasks: (): PacingTask[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PACING_TASKS);
      return data ? JSON.parse(data) : defaultPacingTasks;
    } catch {
      return defaultPacingTasks;
    }
  },
  savePacingTask: (task: PacingTask): void => {
    const list = storageService.getPacingTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      list[idx] = task;
    } else {
      list.unshift(task);
    }
    localStorage.setItem(STORAGE_KEYS.PACING_TASKS, JSON.stringify(list));
  },
  deletePacingTask: (id: string): void => {
    const list = storageService.getPacingTasks().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.PACING_TASKS, JSON.stringify(list));
  },

  getDocuments: (): MedicalDocument[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : defaultDocuments;
    } catch {
      return defaultDocuments;
    }
  },
  saveDocument: (doc: MedicalDocument): void => {
    const list = storageService.getDocuments();
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      list[idx] = doc;
    } else {
      list.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
  },
  deleteDocument: (id: string): void => {
    const list = storageService.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
  },

  getAppointments: (): Appointment[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : defaultAppointments;
    } catch {
      return defaultAppointments;
    }
  },
  saveAppointment: (apt: Appointment): void => {
    const list = storageService.getAppointments();
    const idx = list.findIndex(a => a.id === apt.id);
    if (idx >= 0) {
      list[idx] = apt;
    } else {
      list.push(apt);
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  },
  deleteAppointment: (id: string): void => {
    const list = storageService.getAppointments().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  },

  getLessons: (): Lesson[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return data ? JSON.parse(data) : defaultLessons;
    } catch {
      return defaultLessons;
    }
  },
  markLessonComplete: (lessonId: string): void => {
    const list = storageService.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson && !lesson.completed) {
      lesson.completed = true;
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(list));
      // Award XP
      const profile = storageService.getProfile();
      profile.xp += lesson.xpReward;
      if (!profile.badges.includes(lesson.badgeName)) {
        profile.badges.push(lesson.badgeName);
      }
      storageService.setProfile(profile);
    }
  },

  getCommunityPosts: (): CommunityPost[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
      return data ? JSON.parse(data) : defaultCommunityPosts;
    } catch {
      return defaultCommunityPosts;
    }
  },
  addCommunityPost: (post: CommunityPost): void => {
    const list = storageService.getCommunityPosts();
    list.unshift(post);
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list));
  },
  reactToPost: (postId: string, reactionType: 'hug' | 'spoon' | 'strength' | 'heart'): void => {
    const list = storageService.getCommunityPosts();
    const post = list.find(p => p.id === postId);
    if (post) {
      if (!post.userReacted) post.userReacted = [];
      if (post.userReacted.includes(reactionType)) {
        post.userReacted = post.userReacted.filter(r => r !== reactionType);
        post.reactions[reactionType] = Math.max(0, post.reactions[reactionType] - 1);
      } else {
        post.userReacted.push(reactionType);
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      }
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list));
    }
  },
  addCommentToPost: (postId: string, commentText: string, authorName: string): void => {
    const list = storageService.getCommunityPosts();
    const post = list.find(p => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push({
        id: `c_${Date.now()}`,
        author: authorName,
        content: commentText,
        timeAgo: 'Just now',
      });
      post.commentsCount = post.comments.length;
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list));
    }
  },

  getAchievements: (): Achievement[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : defaultAchievements;
    } catch {
      return defaultAchievements;
    }
  },

  getMeals: (): MealRecipe[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEALS);
      return data ? JSON.parse(data) : defaultMeals;
    } catch {
      return defaultMeals;
    }
  },
  saveMeal: (meal: MealRecipe): void => {
    const list = storageService.getMeals();
    list.unshift(meal);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(list));
  },

  // Personal Diary / Journal methods
  getJournalEntries: (): JournalEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return data ? JSON.parse(data) : defaultJournalEntries;
    } catch {
      return defaultJournalEntries;
    }
  },
  saveJournalEntry: (entry: JournalEntry): void => {
    const list = storageService.getJournalEntries();
    const idx = list.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      list[idx] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...entry, createdAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(list));
  },
  deleteJournalEntry: (id: string): void => {
    const list = storageService.getJournalEntries().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(list));
  },

  // Calculate real streak from persisted activity records using local user dates
  calculateRealStreak: (): number => {
    const symptoms = storageService.getSymptoms();
    const emotions = storageService.getEmotions();
    const journal = storageService.getJournalEntries();
    const medEvents = storageService.getMedEvents();
    const tasks = storageService.getPacingTasks();

    const activeDates = new Set<string>();
    symptoms.forEach(s => activeDates.add(s.date));
    emotions.forEach(e => activeDates.add(e.date));
    journal.forEach(j => activeDates.add(j.date));
    medEvents.forEach(m => {
      if (m.status === 'taken' || m.status === 'skipped') activeDates.add(m.date);
    });
    tasks.forEach(t => {
      if (t.completed) activeDates.add(t.date);
    });

    const now = new Date();
    let streak = 0;
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayStr = checkDate.toISOString().split('T')[0];
    if (!activeDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!activeDates.has(yesterdayStr)) {
        return 0;
      }
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(dStr)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  // Get all active dates for monthly calendar dots
  getAllActiveDates: (): { [date: string]: { journal: boolean; symptoms: boolean; meds: boolean; tasks: boolean } } => {
    const symptoms = storageService.getSymptoms();
    const journal = storageService.getJournalEntries();
    const medEvents = storageService.getMedEvents();
    const tasks = storageService.getPacingTasks();

    const dateMap: { [date: string]: { journal: boolean; symptoms: boolean; meds: boolean; tasks: boolean } } = {};

    const getOrCreate = (d: string) => {
      if (!dateMap[d]) {
        dateMap[d] = { journal: false, symptoms: false, meds: false, tasks: false };
      }
      return dateMap[d];
    };

    journal.forEach(j => { getOrCreate(j.date).journal = true; });
    symptoms.forEach(s => { getOrCreate(s.date).symptoms = true; });
    medEvents.forEach(m => {
      if (m.status === 'taken' || m.status === 'skipped') {
        getOrCreate(m.date).meds = true;
      }
    });
    tasks.forEach(t => {
      if (t.completed) {
        getOrCreate(t.date).tasks = true;
      }
    });

    return dateMap;
  },

  // Get complete historical record for any specific date
  getHistoricalDayData: (dateStr: string) => {
    const journal = storageService.getJournalEntries().filter(j => j.date === dateStr);
    const symptoms = storageService.getSymptoms().filter(s => s.date === dateStr);
    const emotions = storageService.getEmotions().find(e => e.date === dateStr) || null;
    const medications = storageService.getMedications();
    const events = storageService.getMedEvents().filter(e => e.date === dateStr);
    const medLogs = events.map(ev => {
      const med = medications.find(m => m.id === ev.medicationId);
      return {
        ...ev,
        medName: med?.name || 'Medication',
        dosage: med?.dosage || '',
      };
    });
    const tasks = storageService.getPacingTasks().filter(t => t.date === dateStr);

    const hasActivity = Boolean(
      journal.length > 0 ||
      symptoms.length > 0 ||
      emotions !== null ||
      medLogs.length > 0 ||
      tasks.length > 0
    );

    return {
      date: dateStr,
      journal,
      symptoms,
      emotions,
      medLogs,
      tasks,
      hasActivity,
    };
  },

  exportAllDataJSON: (): string => {
    const exportObject = {
      appName: 'Healno',
      exportedAt: new Date().toISOString(),
      profile: storageService.getProfile(),
      journal: storageService.getJournalEntries(),
      symptoms: storageService.getSymptoms(),
      emotions: storageService.getEmotions(),
      medications: storageService.getMedications(),
      medEvents: storageService.getMedEvents(),
      pacingTasks: storageService.getPacingTasks(),
      documents: storageService.getDocuments(),
      appointments: storageService.getAppointments(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  resetAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
};

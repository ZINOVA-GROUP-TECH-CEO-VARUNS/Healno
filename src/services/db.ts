import { supabase, getSupabaseConfig } from './supabase';
import { storageService } from './storage';
import {
  UserProfile,
  SymptomLog,
  EmotionScore,
  Medication,
  MedicationEvent,
  PacingTask,
  MedicalDocument,
  Appointment,
  CommunityPost,
  JournalEntry,
  ActivityEntry,
  DailyMealPlan,
  WellnessSession,
} from '../types';

export const dbService = {
  getStatus: () => {
    const config = getSupabaseConfig();
    return {
      isSupabaseActive: Boolean(supabase && config.isConfigured),
      supabaseUrl: config.url,
      mode: config.isConfigured ? ('supabase' as const) : ('local_persistent' as const),
    };
  },

  // Profile operations
  getProfile: async (): Promise<UserProfile> => {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            return {
              id: data.id,
              name: data.name || 'Friend',
              email: data.email || user.email || '',
              phone: data.phone,
              dob: data.dob,
              age: data.age,
              gender: data.gender,
              conditions: data.conditions || [],
              commonSymptoms: data.common_symptoms || [],
              dailySpoonsCapacity: data.daily_spoons_capacity || 12,
              dietaryPreferences: data.dietary_preferences || [],
              allergies: data.allergies || [],
              dailyGoals: [],
              notificationPrefs: data.notification_prefs || {
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
              streakDays: data.streak_days || 1,
              xp: data.xp || 50,
              badges: data.badges || [],
              isOnboarded: data.is_onboarded || false,
              isAuthenticated: true,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, fallback to local', err);
      }
    }
    return storageService.getProfile();
  },

  saveProfile: async (profile: UserProfile): Promise<void> => {
    storageService.setProfile(profile);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            dob: profile.dob,
            age: profile.age,
            gender: profile.gender,
            conditions: profile.conditions,
            common_symptoms: profile.commonSymptoms,
            daily_spoons_capacity: profile.dailySpoonsCapacity,
            dietary_preferences: profile.dietaryPreferences,
            allergies: profile.allergies,
            streak_days: profile.streakDays,
            xp: profile.xp,
            badges: profile.badges,
            is_onboarded: profile.isOnboarded,
            notification_prefs: profile.notificationPrefs,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Supabase profile save error', err);
      }
    }
  },

  // Symptoms
  getSymptoms: async (): Promise<SymptomLog[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('symptoms')
          .select('*')
          .order('date', { ascending: false });
        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            date: d.date,
            time: d.time,
            category: d.category,
            name: d.name,
            intensity: d.intensity,
            notes: d.notes,
            tags: d.tags || [],
            triggers: d.triggers || [],
            restPeriods: d.rest_periods,
          }));
        }
      } catch (err) {
        console.warn('Supabase symptoms fetch error', err);
      }
    }
    return storageService.getSymptoms();
  },

  addSymptom: async (symptom: SymptomLog): Promise<void> => {
    storageService.addSymptom(symptom);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('symptoms').insert({
            user_id: user.id,
            date: symptom.date,
            time: symptom.time,
            category: symptom.category,
            name: symptom.name,
            intensity: symptom.intensity,
            notes: symptom.notes,
            tags: symptom.tags,
            triggers: symptom.triggers,
            rest_periods: symptom.restPeriods,
          });
        }
      } catch (err) {
        console.warn('Supabase add symptom error', err);
      }
    }
  },

  deleteSymptom: async (id: string): Promise<void> => {
    storageService.deleteSymptom(id);
    if (supabase) {
      try {
        await supabase.from('symptoms').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete symptom error', err);
      }
    }
  },

  // Emotions
  getEmotions: async (): Promise<EmotionScore[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('emotions')
          .select('*')
          .order('date', { ascending: false });
        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            date: d.date,
            happy: d.happy,
            sad: d.sad,
            calm: d.calm,
            anxious: d.anxious,
            dominantMood: d.dominant_mood,
          }));
        }
      } catch (err) {
        console.warn('Supabase emotions fetch error', err);
      }
    }
    return storageService.getEmotions();
  },

  saveEmotion: async (score: EmotionScore): Promise<void> => {
    storageService.addEmotion(score);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('emotions').upsert({
            user_id: user.id,
            date: score.date,
            happy: score.happy,
            sad: score.sad,
            calm: score.calm,
            anxious: score.anxious,
            dominant_mood: score.dominantMood,
          });
        }
      } catch (err) {
        console.warn('Supabase save emotion error', err);
      }
    }
  },

  // Personal Diary / Journal
  getJournalEntries: async (): Promise<JournalEntry[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('date', { ascending: false });
        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            date: d.date,
            time: d.time,
            title: d.title,
            content: d.content,
            moodRating: d.mood_rating,
            energyRating: d.energy_rating,
            tags: d.tags || [],
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase journal fetch error', err);
      }
    }
    return storageService.getJournalEntries();
  },

  saveJournalEntry: async (entry: JournalEntry): Promise<void> => {
    storageService.saveJournalEntry(entry);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('journal_entries').upsert({
            id: entry.id.startsWith('entry_') ? undefined : entry.id,
            user_id: user.id,
            date: entry.date,
            time: entry.time,
            title: entry.title,
            content: entry.content,
            mood_rating: entry.moodRating,
            energy_rating: entry.energyRating,
            tags: entry.tags,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Supabase save journal error', err);
      }
    }
  },

  deleteJournalEntry: async (id: string): Promise<void> => {
    storageService.deleteJournalEntry(id);
    if (supabase) {
      try {
        await supabase.from('journal_entries').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete journal error', err);
      }
    }
  },

  // Medications
  getMedications: async (): Promise<Medication[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('medications').select('*');
        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            dosage: d.dosage,
            timeSlot: d.time_slot,
            scheduleTimes: d.schedule_times || ['08:00'],
            instructions: d.instructions,
            isAsNeeded: d.is_as_needed,
            category: d.category || 'Prescription',
            currentSupply: d.current_supply,
            refillDate: d.refill_date,
          }));
        }
      } catch (err) {
        console.warn('Supabase medications fetch error', err);
      }
    }
    return storageService.getMedications();
  },

  saveMedication: async (med: Medication): Promise<void> => {
    storageService.saveMedication(med);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('medications').upsert({
            user_id: user.id,
            name: med.name,
            dosage: med.dosage,
            time_slot: med.timeSlot,
            schedule_times: med.scheduleTimes,
            instructions: med.instructions,
            is_as_needed: med.isAsNeeded,
            category: med.category,
            current_supply: med.currentSupply,
            refill_date: med.refillDate,
          });
        }
      } catch (err) {
        console.warn('Supabase save med error', err);
      }
    }
  },

  deleteMedication: async (id: string): Promise<void> => {
    storageService.deleteMedication(id);
    if (supabase) {
      try {
        await supabase.from('medications').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete med error', err);
      }
    }
  },

  // Pacing Tasks
  getPacingTasks: async (): Promise<PacingTask[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('pacing_tasks').select('*');
        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            spoonCost: d.spoon_cost,
            isRestorative: d.is_restorative,
            completed: d.completed,
            date: d.date,
            time: d.time,
          }));
        }
      } catch (err) {
        console.warn('Supabase tasks fetch error', err);
      }
    }
    return storageService.getPacingTasks();
  },

  savePacingTask: async (task: PacingTask): Promise<void> => {
    storageService.savePacingTask(task);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('pacing_tasks').upsert({
            user_id: user.id,
            title: task.title,
            category: task.category,
            spoon_cost: task.spoonCost,
            is_restorative: task.isRestorative,
            completed: task.completed,
            date: task.date,
            time: task.time,
          });
        }
      } catch (err) {
        console.warn('Supabase save task error', err);
      }
    }
  },

  deletePacingTask: async (id: string): Promise<void> => {
    storageService.deletePacingTask(id);
    if (supabase) {
      try {
        await supabase.from('pacing_tasks').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete task error', err);
      }
    }
  },

  // Journal Tasks
  getJournalTasks: async () => {
    return storageService.getJournalTasks();
  },
  saveJournalTask: async (task: any) => {
    storageService.saveJournalTask(task);
  },
  deleteJournalTask: async (id: string) => {
    storageService.deleteJournalTask(id);
  },

  // Daily Activity Tracker
  getActivities: async (): Promise<ActivityEntry[]> => {
    return storageService.getActivities();
  },
  addActivity: async (entry: ActivityEntry): Promise<void> => {
    storageService.addActivity(entry);
  },
  updateActivity: async (entry: ActivityEntry): Promise<void> => {
    storageService.updateActivity(entry);
  },
  toggleActivityComplete: async (id: string): Promise<void> => {
    storageService.toggleActivityComplete(id);
  },
  toggleActivityArchive: async (id: string): Promise<void> => {
    storageService.toggleActivityArchive(id);
  },
  deleteActivity: async (id: string): Promise<void> => {
    storageService.deleteActivity(id);
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    return storageService.getAppointments();
  },
  saveAppointment: async (apt: Appointment): Promise<void> => {
    storageService.saveAppointment(apt);
  },
  deleteAppointment: async (id: string): Promise<void> => {
    storageService.deleteAppointment(id);
  },

  // Medical Documents / Reports (PostgreSQL + Supabase Storage)
  getDocuments: async (): Promise<MedicalDocument[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('medical_reports')
          .select('*')
          .order('date', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            documentType: d.document_type,
            provider: d.provider,
            date: d.date,
            fileName: d.file_name,
            fileSize: d.file_size,
            fileUrl: d.file_url,
            storagePath: d.storage_path,
            mimeType: d.mime_type,
            keyFindings: d.key_findings || [],
            plainLanguageSummary: d.plain_language_summary || '',
            suggestedDoctorQuestions: d.suggested_doctor_questions || [],
            unverified: d.unverified ?? false,
            notes: d.notes,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase documents fetch error, falling back to local storage', err);
      }
    }
    return storageService.getDocuments();
  },

  saveDocument: async (doc: MedicalDocument): Promise<void> => {
    storageService.saveDocument(doc);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('medical_reports').upsert({
            id: doc.id.startsWith('doc_') ? undefined : doc.id,
            user_id: user.id,
            title: doc.title,
            document_type: doc.documentType,
            provider: doc.provider,
            date: doc.date,
            file_name: doc.fileName,
            file_size: doc.fileSize,
            file_url: doc.fileUrl,
            storage_path: doc.storagePath,
            mime_type: doc.mimeType,
            key_findings: doc.keyFindings,
            plain_language_summary: doc.plainLanguageSummary,
            suggested_doctor_questions: doc.suggestedDoctorQuestions,
            unverified: doc.unverified,
            notes: doc.notes,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Supabase save document error', err);
      }
    }
  },

  deleteDocument: async (id: string, storagePath?: string): Promise<void> => {
    storageService.deleteDocument(id);
    if (supabase) {
      try {
        await supabase.from('medical_reports').delete().eq('id', id);
        if (storagePath) {
          await supabase.storage.from('medical_reports').remove([storagePath]);
        }
      } catch (err) {
        console.warn('Supabase delete document error', err);
      }
    }
  },

  // Wellness Sessions (Guided Breathing, Meditation, Mindfulness, Stretching, Rest)
  getWellnessSessions: async (): Promise<WellnessSession[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('wellness_sessions')
          .select('*')
          .order('completed_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            activityType: d.activity_type,
            title: d.title,
            durationMinutes: d.duration_minutes,
            completedAt: d.completed_at,
            date: d.date,
            time: d.time,
            notes: d.notes,
            spoonsRecovered: d.spoons_recovered || 1,
            pattern: d.pattern,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase wellness fetch error, falling back to local', err);
      }
    }
    return storageService.getWellnessSessions();
  },

  saveWellnessSession: async (session: WellnessSession): Promise<void> => {
    storageService.saveWellnessSession(session);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('wellness_sessions').insert({
            user_id: user.id,
            activity_type: session.activityType,
            title: session.title,
            duration_minutes: session.durationMinutes,
            completed_at: session.completedAt || new Date().toISOString(),
            date: session.date,
            time: session.time,
            notes: session.notes,
            spoons_recovered: session.spoonsRecovered,
            pattern: session.pattern,
          });
        }
      } catch (err) {
        console.warn('Supabase save wellness error', err);
      }
    }
  },

  deleteWellnessSession: async (id: string): Promise<void> => {
    storageService.deleteWellnessSession(id);
    if (supabase) {
      try {
        await supabase.from('wellness_sessions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete wellness error', err);
      }
    }
  },

  // Community Posts
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            authorName: d.author_name,
            isAnonymous: false,
            title: d.title,
            content: d.content,
            topic: d.topic,
            tags: d.tags || [],
            timeAgo: 'Recently',
            reactions: d.reactions || { hug: 0, spoon: 0, strength: 0, heart: 0 },
            commentsCount: d.comments_count || 0,
            comments: [],
          }));
        }
      } catch (err) {
        console.warn('Supabase community posts fetch error', err);
      }
    }
    return storageService.getCommunityPosts();
  },

  saveCommunityPost: async (post: CommunityPost): Promise<void> => {
    storageService.addCommunityPost(post);
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('community_posts').insert({
            user_id: user.id,
            author_name: post.authorName,
            title: post.title,
            content: post.content,
            topic: post.topic,
            tags: post.tags,
            reactions: post.reactions,
            comments_count: post.commentsCount,
          });
        }
      } catch (err) {
        console.warn('Supabase save post error', err);
      }
    }
  },

  deleteCommunityPost: async (postId: string): Promise<void> => {
    storageService.deleteCommunityPost(postId);
    if (supabase) {
      try {
        await supabase.from('community_posts').delete().eq('id', postId);
      } catch (err) {
        console.warn('Supabase delete post error', err);
      }
    }
  },

  clearAllCommunityPosts: async (): Promise<void> => {
    storageService.clearAllCommunityPosts();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Deletes posts created by this authenticated user
          await supabase.from('community_posts').delete().eq('user_id', user.id);
        }
      } catch (err) {
        console.warn('Supabase clear posts error', err);
      }
    }
  },

  // Daily Meal Plan
  getDailyMealPlan: async (): Promise<DailyMealPlan | null> => {
    return storageService.getDailyMealPlan();
  },
  saveDailyMealPlan: async (plan: DailyMealPlan): Promise<void> => {
    storageService.saveDailyMealPlan(plan);
  },
};


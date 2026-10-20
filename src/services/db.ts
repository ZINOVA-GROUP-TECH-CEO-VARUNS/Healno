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
};

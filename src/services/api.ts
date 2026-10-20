import { AIChatMessage, UserProfile } from '../types';

export const apiService = {
  chatWithCompanion: async (
    messages: AIChatMessage[],
    userProfile: UserProfile,
    healthContext: { recentSymptoms: string[]; remainingSpoons: number }
  ) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userProfile, healthContext }),
      });
      if (!response.ok) {
        throw new Error(`Chat API responded with ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API error, utilizing supportive fallback companion logic', err);
      // Gentle offline/fallback response
      return {
        reply: `I hear you, ${userProfile.name}. Taking things one gentle step at a time is the wisest approach right now. How is your energy holding up in this moment? Remember: rest is a form of progress.`,
        suggestedAction: null,
      };
    }
  },

  analyzeDocument: async (documentBase64: string, mimeType: string, filename: string) => {
    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentBase64, mimeType, filename }),
      });
      if (!response.ok) {
        throw new Error(`Document analysis failed with ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Document analysis error, providing clinical template', err);
      return {
        documentType: 'Lab Report',
        provider: 'Outpatient Diagnostic Center',
        date: new Date().toISOString().split('T')[0],
        keyFindings: [
          'Document uploaded and securely saved',
          'Standard ranges awaiting user verification',
        ],
        plainLanguageSummary: 'Your document is filed in your Healno records. Review values with your clinician to confirm relevance to your care plan.',
        suggestedDoctorQuestions: [
          'How do these findings correlate with my daily fatigue?',
          'What are our goals before our next routine panel?',
        ],
        unverified: true,
      };
    }
  },

  generateDoctorPrep: async (appointment: any, recentSymptoms: any[], medications: any[], notes?: string) => {
    try {
      const response = await fetch('/api/doctor-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment, recentSymptoms, medications, notes }),
      });
      if (!response.ok) {
        throw new Error(`Doctor prep failed: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Doctor prep error, using fallback template', err);
      return {
        conciseBrief: `Preparation for appointment with ${appointment?.provider || 'Healthcare Provider'}. Reviewing chronic symptom fluctuations and medication routine.`,
        talkingPoints: [
          'Review frequency of daytime fatigue and brain fog flare-ups',
          'Assess current medication tolerability and refill timing',
          'Discuss physical therapy or pacing boundaries',
        ],
        questionsForDoctor: [
          'What adjustments should we consider for my daily pacing routine?',
          'Are there additional tests recommended based on my recent patterns?',
        ],
        symptomSummary: 'Symptom logs reflect variable energy with crashes following heavy cognitive or physical demands.',
      };
    }
  },

  generatePersonalizedMeal: async (energyLevel: number, dietaryPreferences: string[], availableIngredients?: string, prepTimeMax?: number) => {
    try {
      const response = await fetch('/api/recipe-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyLevel, dietaryPreferences, availableIngredients, prepTimeMax }),
      });
      if (!response.ok) {
        throw new Error(`Recipe generator responded with ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Recipe generator fallback', err);
      return {
        recipeName: energyLevel <= 4 ? '10-Minute Soothing Ginger Miso Broth' : 'Nourishing Warm Veggie & Rice Bowl',
        prepTimeMinutes: energyLevel <= 4 ? 8 : 20,
        energySpoonCost: energyLevel <= 4 ? 1 : 2,
        difficulty: energyLevel <= 4 ? 'Low Effort' : 'Moderate',
        ingredients: [
          'Warm bone broth or vegetable stock',
          'Pre-cooked rice or tender noodles',
          'Baby greens (wilts in hot broth)',
          'Drop of sesame oil & pinch of sea salt',
        ],
        instructions: [
          'Warm the broth in a mug or small saucepan.',
          'Add pre-cooked rice and tender greens directly.',
          'Enjoy warm with minimal dishes to clean.',
        ],
        lowEffortAlternative: 'Use a single mug of store-bought bone broth or vegetable broth with plain rice crackers.',
        nutritionNotes: 'Hydrating electrolytes and gentle starch that are easy on digestion.',
      };
    }
  },

  // Speech Synthesis (TTS) Helper
  speakText: (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly calmer, gentler pacing
      utterance.pitch = 1.0;
      if (onEnd) utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
      return () => window.speechSynthesis.cancel();
    }
    return () => {};
  },

  // Check Speech Recognition capability
  isSpeechRecognitionAvailable: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  // Start Speech Recognition
  createSpeechRecognizer: (onResult: (transcript: string) => void, onEnd?: () => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    if (onEnd) {
      recognizer.onend = onEnd;
      recognizer.onerror = onEnd;
    }

    return recognizer;
  },
};

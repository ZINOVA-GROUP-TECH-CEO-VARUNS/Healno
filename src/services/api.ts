import { AIChatMessage, UserProfile } from '../types';

export const apiService = {
  streamChatWithCompanion: async (
    messages: AIChatMessage[],
    userProfile: UserProfile,
    healthContext: {
      recentSymptoms: string[];
      remainingSpoons: number;
      documents?: any[];
      medications?: string[];
      appointments?: string[];
      journalNotes?: string[];
    },
    onChunk: (fullAccumulatedText: string) => void,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userProfile, healthContext }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Chat stream responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is not readable for stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') {
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              fullText += parsed.text;
              onChunk(fullText);
            } else if (parsed.error) {
              console.warn('Stream chunk error:', parsed.error);
            }
          } catch {
            if (payload) {
              fullText += payload;
              onChunk(fullText);
            }
          }
        }
      }

      if (buffer.trim().startsWith('data:')) {
        const payload = buffer.trim().slice(5).trim();
        if (payload && payload !== '[DONE]') {
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              fullText += parsed.text;
              onChunk(fullText);
            }
          } catch {}
        }
      }

      return fullText;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      console.warn('Streaming failed, falling back to unary chat API', err);
      const fallbackResult = await apiService.chatWithCompanion(messages, userProfile, healthContext);
      onChunk(fallbackResult.reply);
      return fallbackResult.reply;
    }
  },

  chatWithCompanion: async (
    messages: AIChatMessage[],
    userProfile: UserProfile,
    healthContext: {
      recentSymptoms: string[];
      remainingSpoons: number;
      documents?: any[];
      medications?: string[];
      appointments?: string[];
      journalNotes?: string[];
    }
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
      console.warn('API error, utilizing fallback natural assistant logic', err);
      const lastUserMsg = (messages && messages[messages.length - 1]?.content) || '';
      return {
        reply: `I hear you and I'm right here with you! Regarding "${lastUserMsg}": I can help with general knowledge, everyday inquiries, science, coding, creative tasks, or your chronic energy pacing. What would you like to explore next?`,
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

  generatePersonalizedMeal: async (energyLevel: number, dietaryPreferences: string[], availableIngredients?: string, prepTimeMax?: number, culinaryStyle?: string) => {
    try {
      const response = await fetch('/api/recipe-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyLevel, dietaryPreferences, availableIngredients, prepTimeMax, culinaryStyle }),
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

  askDocumentQA: async (question: string, document: any, userProfile?: any) => {
    try {
      const response = await fetch('/api/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, document, userProfile }),
      });
      if (!response.ok) {
        throw new Error(`Document Q&A responded with ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Document Q&A fallback', err);
      return {
        answer: `Regarding "${question}": Your ${document?.documentType || 'document'} records key details including: ${(document?.keyFindings || []).join('; ') || 'Results noted'}. Discuss these values with your healthcare provider to understand their clinical meaning.`,
        extractedFacts: document?.keyFindings || [],
        aiInterpretation: "Educational context provided. Verify specific interpretations with your clinician.",
        doctorQuestions: document?.suggestedDoctorQuestions || ["How do these findings impact my current care plan?"]
      };
    }
  },

  generateDailyMealPlan: async (
    energyLevelOrProfile: number | UserProfile,
    dietaryPreferences?: string[] | number,
    allergies?: string[],
    conditions?: string[],
    culinaryStyle?: string
  ) => {
    let energyLevel = 5;
    let prefs: string[] = [];
    let allergyList: string[] = [];
    let conditionList: string[] = [];
    let style = culinaryStyle || 'Indian Style';

    if (typeof energyLevelOrProfile === 'object' && energyLevelOrProfile !== null) {
      const p = energyLevelOrProfile as UserProfile;
      energyLevel = typeof dietaryPreferences === 'number' ? dietaryPreferences : 5;
      prefs = p.dietaryPreferences || [];
      allergyList = p.allergies || [];
      conditionList = p.conditions || [];
    } else {
      energyLevel = typeof energyLevelOrProfile === 'number' ? energyLevelOrProfile : 5;
      prefs = Array.isArray(dietaryPreferences) ? dietaryPreferences : [];
      allergyList = allergies || [];
      conditionList = conditions || [];
    }

    try {
      const response = await fetch('/api/daily-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyLevel, dietaryPreferences: prefs, allergies: allergyList, conditions: conditionList, culinaryStyle: style }),
      });
      if (!response.ok) {
        throw new Error(`Daily meal plan API responded with ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Daily meal plan fallback', err);
      return {
        id: `plan_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        breakfast: {
          id: `bf_${Date.now()}`,
          name: 'Golden Turmeric Oatmeal with Blueberries',
          mealType: 'breakfast',
          spoonCost: 1,
          prepTimeMinutes: 8,
          difficulty: 'Low Effort',
          dietaryTags: ['Anti-inflammatory', 'Soothing'],
          ingredients: ['Rolled oats', 'Almond or oat milk', 'Ground turmeric', 'Blueberries', 'Honey or maple'],
          instructions: ['Cook oats gently with milk and turmeric', 'Stir in sweetener', 'Top with blueberries'],
          lowEffortAlternative: 'Instant oatmeal packet with warm milk.',
          nutritionNotes: 'Calming to the gut and rich in antioxidants.',
          storageGuidance: 'Serve warm.'
        },
        lunch: {
          id: `lu_${Date.now()}`,
          name: 'Gentle Ginger Miso Rice Bowl',
          mealType: 'lunch',
          spoonCost: 1,
          prepTimeMinutes: 10,
          difficulty: 'Low Effort',
          dietaryTags: ['Hydrating', 'Low Effort'],
          ingredients: ['Sweet white miso', 'Warm broth', 'Pre-cooked rice', 'Baby spinach'],
          instructions: ['Dissolve miso in warm broth', 'Fold in warm rice and spinach', 'Rest 1 min'],
          lowEffortAlternative: 'Miso sipping soup with crackers.',
          nutritionNotes: 'Electrolytes and easily digested carbs.',
          storageGuidance: 'Fresh.'
        },
        dinner: {
          id: `di_${Date.now()}`,
          name: 'Warm Sweet Potato & Lentil Stew',
          mealType: 'dinner',
          spoonCost: 1,
          prepTimeMinutes: 15,
          difficulty: 'Low Effort',
          dietaryTags: ['Nourishing', 'Fiber-Rich'],
          ingredients: ['Cooked lentils', 'Coconut milk', 'Roasted sweet potato cubes', 'Mild spices'],
          instructions: ['Heat lentils and sweet potato in coconut milk', 'Simmer 10 mins', 'Serve warm'],
          lowEffortAlternative: 'Canned organic lentil soup.',
          nutritionNotes: 'Potassium and steady complex carbs.',
          storageGuidance: 'Keeps 3 days.'
        },
        snack: {
          id: `sn_${Date.now()}`,
          name: 'Coconut Hydration Chia Cup',
          mealType: 'snack',
          spoonCost: 1,
          prepTimeMinutes: 3,
          difficulty: 'Low Effort',
          dietaryTags: ['Hydrating'],
          ingredients: ['Chia seeds', 'Coconut water', 'Pumpkin seeds'],
          instructions: ['Stir chia into coconut water', 'Rest 5 minutes', 'Top with seeds'],
          lowEffortAlternative: 'Salted pumpkin seeds.',
          nutritionNotes: 'Supports autonomic hydration balance.',
          storageGuidance: 'Chilled.'
        },
        dietaryNotes: 'Designed for energy preservation and anti-inflammatory support.'
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

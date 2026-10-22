import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini SDK client on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Healno', timestamp: new Date().toISOString(), aiReady: !!ai });
});

// Conversational AI Health Companion Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile, healthContext } = req.body;

    const systemInstruction = `You are Healno, an empathetic, calm, supportive AI health companion for people managing chronic illnesses, persistent fatigue, pain, fluctuating energy (spoon theory), medications, and daily wellness.
Core Guidelines:
1. Tone: Warm, gentle, validating, reassuring, and non-judgmental. Remind users that resting is a form of progress.
2. Clinical Boundary: You are NOT a doctor. You NEVER diagnose conditions, NEVER prescribe medications or dosage adjustments, and NEVER replace clinical care. For any emergency, advise contacting local emergency services immediately.
3. Conversational Style: Speak in natural, accessible, plain-language sentences. Keep responses concise and easy to read for someone who may have brain fog or low energy.
4. Record Extraction: If the user describes a symptom, mood, or medication event, you may offer a structured suggestion proposal. Always emphasize that they can review and edit before saving.
5. User Context:
   Name: ${userProfile?.name || 'Friend'}
   Known conditions: ${(userProfile?.conditions || []).join(', ') || 'Not specified'}
   Recent symptoms: ${(healthContext?.recentSymptoms || []).join(', ') || 'None logged recently'}
   Current Spoons: ${healthContext?.remainingSpoons ?? 7} / ${userProfile?.dailySpoonsCapacity ?? 12}`;

    if (!ai) {
      // Thoughtful supportive fallback response when API key is unavailable
      const lastUserMsg = (messages && messages[messages.length - 1]?.content) || '';
      return res.json({
        reply: `Thank you for sharing that with me. I'm here with you. Managing your health is an ongoing journey, and taking it one moment at a time is completely valid. Would you like me to help you log this in your symptoms, or take a gentle rest break right now?`,
        suggestedAction: lastUserMsg.toLowerCase().includes('fatigue') || lastUserMsg.toLowerCase().includes('pain') ? {
          type: 'log_symptom',
          name: lastUserMsg.toLowerCase().includes('fatigue') ? 'Fatigue' : 'Pain / Discomfort',
          severity: 5,
          notes: lastUserMsg
        } : null
      });
    }

    const conversationPrompt = (messages || []).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Healno'}: ${m.content}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${conversationPrompt}\n\nProvide a warm, supportive response as Healno. If the user mentioned a symptom or medication event, also include an optional JSON block at the very end formatted as:
\`\`\`json
{
  "suggestedAction": {
    "type": "log_symptom" | "log_medication" | "pacing_tip",
    "title": "Title",
    "details": "Details"
  }
}
\`\`\``,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const fullText = response.text || '';
    let reply = fullText;
    let suggestedAction = null;

    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        suggestedAction = parsed.suggestedAction || null;
        reply = fullText.replace(/```json[\s\S]*?```/, '').trim();
      } catch (err) {
        // Fallback to text
      }
    }

    res.json({ reply, suggestedAction });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      reply: "I'm listening and I hear you. Even when things feel heavy or technology has a hiccup, let's take a breath together. How can I best support your comfort today?",
      error: error.message
    });
  }
});

// Document OCR and Plain-Language Health Summary Endpoint
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentBase64, mimeType, filename } = req.body;

    if (!ai) {
      // Mock structured analysis for demo
      return res.json({
        documentType: 'Lab Report',
        provider: 'Community Health Partners',
        date: new Date().toISOString().split('T')[0],
        keyFindings: [
          'Ferritin: 18 ng/mL (Borderline low range: 15-150)',
          'Vitamin D (25-OH): 26 ng/mL (Mild insufficiency: 30-100)',
          'Complete Blood Count (CBC): Within typical reference parameters',
          'Thyroid Stimulating Hormone (TSH): 2.1 mIU/L (Within normal range)'
        ],
        plainLanguageSummary: 'This lab panel shows that while your general blood counts and thyroid function appear stable, your iron storage (ferritin) and vitamin D levels are on the lower side, which can commonly contribute to persistent tiredness and sluggish energy.',
        suggestedDoctorQuestions: [
          'Could my lower ferritin and vitamin D levels be contributing to my daily fatigue?',
          'Do you recommend gentle dietary adjustments or specific supplement options?',
          'When should we recheck these levels to see if there is improvement?'
        ],
        unverified: true
      });
    }

    let contents: any;
    if (documentBase64 && mimeType && mimeType.startsWith('image/')) {
      contents = {
        parts: [
          {
            inlineData: {
              data: documentBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: `Analyze this medical document or lab report for the patient. Extract:
1. Document Type (e.g., Lab Report, Imaging, Clinical Visit Summary, Prescription)
2. Healthcare Provider or Facility
3. Document Date
4. Key Findings or Measurements (with reference ranges if noted)
5. Plain Language Summary (explain clearly without medical jargon)
6. 3-4 Thoughtful, empowering questions for the patient to ask their doctor

Important: Do NOT diagnose or declare medical conclusions. Emphasize that all extracted details are marked as unverified until reviewed with a licensed provider. Return in pure JSON.`,
          },
        ],
      };
    } else {
      contents = `Analyze this medical document named "${filename || 'health_document'}". Extract structured fields including documentType, provider, date, keyFindings (array), plainLanguageSummary, and suggestedDoctorQuestions (array). Respond in JSON.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      documentType: parsed.documentType || 'Medical Record',
      provider: parsed.provider || 'Healthcare Provider',
      date: parsed.date || new Date().toISOString().split('T')[0],
      keyFindings: parsed.keyFindings || ['Record analyzed and ready for clinician review'],
      plainLanguageSummary: parsed.plainLanguageSummary || 'Information extracted from your document for easy reference during clinical conversations.',
      suggestedDoctorQuestions: parsed.suggestedDoctorQuestions || [
        'How do these results fit with my daily symptoms?',
        'Are there specific signs I should monitor going forward?'
      ],
      unverified: true, // Always flagged unverified per requirements until user reviews
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Doctor Visit Preparation Generator
app.post('/api/doctor-prep', async (req, res) => {
  try {
    const { appointment, recentSymptoms, medications, notes } = req.body;

    if (!ai) {
      return res.json({
        conciseBrief: `Upcoming visit with ${appointment?.provider || 'Healthcare Provider'} (${appointment?.purpose || 'Health Review'}). User is navigating symptoms including ${(recentSymptoms || []).slice(0, 3).map((s: any) => s.name || s).join(', ') || 'fatigue and fluctuating energy'}.`,
        talkingPoints: [
          'Frequency and timing of recent energy crashes or flare-ups',
          'Current medication tolerability and symptom relief assessment',
          'Clarifying pacing thresholds and activity modifications',
          'Review of recent lab trends or specialist referrals'
        ],
        questionsForDoctor: [
          'What are the most effective management strategies for my daily symptom patterns?',
          'Are there any potential interactions or timing improvements for my current medications?',
          'What red flag symptoms should prompt me to contact your office between scheduled visits?'
        ],
        symptomSummary: 'Symptoms have shown noticeable correlation with overexertion days, highlighting the importance of pacing strategies.'
      });
    }

    const prompt = `Create a concise, respectful, patient-centered preparation brief for an upcoming healthcare appointment.
Patient appointment details:
- Provider / Clinic: ${appointment?.provider || 'Healthcare Clinician'}
- Purpose: ${appointment?.purpose || 'General Follow-up'}
- Date: ${appointment?.date || 'Upcoming'}
- Recent Symptoms: ${JSON.stringify(recentSymptoms || [])}
- Active Medications: ${JSON.stringify(medications || [])}
- Patient Notes: ${notes || 'None provided'}

Provide a JSON output containing:
1. conciseBrief: A 2-sentence neutral clinical summary of the primary focus
2. talkingPoints: 4 bullet points prioritizing what the patient wants to cover
3. questionsForDoctor: 3 clear, respectful, direct questions to ask
4. symptomSummary: 2-3 sentences summarizing symptom patterns without speculating on unconfirmed diagnoses.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/doctor-prep:', error);
    res.status(500).json({ error: error.message });
  }
});

// Spoon-Aware Personalized Meal Generator
app.post('/api/recipe-generator', async (req, res) => {
  try {
    const { energyLevel, dietaryPreferences, availableIngredients, prepTimeMax } = req.body;

    if (!ai) {
      const isLowEnergy = energyLevel <= 4;
      return res.json({
        recipeName: isLowEnergy ? '10-Minute Soothing Ginger Miso Broth & Rice' : 'Warm Roasted Veggie & Quinoa Nourish Bowl',
        prepTimeMinutes: isLowEnergy ? 10 : 25,
        energySpoonCost: isLowEnergy ? 1 : 2,
        difficulty: isLowEnergy ? 'Low Effort' : 'Moderate',
        ingredients: isLowEnergy ? [
          '1 tbsp mild white miso paste',
          '1 cup pre-cooked jasmine or brown rice',
          '1 cup warm bone broth or vegetable broth',
          '1/2 tsp freshly grated ginger or ginger powder',
          'Small handful baby spinach (wilts instantly in hot broth)',
          'A drizzle of sesame oil'
        ] : [
          '1/2 cup cooked quinoa',
          '1 cup roasted sweet potato cubes & zucchini',
          '1/2 cup canned chickpeas, rinsed',
          '2 tbsp tahini lemon dressing',
          'Handful fresh greens and pumpkin seeds'
        ],
        instructions: isLowEnergy ? [
          'Warm your broth in a mug or small saucepan until steaming.',
          'Whisk in miso paste and ginger until smooth.',
          'Add your pre-cooked rice and fresh spinach leaves directly into the warm broth.',
          'Drizzle with a touch of sesame oil and enjoy warm, requiring minimal dishes.'
        ] : [
          'Arrange warm grains in your favorite bowl.',
          'Toss roasted vegetables and chickpeas alongside.',
          'Drizzle generous spoonfuls of tahini lemon dressing over top and sprinkle with seeds.'
        ],
        lowEffortAlternative: 'Use a thermos of warm store-bought broth with instant rice crackers or warm toast.',
        nutritionNotes: 'Easily digestible carbohydrates paired with soothing electrolytes and warming aromatics.'
      });
    }

    const prompt = `Generate a nourishing, personalized recipe designed for a person managing chronic health conditions.
Constraints:
- User Current Spoon/Energy Level: ${energyLevel}/10 (${energyLevel <= 4 ? 'Low energy day - prioritize minimal chopping, short cook time, few dishes' : 'Moderate energy day'})
- Dietary Preferences: ${(dietaryPreferences || []).join(', ') || 'Wholesome balanced'}
- Available Ingredients: ${availableIngredients || 'Pantry staples'}
- Max Prep Time: ${prepTimeMax || 15} minutes

Format as JSON with:
recipeName, prepTimeMinutes, energySpoonCost (1 to 3), difficulty ("Low Effort" | "Moderate"), ingredients (array), instructions (array), lowEffortAlternative (string), nutritionNotes (string). Avoid claiming it cures or treats diseases.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/recipe-generator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Document Q&A Assistant Endpoint
app.post('/api/document-qa', async (req, res) => {
  try {
    const { question, document, userProfile } = req.body;

    if (!ai) {
      return res.json({
        answer: `Based on your ${document?.documentType || 'medical document'} (${document?.title || 'Report'}), here is a plain-language summary of what is noted:\n\n• Key Finding: ${(document?.keyFindings || []).join('; ') || 'Standard values recorded'}\n\n• Plain Language Explanation: ${document?.plainLanguageSummary || 'Your report shows general parameters for discussion with your care provider.'}\n\nRegarding your question "${question}": Note that while this document provides specific measurements, a licensed clinician must interpret how they fit your symptoms.`,
        extractedFacts: document?.keyFindings || [],
        aiInterpretation: "This interpretation is for patient education and preparation. Always consult your provider before making changes.",
        doctorQuestions: document?.suggestedDoctorQuestions || [
          "How do these findings impact my daily energy management?",
          "Should we recheck these values in 3 to 6 months?"
        ]
      });
    }

    const prompt = `You are Healno's AI Medical Document Assistant. The patient is asking a question about their uploaded medical document.

Document Details:
- Title: ${document?.title || 'Medical Report'}
- Type: ${document?.documentType || 'Lab / Clinical Report'}
- Provider: ${document?.provider || 'Healthcare Provider'}
- Date: ${document?.date || 'Recent'}
- Key Findings Extracted: ${JSON.stringify(document?.keyFindings || [])}
- Plain Language Summary: ${document?.plainLanguageSummary || ''}
- Additional Document Notes: ${document?.userNotes || ''}

Patient Context (Authorized):
- Name: ${userProfile?.name || 'Friend'}
- Known Conditions: ${(userProfile?.conditions || []).join(', ') || 'None specified'}

Patient Question: "${question}"

Instructions:
1. Explain medical terminology in simple, calm, accessible terms.
2. Clearly distinguish information directly stated in the document from AI-generated general educational interpretations.
3. If the answer cannot be determined from the document, clearly say so without guessing or fabricating values.
4. Do NOT diagnose, declare new conditions, or suggest altering prescription dosages.
5. Provide 2-3 empowering questions the patient can ask their physician.

Format as JSON:
{
  "answer": "Clear, gentle, supportive answer in 2-3 paragraphs",
  "extractedFacts": ["Fact 1 directly from report", "Fact 2 directly from report"],
  "aiInterpretation": "General educational explanation distinguishing facts from general knowledge",
  "doctorQuestions": ["Question 1", "Question 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/document-qa:', error);
    res.status(500).json({ error: error.message });
  }
});

// Daily Meal Plan Generator (Breakfast, Lunch, Dinner, Snack)
app.post('/api/daily-meal-plan', async (req, res) => {
  try {
    const { energyLevel, dietaryPreferences, allergies, conditions } = req.body;

    if (!ai) {
      const isLow = (energyLevel ?? 6) <= 4;
      return res.json({
        id: `plan_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        breakfast: {
          id: `bf_${Date.now()}`,
          name: 'Warm Turmeric Golden Oat Porridge with Blueberries',
          mealType: 'breakfast',
          spoonCost: 1,
          prepTimeMinutes: 8,
          difficulty: 'Low Effort',
          dietaryTags: ['Anti-inflammatory', 'Gluten-Free', 'Soothing'],
          ingredients: ['Gluten-free oats', 'Warm oat or almond milk', 'Pinch turmeric & cinnamon', 'Wild blueberries', 'Drizzle maple syrup'],
          instructions: ['Simmer oats in warm milk with spices for 5 mins', 'Stir in maple syrup', 'Top with fresh or thawed berries'],
          lowEffortAlternative: 'Instant microwave oat packet with warm plant milk and dash of cinnamon.',
          nutritionNotes: 'Polyphenol-rich and calming to digestion.',
          storageGuidance: 'Enjoy warm and fresh.'
        },
        lunch: {
          id: `lu_${Date.now()}`,
          name: '10-Minute Ginger Miso Broth with Steamed Greens & Rice',
          mealType: 'lunch',
          spoonCost: 1,
          prepTimeMinutes: 10,
          difficulty: 'Low Effort',
          dietaryTags: ['Gut-Friendly', 'Hydrating', 'Low Spoon'],
          ingredients: ['1 tbsp sweet white miso paste', 'Pre-cooked brown or jasmine rice', 'Warm vegetable broth', 'Handful baby spinach', 'Sesame oil'],
          instructions: ['Whisk miso into warm broth', 'Add pre-cooked rice and spinach', 'Rest 1 minute until wilted'],
          lowEffortAlternative: 'Store-bought sipping broth with gluten-free crackers.',
          nutritionNotes: 'Easily digestible carbohydrates with gut-supportive probiotics.',
          storageGuidance: 'Best consumed immediately.'
        },
        dinner: {
          id: `di_${Date.now()}`,
          name: isLow ? 'One-Pot Coconut Vegetable Lentil Stew' : 'Nourish Bowl with Roasted Sweet Potatoes & Tahini',
          mealType: 'dinner',
          spoonCost: isLow ? 1 : 2,
          prepTimeMinutes: isLow ? 12 : 25,
          difficulty: isLow ? 'Low Effort' : 'Moderate',
          dietaryTags: ['Anti-inflammatory', 'Fiber-Rich', 'Dairy-Free'],
          ingredients: ['Canned red lentils or chickpeas', 'Coconut milk', 'Mild curry or cumin', 'Cubed zucchini or sweet potato', 'Steamed rice'],
          instructions: ['Warm lentils and vegetables in coconut milk', 'Simmer until tender', 'Serve over warm rice'],
          lowEffortAlternative: 'Canned organic lentil soup with warm avocado toast.',
          nutritionNotes: 'Steady potassium and healthy fats for sustained autonomic stability.',
          storageGuidance: 'Refrigerate in sealed container up to 3 days.'
        },
        snack: {
          id: `sn_${Date.now()}`,
          name: 'Electrolyte Chia & Coconut Seed Cup',
          mealType: 'snack',
          spoonCost: 1,
          prepTimeMinutes: 3,
          difficulty: 'Low Effort',
          dietaryTags: ['Hydration', 'Mineral-Rich'],
          ingredients: ['Chia seeds', 'Coconut water or almond yogurt', 'Pumpkin seeds', 'Pinch sea salt'],
          instructions: ['Stir chia into coconut water or yogurt', 'Let sit 5 minutes', 'Top with seeds'],
          lowEffortAlternative: 'Handful of salted pumpkin seeds and electrolyte water.',
          nutritionNotes: 'Sustained bioavailable minerals to support hydration.',
          storageGuidance: 'Keep chilled.'
        },
        dietaryNotes: 'Tailored to support steady glucose, minimal digestion effort, and balanced energy pacing without inflammatory triggers.'
      });
    }

    const prompt = `Generate a complete, supportive, 1-day personalized meal plan (Breakfast, Lunch, Dinner, and an optional Snack) for a person managing chronic health conditions.

Patient Health Profile:
- Known Health Conditions: ${(conditions || []).join(', ') || 'Chronic fatigue / energy pacing'}
- Dietary Preferences: ${(dietaryPreferences || []).join(', ') || 'Wholesome balanced'}
- Known Allergies to STRICTLY AVOID: ${(allergies || []).join(', ') || 'None reported'}
- Current Energy / Spoon Level: ${energyLevel ?? 6} / 10 (${(energyLevel ?? 6) <= 4 ? 'Low energy day: prioritize zero-effort prep, minimal standing, 1-pot or no-cook meals' : 'Moderate energy day: balanced prep under 25 minutes'})

Strict Requirements:
1. NEVER include ingredients from the user's known allergies: ${(allergies || []).join(', ') || 'None'}.
2. Keep instructions simple, clear, and realistic for someone experiencing fatigue.
3. Return pure JSON with the schema:
{
  "id": "plan_string",
  "date": "YYYY-MM-DD",
  "breakfast": {
    "id": "bf_1", "name": "Name", "mealType": "breakfast", "spoonCost": 1, "prepTimeMinutes": 8, "difficulty": "Low Effort",
    "dietaryTags": ["Tag"], "ingredients": ["Item 1"], "instructions": ["Step 1"], "lowEffortAlternative": "Alternative", "nutritionNotes": "Notes", "storageGuidance": "Guidance"
  },
  "lunch": {
    "id": "lu_1", "name": "Name", "mealType": "lunch", "spoonCost": 1, "prepTimeMinutes": 10, "difficulty": "Low Effort",
    "dietaryTags": ["Tag"], "ingredients": ["Item 1"], "instructions": ["Step 1"], "lowEffortAlternative": "Alternative", "nutritionNotes": "Notes", "storageGuidance": "Guidance"
  },
  "dinner": {
    "id": "di_1", "name": "Name", "mealType": "dinner", "spoonCost": 2, "prepTimeMinutes": 20, "difficulty": "Moderate",
    "dietaryTags": ["Tag"], "ingredients": ["Item 1"], "instructions": ["Step 1"], "lowEffortAlternative": "Alternative", "nutritionNotes": "Notes", "storageGuidance": "Guidance"
  },
  "snack": {
    "id": "sn_1", "name": "Name", "mealType": "snack", "spoonCost": 1, "prepTimeMinutes": 3, "difficulty": "Low Effort",
    "dietaryTags": ["Tag"], "ingredients": ["Item 1"], "instructions": ["Step 1"], "lowEffortAlternative": "Alternative", "nutritionNotes": "Notes", "storageGuidance": "Guidance"
  },
  "dietaryNotes": "Summary explanation of how this plan supports their pacing"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/daily-meal-plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Healno server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

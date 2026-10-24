import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Healno',
    timestamp: new Date().toISOString(),
    aiReady: !!OPENROUTER_API_KEY,
    provider: 'OpenRouter',
    model: OPENROUTER_MODEL,
  });
});

function getSystemInstruction(userProfile?: any, healthContext?: any) {
  return `You are Healno AI Assistant, a versatile, highly capable, empathetic, and intelligent conversational assistant.

Core Directives:
1. Universal Capabilities: Answer all kinds of user inquiries naturally, thoroughly, and directly—including general knowledge, science, literature, history, coding, creative writing, daily problem-solving, productivity, meals, lifestyle, and health.
2. Context Understanding & Follow-Ups: Deeply understand conversational context and search/analyze any user documents, medical history, reports, or symptom logs provided in the context below.
3. Health & Medical Grounding: When questions touch on health, symptoms, lab reports, or treatments, provide clear, accessible, and compassionate evidence-informed educational information. Always advise consulting a licensed medical professional for personal diagnosis or altering prescription medications.
4. Formatting: Write in clear, well-structured paragraphs with bullet points or numbered lists. Use clean prose without surrounding words in unnecessary asterisks (**).

${userProfile?.name ? `User Name: ${userProfile.name}` : ''}
${userProfile?.conditions?.length ? `User known health profile: ${userProfile.conditions.join(', ')}` : ''}
${healthContext?.remainingSpoons !== undefined ? `Current Energy/Spoons: ${healthContext.remainingSpoons}` : ''}
${healthContext?.recentSymptoms?.length ? `User Symptoms & History:\n- ${healthContext.recentSymptoms.join('\n- ')}` : ''}
${healthContext?.medications?.length ? `Active Medications:\n- ${healthContext.medications.join('\n- ')}` : ''}
${healthContext?.documents?.length ? `Stored Medical Documents & Reports (${healthContext.documents.length}):\n${healthContext.documents.map((d: any) => `• Title: "${d.title}" (${d.type}, Date: ${d.date}, Provider: ${d.provider})\n  Summary: ${d.summary}\n  Findings: ${(d.findings || []).join('; ')}`).join('\n')}` : ''}
${healthContext?.appointments?.length ? `Upcoming Appointments:\n- ${healthContext.appointments.join('\n- ')}` : ''}
${healthContext?.journalNotes?.length ? `Recent Journal Entries:\n- ${healthContext.journalNotes.join('\n- ')}` : ''}`;
}

async function callOpenRouter(messages: any[], systemInstruction?: string, jsonMode = false, signal?: AbortSignal) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured. Please set OPENROUTER_API_KEY in environment variables.');
  }

  const formattedMessages = [];
  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }
  for (const m of messages) {
    formattedMessages.push({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    });
  }

  const payload: any = {
    model: OPENROUTER_MODEL,
    messages: formattedMessages,
    temperature: 0.7,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.APP_URL || 'https://healno-app.example',
      'X-Title': 'Healno AI Assistant',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function streamOpenRouter(messages: any[], systemInstruction: string, onChunk: (text: string) => void, signal?: AbortSignal) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured. Please set OPENROUTER_API_KEY in environment variables.');
  }

  const formattedMessages = [];
  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }
  for (const m of messages) {
    formattedMessages.push({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    });
  }

  const payload = {
    model: OPENROUTER_MODEL,
    messages: formattedMessages,
    temperature: 0.7,
    stream: true,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.APP_URL || 'https://healno-app.example',
      'X-Title': 'Healno AI Assistant',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter stream error (${res.status}): ${errText}`);
  }

  if (!res.body) {
    throw new Error('Response body missing for OpenRouter stream');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
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
      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(dataStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      } catch {}
    }
  }
}

// Fast Streaming AI Chat Assistant Endpoint (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const { messages, userProfile, healthContext } = req.body;
    const systemInstruction = getSystemInstruction(userProfile, healthContext);

    if (!OPENROUTER_API_KEY) {
      const lastUserMsg = (messages && messages[messages.length - 1]?.content) || 'Hello';
      const fallbackReply = `Please configure OPENROUTER_API_KEY in your environment variables. Regarding "${lastUserMsg}": I am ready to assist once connected.`;
      for (const word of fallbackReply.split(' ')) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    await streamOpenRouter(
      messages || [],
      systemInstruction,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      },
      req.socket ? undefined : undefined
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat/stream:', error);
    res.write(`data: ${JSON.stringify({ text: `I'm listening and right here with you. OpenRouter connection note: ${error.message}` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Unary Conversational AI Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile, healthContext } = req.body;
    const systemInstruction = getSystemInstruction(userProfile, healthContext);

    if (!OPENROUTER_API_KEY) {
      return res.status(401).json({ reply: 'OPENROUTER_API_KEY is not configured.', suggestedAction: null });
    }

    const reply = await callOpenRouter(messages || [], systemInstruction);
    res.json({ reply, suggestedAction: null });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      reply: "I'm listening and I'm right here with you. A momentary connection issue occurred with OpenRouter.",
      error: error.message,
    });
  }
});

// Document OCR and Plain-Language Health Summary Endpoint
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentBase64, mimeType, filename } = req.body;

    if (!OPENROUTER_API_KEY) {
      return res.json({
        documentType: 'Lab Report',
        provider: 'Community Health Partners',
        date: new Date().toISOString().split('T')[0],
        keyFindings: ['Document uploaded and saved successfully'],
        plainLanguageSummary: 'Please configure OPENROUTER_API_KEY for automated AI document summarization and OCR analysis.',
        suggestedDoctorQuestions: ['What do these results mean for my daily symptoms?'],
        unverified: true,
      });
    }

    const imageUrl = documentBase64 && documentBase64.startsWith('data:') 
      ? documentBase64 
      : `data:${mimeType || 'image/jpeg'};base64,${documentBase64}`;

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          },
          {
            type: 'text',
            text: `Analyze this medical document or lab report named "${filename || 'health_document'}". Extract structured fields in JSON format with keys: documentType, provider, date, keyFindings (array of strings), plainLanguageSummary, and suggestedDoctorQuestions (array of strings). Do not diagnose. Always mark unverified.`
          }
        ]
      }
    ];

    const responseText = await callOpenRouter(messages, 'You are a precise medical document analysis assistant that returns valid JSON.', true);
    const parsed = JSON.parse(responseText || '{}');

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
      unverified: true,
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

    if (!OPENROUTER_API_KEY) {
      return res.json({
        conciseBrief: `Upcoming visit with ${appointment?.provider || 'Healthcare Provider'} (${appointment?.purpose || 'Health Review'}).`,
        talkingPoints: ['Frequency and timing of recent energy crashes', 'Current medication tolerability'],
        questionsForDoctor: ['What are the most effective management strategies for my daily symptom patterns?'],
        symptomSummary: 'Symptoms show variable energy correlation with exertion.',
      });
    }

    const prompt = `Create a concise, respectful, patient-centered preparation brief for an upcoming healthcare appointment in JSON format.
Patient appointment details:
- Provider / Clinic: ${appointment?.provider || 'Healthcare Clinician'}
- Purpose: ${appointment?.purpose || 'General Follow-up'}
- Date: ${appointment?.date || 'Upcoming'}
- Recent Symptoms: ${JSON.stringify(recentSymptoms || [])}
- Active Medications: ${JSON.stringify(medications || [])}
- Patient Notes: ${notes || 'None provided'}

Provide a JSON object containing:
1. conciseBrief: A 2-sentence neutral clinical summary
2. talkingPoints: 4 bullet points prioritizing what to cover
3. questionsForDoctor: 3 clear, direct questions to ask
4. symptomSummary: 2-3 sentences summarizing symptom patterns.`;

    const responseText = await callOpenRouter([{ role: 'user', content: prompt }], 'You are a clinical preparation assistant that returns valid JSON.', true);
    const parsed = JSON.parse(responseText || '{}');
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

    if (!OPENROUTER_API_KEY) {
      return res.json({
        recipeName: '10-Minute Soothing Ginger Miso Broth & Rice',
        prepTimeMinutes: 10,
        energySpoonCost: 1,
        difficulty: 'Low Effort',
        ingredients: ['1 tbsp white miso paste', '1 cup warm broth', '1 cup cooked rice', 'Fresh ginger', 'Baby spinach'],
        instructions: ['Warm broth, whisk in miso and ginger, add rice and spinach.'],
        lowEffortAlternative: 'Store-bought sipping broth with crackers.',
        nutritionNotes: 'Easily digestible carbohydrates and soothing electrolytes.',
      });
    }

    const prompt = `Generate a nourishing, personalized recipe designed for a person managing chronic health conditions in JSON format.
Constraints:
- User Current Spoon/Energy Level: ${energyLevel}/10
- Dietary Preferences: ${(dietaryPreferences || []).join(', ') || 'Wholesome balanced'}
- Available Ingredients: ${availableIngredients || 'Pantry staples'}
- Max Prep Time: ${prepTimeMax || 15} minutes

Format as JSON with:
recipeName, prepTimeMinutes, energySpoonCost (1 to 3), difficulty ("Low Effort" | "Moderate"), ingredients (array), instructions (array), lowEffortAlternative (string), nutritionNotes (string).`;

    const responseText = await callOpenRouter([{ role: 'user', content: prompt }], 'You are a nutritional assistant that returns valid JSON.', true);
    const parsed = JSON.parse(responseText || '{}');
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

    if (!OPENROUTER_API_KEY) {
      return res.json({
        answer: `Regarding "${question}": Please configure OPENROUTER_API_KEY for advanced document Q&A analysis.`,
        extractedFacts: document?.keyFindings || [],
        aiInterpretation: 'API key unconfigured.',
        doctorQuestions: document?.suggestedDoctorQuestions || ['How do these findings impact my current care plan?']
      });
    }

    const prompt = `You are Healno's AI Medical Document Assistant. The patient is asking a question about their uploaded medical document.

Document Details:
- Title: ${document?.title || 'Medical Report'}
- Type: ${document?.documentType || 'Lab Report'}
- Key Findings Extracted: ${JSON.stringify(document?.keyFindings || [])}
- Plain Language Summary: ${document?.plainLanguageSummary || ''}

Patient Question: "${question}"

Format as JSON:
{
  "answer": "Clear, gentle, supportive answer in 2-3 paragraphs",
  "extractedFacts": ["Fact 1", "Fact 2"],
  "aiInterpretation": "General educational explanation",
  "doctorQuestions": ["Question 1", "Question 2"]
}`;

    const responseText = await callOpenRouter([{ role: 'user', content: prompt }], 'You are a medical document Q&A assistant that returns valid JSON.', true);
    const parsed = JSON.parse(responseText || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/document-qa:', error);
    res.status(500).json({ error: error.message });
  }
});

// Daily Meal Plan Generator
app.post('/api/daily-meal-plan', async (req, res) => {
  try {
    const { energyLevel, dietaryPreferences, allergies, conditions } = req.body;

    if (!OPENROUTER_API_KEY) {
      return res.json({
        id: `plan_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        breakfast: { id: 'bf_1', name: 'Golden Turmeric Oatmeal', mealType: 'breakfast', spoonCost: 1, prepTimeMinutes: 8, difficulty: 'Low Effort', dietaryTags: ['Anti-inflammatory'], ingredients: ['Oats', 'Milk', 'Turmeric'], instructions: ['Simmer oats in milk with turmeric.'], lowEffortAlternative: 'Instant oatmeal packet.', nutritionNotes: 'Calming to digestion.', storageGuidance: 'Serve warm.' },
        lunch: { id: 'lu_1', name: 'Ginger Miso Soup', mealType: 'lunch', spoonCost: 1, prepTimeMinutes: 10, difficulty: 'Low Effort', dietaryTags: ['Gut-Friendly'], ingredients: ['Miso', 'Broth', 'Rice'], instructions: ['Dissolve miso in warm broth.'], lowEffortAlternative: 'Sipping broth.', nutritionNotes: 'Electrolytes.', storageGuidance: 'Fresh.' },
        dinner: { id: 'di_1', name: 'Sweet Potato Lentil Stew', mealType: 'dinner', spoonCost: 1, prepTimeMinutes: 15, difficulty: 'Low Effort', dietaryTags: ['Fiber-Rich'], ingredients: ['Lentils', 'Coconut milk', 'Sweet potato'], instructions: ['Warm ingredients.'], lowEffortAlternative: 'Canned soup.', nutritionNotes: 'Steady carbs.', storageGuidance: 'Keep refrigerated.' },
        snack: { id: 'sn_1', name: 'Chia Coconut Water', mealType: 'snack', spoonCost: 1, prepTimeMinutes: 3, difficulty: 'Low Effort', dietaryTags: ['Hydration'], ingredients: ['Chia', 'Coconut water'], instructions: ['Stir chia in water.'], lowEffortAlternative: 'Salted seeds.', nutritionNotes: 'Hydration.', storageGuidance: 'Chilled.' },
        dietaryNotes: 'Tailored for energy preservation.'
      });
    }

    const prompt = `Generate a complete, supportive, 1-day personalized meal plan (Breakfast, Lunch, Dinner, Snack) in JSON format for a person managing chronic health conditions.
- Conditions: ${(conditions || []).join(', ')}
- Preferences: ${(dietaryPreferences || []).join(', ')}
- Allergies to avoid: ${(allergies || []).join(', ')}
- Energy Level: ${energyLevel ?? 6} / 10

Return pure JSON with schema:
{
  "id": "plan_1",
  "date": "YYYY-MM-DD",
  "breakfast": { "id": "bf_1", "name": "...", "mealType": "breakfast", "spoonCost": 1, "prepTimeMinutes": 8, "difficulty": "Low Effort", "dietaryTags": [], "ingredients": [], "instructions": [], "lowEffortAlternative": "...", "nutritionNotes": "...", "storageGuidance": "..." },
  "lunch": { "id": "lu_1", "name": "...", "mealType": "lunch", "spoonCost": 1, "prepTimeMinutes": 10, "difficulty": "Low Effort", "dietaryTags": [], "ingredients": [], "instructions": [], "lowEffortAlternative": "...", "nutritionNotes": "...", "storageGuidance": "..." },
  "dinner": { "id": "di_1", "name": "...", "mealType": "dinner", "spoonCost": 2, "prepTimeMinutes": 20, "difficulty": "Moderate", "dietaryTags": [], "ingredients": [], "instructions": [], "lowEffortAlternative": "...", "nutritionNotes": "...", "storageGuidance": "..." },
  "snack": { "id": "sn_1", "name": "...", "mealType": "snack", "spoonCost": 1, "prepTimeMinutes": 3, "difficulty": "Low Effort", "dietaryTags": [], "ingredients": [], "instructions": [], "lowEffortAlternative": "...", "nutritionNotes": "...", "storageGuidance": "..." },
  "dietaryNotes": "..."
}`;

    const responseText = await callOpenRouter([{ role: 'user', content: prompt }], 'You are a meal planning assistant that returns valid JSON.', true);
    const parsed = JSON.parse(responseText || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/daily-meal-plan:', error);
    res.status(500).json({ error: error.message });
  }
});

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
    console.log(`🌿 Healno server listening on http://0.0.0.0:${PORT} (Provider: OpenRouter, Model: ${OPENROUTER_MODEL})`);
  });
}

startServer();

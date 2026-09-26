import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  generateSmartKnowledgeAnswer, 
  generateFallbackQuiz, 
  generateFallbackSummary 
} from './server/knowledgeFallback';

dotenv.config();
const PORT = parseInt(process.env.PORT || '3000', 10);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return null;
      }
      try {
        aiClient = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Could not initialize GoogleGenAI client:', err);
        return null;
      }
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Helper to extract JSON from raw markdown or clean string
  function cleanAndParseJSON(raw: string) {
    if (!raw || typeof raw !== 'string') return null;
    let text = raw.trim();
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch && fenceMatch[1]) {
      text = fenceMatch[1].trim();
    }
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  // AI Chatbot endpoint for Students & Trainees
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history, courseContext } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const trimmedMessage = message.trim();

    try {
      const ai = getGenAI();

      if (ai) {
        let contextDetails = '';
        if (courseContext && courseContext.title) {
          contextDetails = `\nActive Learning Context:
- Course Title: ${courseContext.title}
- Category: ${courseContext.category || 'General'}
- Description: ${courseContext.description || 'N/A'}`;
        }

        const systemInstruction = `You are an expert, highly engaging, and adaptive AI Academic Tutor on the Smart Education platform.

Core Teaching Guidelines:
1. Direct & Natural: Answer the user's question directly in sentence 1. Avoid rigid executive headers or unnecessary preambles.
2. Conceptual Depth & Pedagogy: Provide clear, well-explained answers using real-life examples, step-by-step logic, or intuitive analogies. Point out common student mistakes when relevant.
3. Multilingual Adaptability: Respond natively in the language/dialect used by the user (Hindi, Hinglish, or English).
4. Code & Math Formatting: Use markdown code blocks for programming snippets (specify the language) and clean formatting for mathematical equations.
5. Active Learning: End responses with a practical check or relevant follow-up question to keep the student engaged.${contextDetails}`;

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        // Build conversation history
        if (Array.isArray(history) && history.length > 0) {
          const relevantHistory = history.slice(-8);
          for (const item of relevantHistory) {
            if ((item.role === 'user' || item.role === 'model') && typeof item.content === 'string' && item.content.trim()) {
              contents.push({
                role: item.role,
                parts: [{ text: item.content.trim() }],
              });
            }
          }
        }

        // Append current prompt
        contents.push({
          role: 'user',
          parts: [{ text: trimmedMessage }],
        });

        // Generate content using official gemini-2.5-flash model
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              tools: [{ googleSearch: {} }],
            },
          });
        } catch (searchToolError) {
          // Fallback if search grounding tool is disabled or fails
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
            },
          });
        }

        if (response && response.text && response.text.trim()) {
          const reply = response.text.trim();

          // Extract grounding sources if provided by Search
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const sources: Array<{ title: string; url: string }> = [];
          if (Array.isArray(groundingChunks)) {
            for (const chunk of groundingChunks) {
              if (chunk?.web?.uri) {
                sources.push({
                  title: chunk.web.title || chunk.web.uri,
                  url: chunk.web.uri,
                });
              }
            }
          }

          return res.json({ reply, sources });
        }
      }
    } catch (genErr) {
      console.warn('Gemini online call exception, using knowledge fallback:', genErr);
    }

    // Knowledge Base Fallback
    const fallbackAnswer = generateSmartKnowledgeAnswer(trimmedMessage, courseContext);
    return res.json({
      reply: fallbackAnswer.reply,
      sources: fallbackAnswer.sources || [
        { title: 'Smart Academic Knowledge Base', url: 'https://smarteducation.internal' },
      ],
    });
  });

  // AI Interactive Quiz Generator
  app.post('/api/ai/generate-quiz', async (req, res) => {
    const { topic, difficulty = 'Intermediate', count = 3 } = req.body;
    const safeTopic = (topic && typeof topic === 'string' && topic.trim()) ? topic.trim() : 'Computer Science Fundamentals';

    try {
      const ai = getGenAI();
      if (ai) {
        const prompt = `You are an expert educational examiner. Generate an interactive practice quiz on "${safeTopic}" at ${difficulty} level.
Generate exactly ${Math.min(Math.max(Number(count) || 3, 2), 5)} multiple choice questions.
Return strictly valid JSON matching this schema:
{
  "title": "Quiz: ${safeTopic}",
  "topic": "${safeTopic}",
  "durationMinutes": 5,
  "xpReward": 60,
  "questions": [
    {
      "id": "q_1",
      "text": "Clear question text?",
      "options": [
        {"id": "o1", "text": "Option A"},
        {"id": "o2", "text": "Option B"},
        {"id": "o3", "text": "Option C"},
        {"id": "o4", "text": "Option D"}
      ],
      "correctOptionId": "o1",
      "hint": "A helpful hint to think about",
      "explanation": "Detailed explanation of why this answer is correct."
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = cleanAndParseJSON(response.text || '');
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Quiz generation failed, using fallback:', err);
    }

    const fallbackQuiz = generateFallbackQuiz(safeTopic, difficulty, count);
    return res.json(fallbackQuiz);
  });

  // AI Topic Summarizer
  app.post('/api/ai/summarize-topic', async (req, res) => {
    const { topic } = req.body;
    const safeTopic = (topic && typeof topic === 'string' && topic.trim()) ? topic.trim() : 'Core Academic Topic';

    try {
      const ai = getGenAI();
      if (ai) {
        const prompt = `Produce a structured study summary on "${safeTopic}".
Return strictly valid JSON matching this format:
{
  "title": "Core Summary: ${safeTopic}",
  "overview": "Clear 2-3 sentence overview definition.",
  "keyTakeaways": [
    "Key concept 1",
    "Key concept 2",
    "Key concept 3"
  ],
  "stepByStepGuide": [
    "Step 1: Description",
    "Step 2: Description"
  ],
  "commonPitfalls": [
    "Common mistake to avoid"
  ],
  "quickQuizQuestion": {
    "question": "A quick practice question?",
    "answer": "Correct answer and short explanation"
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = cleanAndParseJSON(response.text || '');
        if (parsed && parsed.overview && Array.isArray(parsed.keyTakeaways)) {
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Summarizer generation failed, using fallback:', err);
    }

    const fallbackSummary = generateFallbackSummary(safeTopic);
    return res.json(fallbackSummary);
  });

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
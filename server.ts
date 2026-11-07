import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 11000,
      retryOptions: {
        attempts: 1,
      },
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractReadableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      return String(parsed.error.message);
    }
  } catch {
    // Not JSON, keep raw
  }
  return raw;
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    responseSchema: Record<string, unknown>;
  }
) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: unknown;

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    const modelName = modelsToTry[attempt];
    const t0 = Date.now();
    try {
      const config: Record<string, unknown> = {
        systemInstruction: params.systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: params.responseSchema,
      };
      if (modelName === 'gemini-3.8-flash') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config,
      });
      console.log(`[AI] Success with ${modelName} in ${Date.now() - t0}ms`);
      return response;
    } catch (err) {
      lastError = err;
      const msg = extractReadableError(err).toLowerCase();
      console.warn(`[AI] Attempt ${attempt + 1} (${modelName}) failed in ${Date.now() - t0}ms: ${msg}`);
      const isTransient =
        msg.includes('503') ||
        msg.includes('504') ||
        msg.includes('500') ||
        msg.includes('unavailable') ||
        msg.includes('high demand') ||
        msg.includes('deadline') ||
        msg.includes('429') ||
        msg.includes('resource_exhausted') ||
        msg.includes('timeout') ||
        msg.includes('abort');

      if (!isTransient || attempt === modelsToTry.length - 1) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  throw lastError;
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [hRaw, mRaw] = timeStr.split(':').map(Number);
  const startTotal = ((Number.isFinite(hRaw) ? hRaw : 18) * 60 + (Number.isFinite(mRaw) ? mRaw : 30));
  const endTotal = (startTotal + minutesToAdd) % (24 * 60);
  const h = Math.floor(endTotal / 60).toString().padStart(2, '0');
  const m = (endTotal % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // 1. Ask targeted follow-up questions about tonight's courses & tasks
  app.post('/api/ai/evening-questions', async (req: Request, res: Response) => {
    try {
      const { subjects = [], customNote = '', pendingTasks = [], currentTime = '18:00' } = req.body || {};

      const ai = getGenAI();
      const subjectsList = Array.isArray(subjects) && subjects.length > 0
        ? subjects.join(', ')
        : 'Révisions générales';

      const tasksContext = Array.isArray(pendingTasks) && pendingTasks.length > 0
        ? `Tâches restantes aujourd'hui : ${pendingTasks.join(', ')}.`
        : 'Aucune tâche annexe en attente.';

      const prompt = `L'utilisateur est un étudiant qui veut planifier son emploi du temps de ce soir (il est actuellement ${currentTime}).
Matières / cours sélectionnés pour ce soir : ${subjectsList}.
Précision de l'utilisateur : ${customNote || 'Aucune précision supplémentaire'}.
${tasksContext}

Pose exactement 3 questions courtes, claires et personnalisées en français pour pouvoir construire son mini emploi du temps optimal de la soirée :
1. Une question sur sa plage horaire disponible ce soir (heure de début et durée/heure de fin souhaitée).
2. Une question sur la priorité ou la difficulté parmi ses matières (${subjectsList}) (par ex. examen demain, exercices à rendre, cours à relire).
3. Une question sur son rythme de travail préféré ce soir et s'il souhaite intégrer ses tâches du jour ou des pauses (ex: blocs de 45m + pauses, sprints 25m, etc.).

Pour chaque question, fournis 3 à 4 options rapides cliquables (suggestedOptions) très courtes (max 4 mots par option) adaptées à ses matières.`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es un coach académique et assistant d'organisation bienveillant et concis. Tu parles toujours en français naturel, tutoiement amical, phrases courtes adaptées à un écran de smartphone.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: {
              type: Type.STRING,
              description: 'Une courte phrase chaleureuse en français mentionnant les matières choisies.',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  placeholder: { type: Type.STRING },
                  suggestedOptions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'question', 'placeholder', 'suggestedOptions'],
              },
            },
          },
          required: ['greeting', 'questions'],
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error) {
      const message = extractReadableError(error);
      res.status(500).json({ error: message });
    }
  });

  // 2. Generate the structured evening mini-schedule based on subjects, answers, and daily tasks
  app.post('/api/ai/generate-evening-schedule', async (req: Request, res: Response) => {
    try {
      const {
        subjects = [],
        customNote = '',
        answers = [],
        pendingTasks = [],
        currentTime = '18:30',
      } = req.body || {};

      const ai = getGenAI();

      const subjectsText = Array.isArray(subjects) && subjects.length > 0
        ? subjects.join(', ')
        : 'Révisions';

      const answersText = Array.isArray(answers)
        ? answers
            .map((a: { question?: string; answer?: string }) => `- ${a.question ?? 'Question'} -> ${a.answer ?? ''}`)
            .join('\n')
        : '';

      const tasksText = Array.isArray(pendingTasks) && pendingTasks.length > 0
        ? pendingTasks
            .map((t: { title?: string; estimatedMinutes?: number }) => `- ${t.title} (${t.estimatedMinutes ?? 30} min)`)
            .join('\n')
        : 'Aucune tâche annexe.';

      const prompt = `Génère un mini emploi du temps réaliste, équilibré et structuré pour la soirée de l'utilisateur (heure actuelle : ${currentTime}).

Matières à travailler ce soir : ${subjectsText}
Précisions : ${customNote || 'Aucune'}

Réponses de l'utilisateur aux questions :
${answersText}

Tâches du jour disponibles dans son application :
${tasksText}

Consignes strictes :
- Crée entre 4 et 6 blocs ordonnés chronologiquement pour la soirée (incluant les matières demandées, d'éventuelles tâches pertinentes si demandé, et au moins 1 courte pause de recharge de 10-15 min).
- Chaque bloc doit avoir un titre clair en français (ex: "Mathématiques : Exercices & Annales"), un nom court de matière/type (subject), une durée réaliste en minutes (entre 10 et 90), une catégorie parmi ('study', 'work', 'break', 'personal', 'admin', 'health'), un itemType parmi ('course', 'task', 'break'), et un court conseil d'efficacité (tip).
- Assure-toi que les horaires startTime et endTime (format HH:MM 24h) s'enchaînent logiquement sans chevauchement à partir de eveningStartTime.
- Dans aiRationale, explique brièvement (1 à 2 phrases) pourquoi tu as choisi cet ordre et demande à l'utilisateur si cet ordre lui convient.`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es un assistant IA expert en planification de soirée étudiante et gestion du temps. Réponds uniquement en JSON valide selon le schéma demandé, en français.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryTitle: {
              type: Type.STRING,
              description: 'Titre court du programme de soirée en français.',
            },
            aiRationale: {
              type: Type.STRING,
              description: "1-2 phrases expliquant l'ordre proposé et demandant s'il convient.",
            },
            eveningStartTime: {
              type: Type.STRING,
              description: 'Heure de début au format HH:MM (24h), ex: 19:00',
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  itemType: { type: Type.STRING },
                  tip: { type: Type.STRING },
                },
                required: [
                  'id',
                  'title',
                  'subject',
                  'startTime',
                  'endTime',
                  'durationMinutes',
                  'category',
                  'itemType',
                  'tip',
                ],
              },
            },
          },
          required: ['summaryTitle', 'aiRationale', 'eveningStartTime', 'schedule'],
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      const allowedCategories = new Set(['work', 'study', 'health', 'personal', 'admin', 'break']);
      const allowedTypes = new Set(['course', 'task', 'break']);

      let cursorTime = typeof parsed.eveningStartTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.eveningStartTime)
        ? parsed.eveningStartTime
        : '18:00';

      const eveningStartTime = cursorTime;
      const rawSchedule = Array.isArray(parsed.schedule) ? parsed.schedule : [];

      const normalizedSchedule = rawSchedule.map((item: Record<string, unknown>, idx: number) => {
        const duration = Math.min(120, Math.max(10, Number(item.durationMinutes) || 30));
        const startTime = cursorTime;
        const endTime = addMinutesToTime(startTime, duration);
        cursorTime = endTime;

        const rawCat = String(item.category || 'study');
        const category = allowedCategories.has(rawCat) ? rawCat : 'study';
        const rawType = String(item.itemType || (category === 'break' ? 'break' : 'course'));
        const itemType = allowedTypes.has(rawType) ? rawType : 'course';

        return {
          id: `ai_ev_${Date.now()}_${idx}`,
          title: String(item.title || `Session ${idx + 1}`),
          subject: String(item.subject || 'Cours'),
          startTime,
          endTime,
          durationMinutes: duration,
          category,
          itemType,
          tip: String(item.tip || 'Reste concentré sans distractions.'),
        };
      });

      res.json({
        summaryTitle: String(parsed.summaryTitle || 'Programme de Soirée IA'),
        aiRationale: String(
          parsed.aiRationale ||
            "J'ai organisé tes matières par ordre de priorité avec une pause de récupération. Est-ce que cet ordre te convient ?"
        ),
        eveningStartTime,
        schedule: normalizedSchedule,
      });
    } catch (error) {
      const message = extractReadableError(error);
      res.status(500).json({ error: message });
    }
  });

  // 3. Transcribe voice input from the Liquid Glass waveform bar
  app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body || {};
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        res.status(400).json({ error: 'Audio manquant.' });
        return;
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: String(mimeType),
                data: audioBase64,
              },
            },
            {
              text: "Transcris précisément en français ce que l'étudiant dit concernant ses matières, cours ou tâches à travailler ce soir.",
            },
          ],
        },
      });

      res.json({ text: (response.text ?? '').trim() });
    } catch (error) {
      const message = extractReadableError(error);
      res.status(500).json({ error: message });
    }
  });

  // 4. Interactive Voice Command -> AI Interpretation & Schedule Generation
  app.post('/api/ai/voice-schedule', async (req: Request, res: Response) => {
    try {
      const {
        audioBase64,
        mimeType = 'audio/webm',
        voiceText = '',
        currentTime = '18:00',
        pendingTasks = [],
      } = req.body || {};

      let spokenText = (typeof voiceText === 'string' ? voiceText : '').trim();
      const ai = getGenAI();

      // Transcribe audio if text wasn't provided or empty
      if (!spokenText && audioBase64 && typeof audioBase64 === 'string') {
        try {
          const transcribeRes = await ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: String(mimeType),
                    data: audioBase64,
                  },
                },
                {
                  text: "Transcris mot pour mot et précisément en français la commande vocale de l'étudiant décrivant ce qu'il veut faire ou réviser ce soir.",
                },
              ],
            },
          });
          spokenText = (transcribeRes.text ?? '').trim();
        } catch (transcribeErr) {
          console.warn('[AI Voice] Transcribe warning:', extractReadableError(transcribeErr));
        }
      }

      if (!spokenText) {
        res.status(400).json({
          error: "Aucun son ou texte n'a été reconnu. Clique sur la capsule et décris ce que tu souhaites faire ce soir.",
        });
        return;
      }

      const tasksText = Array.isArray(pendingTasks) && pendingTasks.length > 0
        ? pendingTasks
            .map((t: { title?: string; estimatedMinutes?: number }) => `- ${t.title} (${t.estimatedMinutes ?? 30} min)`)
            .join('\n')
        : 'Aucune tâche annexe.';

      const prompt = `Voici la commande vocale dictée par l'étudiant pour planifier son emploi du temps de soirée (heure actuelle : ${currentTime}) :
"${spokenText}"

Tâches du jour disponibles :
${tasksText}

Consignes strictes d'interprétation IA :
1. Déduis précisément les matières et chapitres évoqués (ex: "Math : Équation différentielle", "Aéro : Avionique binaire", "Aéro : Mécanique", etc.).
2. Si des heures ou durées sont dites (ex: "commence à 18h", "1 heure de maths", "finir à 21h30"), applique-les. Par défaut, prévois des blocs de 30 à 60 minutes.
3. Intègre au moins 1 pause de recharge de 10 à 15 minutes si la session totale dépasse 1h15.
4. Crée entre 3 et 6 blocs chronologiques s'enchaînant sans chevauchement.
5. Dans aiRationale, résume chaleureusement en 1-2 phrases ce que tu as compris de sa commande vocale et demande-lui si l'ordre proposé lui convient.`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        systemInstruction:
          "Tu es un assistant IA expert en compréhension de commande vocale et création d'emploi du temps de soirée pour étudiant. Réponds en JSON valide selon le schéma fourni.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedSummary: {
              type: Type.STRING,
              description: "Résumé clair de ce qui a été compris dans l'instruction vocale.",
            },
            summaryTitle: {
              type: Type.STRING,
              description: 'Titre court en français pour la soirée.',
            },
            aiRationale: {
              type: Type.STRING,
              description: "1-2 phrases expliquant l'ordre créé à partir de la commande vocale et demandant si cet ordre convient.",
            },
            eveningStartTime: {
              type: Type.STRING,
              description: 'Heure de début au format HH:MM (24h), ex: 18:00',
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  itemType: { type: Type.STRING },
                  tip: { type: Type.STRING },
                },
                required: [
                  'id',
                  'title',
                  'subject',
                  'startTime',
                  'endTime',
                  'durationMinutes',
                  'category',
                  'itemType',
                  'tip',
                ],
              },
            },
          },
          required: ['summaryTitle', 'aiRationale', 'eveningStartTime', 'schedule'],
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      const allowedCategories = new Set(['work', 'study', 'health', 'personal', 'admin', 'break']);
      const allowedTypes = new Set(['course', 'task', 'break']);

      let cursorTime = typeof parsed.eveningStartTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.eveningStartTime)
        ? parsed.eveningStartTime
        : '18:00';

      const eveningStartTime = cursorTime;
      const rawSchedule = Array.isArray(parsed.schedule) ? parsed.schedule : [];

      const normalizedSchedule = rawSchedule.map((item: Record<string, unknown>, idx: number) => {
        const duration = Math.min(120, Math.max(10, Number(item.durationMinutes) || 30));
        const startTime = cursorTime;
        const endTime = addMinutesToTime(startTime, duration);
        cursorTime = endTime;

        const rawCat = String(item.category || 'study');
        const category = allowedCategories.has(rawCat) ? rawCat : 'study';
        const rawType = String(item.itemType || (category === 'break' ? 'break' : 'course'));
        const itemType = allowedTypes.has(rawType) ? rawType : 'course';

        return {
          id: `ai_voice_${Date.now()}_${idx}`,
          title: String(item.title || `Session ${idx + 1}`),
          subject: String(item.subject || 'Cours'),
          startTime,
          endTime,
          durationMinutes: duration,
          category,
          itemType,
          tip: String(item.tip || 'Planifié via commande vocale IA.'),
        };
      });

      res.json({
        transcribedText: spokenText,
        transcribedSummary: parsed.transcribedSummary || spokenText,
        summaryTitle: String(parsed.summaryTitle || 'Planning vocal généré'),
        aiRationale: String(
          parsed.aiRationale ||
            `J'ai interprété ta commande vocale ("${spokenText}"). Est-ce que cet ordre te convient ?`
        ),
        eveningStartTime,
        schedule: normalizedSchedule,
      });
    } catch (error) {
      const message = extractReadableError(error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chronos server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

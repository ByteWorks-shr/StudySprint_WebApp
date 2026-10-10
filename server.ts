import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Allowed models according to guidelines
const VALID_CHAT_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
];

// Multi-turn Gemini Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const selectedModel = VALID_CHAT_MODELS.includes(model)
      ? model
      : 'gemini-3.5-flash';

    // Format messages for @google/genai generateContent
    // role must be 'user' or 'model'
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are StudySprint AI, an elite academic mentor and expert tutor for SBTE Bihar Diploma in Computer Science & Engineering (5th Semester). You specialize in Java Programming, Software Engineering, Computer Networks, Python, and Cloud Computing. You explain concepts with clear definitions, diagrams, code examples, numerical steps, and structured 4-mark/6-mark answers tailored for State Board of Technical Education (SBTE) Bihar examinations. You can communicate in clear English and Hinglish as preferred by students.',
      },
    });

    res.json({
      reply: response.text || 'No response generated.',
      modelUsed: selectedModel,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate chat response',
    });
  }
});

// Audio transcription endpoint using gemini-3.5-transcribe
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 string is required' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: cleanBase64,
          },
        },
        'Transcribe the audio accurately into clear text. Do not add conversational commentary, just return the transcription.',
      ],
    });

    const transcript = response.text?.trim() || '';

    res.json({
      transcript,
      modelUsed: 'gemini-3.5-transcribe',
    });
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({
      error: err.message || 'Failed to transcribe audio',
    });
  }
});

// Smart Study Plan generator endpoint
app.post('/api/gemini/study-plan', async (req, res) => {
  try {
    const {
      subjects,
      topics,
      examDate,
      dailyHours,
      goal,
      currentKnowledgeLevel,
    } = req.body;

    const prompt = `Create a structured, personalized study schedule for a student.
Parameters:
- Subjects: ${JSON.stringify(subjects || ['General Studies'])}
- Topics to cover: ${JSON.stringify(topics || [])}
- Target Exam / Deadline Date: ${examDate || 'Next 30 days'}
- Available Daily Study Time: ${dailyHours || 3} hours/day
- Student Goal: ${goal || 'Achieve high score and deep mastery'}
- Knowledge Level: ${currentKnowledgeLevel || 'Intermediate'}

Create a realistic day-by-day plan with prioritized study sessions, specific focus areas, active recall intervals, and rest/revision slots.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert curriculum designer and learning psychologist. Return a valid JSON study plan.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            dailyTargetMinutes: { type: Type.INTEGER },
            strategyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dateOffsetDays: { type: Type.INTEGER },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  studyTechnique: { type: Type.STRING },
                },
                required: ['dayNumber', 'subject', 'topic', 'durationMinutes', 'priority'],
              },
            },
          },
          required: ['title', 'summary', 'sessions', 'strategyTips'],
        },
      },
    });

    const parsedPlan = JSON.parse(response.text || '{}');
    res.json({ plan: parsedPlan });
  } catch (err: any) {
    console.error('Study plan error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate study plan',
    });
  }
});

// PDF Analysis / Q&A / Summary endpoint
app.post('/api/gemini/analyze-pdf', async (req, res) => {
  try {
    const { title, textSnippet, query, action } = req.body;

    let prompt = '';
    if (action === 'summary') {
      prompt = `Provide a concise executive summary and key takeaways for this study document titled "${title}":\n\n${textSnippet}`;
    } else if (action === 'flashcards') {
      prompt = `Generate 5 high-yield question & answer flashcard pairs based on this material from "${title}":\n\n${textSnippet}`;
    } else if (action === 'quiz') {
      prompt = `Create a 3-question multiple-choice practice quiz with correct answers and explanations based on this material from "${title}":\n\n${textSnippet}`;
    } else {
      prompt = `Based on the following study document titled "${title}", answer the student's question accurately.\nQuestion: ${query}\n\nDocument Context:\n${textSnippet}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a high-level academic tutor helping a student deeply understand their uploaded PDF study materials.',
      },
    });

    res.json({ result: response.text || '' });
  } catch (err: any) {
    console.error('PDF Analysis error:', err);
    res.status(500).json({
      error: err.message || 'Failed to analyze PDF content',
    });
  }
});

// -------------------------------------------------------------
// AI SYLLABUS EXPLAINER & CURRICULUM SMART PLANNER ENDPOINTS
// -------------------------------------------------------------

async function generateContentWithFallback(params: any) {
  try {
    return await ai.models.generateContent({
      ...params,
      model: params.model || 'gemini-3.8-flash',
    });
  } catch (err: any) {
    const errMsg = String(err?.message || '');
    if (
      errMsg.includes('503') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('high demand') ||
      errMsg.includes('not found')
    ) {
      console.warn('Primary model temporarily overloaded, falling back to gemini-3.5-flash:', errMsg);
      return await ai.models.generateContent({
        ...params,
        model: 'gemini-3.5-flash',
      });
    }
    throw err;
  }
}

// 1. Comprehensive Syllabus Analysis Endpoint
app.post('/api/gemini/analyze-syllabus', async (req, res) => {
  try {
    const { extractedText, metadata } = req.body;

    if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Valid extractedText from syllabus document is required' });
    }

    // Limit text to ~50k chars for optimal prompt token bounds while preserving rich syllabus content
    const sanitizedText = extractedText.slice(0, 50000);

    const systemPrompt = `You are StudySprint's Lead Curriculum Pedagogical Architect and AI Syllabus Explainer.
Your mission is to analyze official college and diploma/polytechnic syllabus documents (e.g., SBTE Bihar, MSBTE, AICTE Model Curriculum, VTU, BTEUP, Anna University, State Technical Boards, etc.) and convert complex academic documents into an actionable, student-friendly learning roadmap.

Students (especially first-year and diploma students) often struggle to understand technical syllabus documents, course outcomes, unit-wise topics, practical subjects, term work, micro-projects, assignments, and examination requirements.

Analyze the provided syllabus document text thoroughly.
Extract and organize:
1. Course and program information (Degree, Diploma, Branch, Semester, Academic Year, University/Board).
2. Semester overview: What will the student learn this semester and why does it matter?
3. Subjects (Names, Codes, Credits, Teaching Hours, Theory/Practical classification).
   - For EACH subject: Overview in simple student language, why it's important, key learnings, prerequisites, suggested sequence, beginner hurdles, revision checklist.
   - For EACH unit: Unit number, title, simple overview (both English and Hindi/Hinglish with technical words intact), estimated hours.
   - For EACH topic: Simple explanation in English AND Hindi, key technical terms with simple definitions, real-world everyday/industry example, 2-3 practice questions (2-mark / 4-mark / 6-mark / MCQ), importance level.
4. Practicals and Laboratory Work:
   - Extract the laboratory experiments actually listed in the syllabus.
   - Objective, pre-lab concepts/skills required, required tools/software (if specified), prep checklist, compulsory status.
5. Term Work:
   - Components, journals, assignments, submission guidelines, marks if mentioned or "Not specified in the uploaded syllabus".
6. Academic Micro-Projects:
   - Official requirements from syllabus, 5 milestone stages (Topic Selection, Planning, Implementation, Testing, Report & Viva).
   - 3 syllabus-relevant creative project suggestions (clearly marked as AI suggestions).
7. Evaluation Criteria and Course Outcomes:
   - Internal assessment rules, external board examination pattern, marks distribution, course outcomes (CO1, CO2...).
8. Recommended Preparation Strategy:
   - Practical advice on how a student should balance theory classes, lab journals, and micro-projects.

CRITICAL INSTRUCTIONS:
- Preserve original syllabus names, codes, and official terminology.
- Do NOT invent official requirements, marks, or compulsory experiments that are not in the document.
- If information is missing or unclear, clearly write "Not specified in the uploaded syllabus".
- Provide explanations in crystal-clear, student-friendly language that eliminates confusion.
- Return ONLY a valid JSON object matching the requested structure.`;

    const userPrompt = `Metadata hints provided by student:
${JSON.stringify(metadata || {})}

DOCUMENT TEXT FROM UPLOADED SYLLABUS:
${sanitizedText}

Produce the complete structured JSON curriculum analysis.`;

    const response = await generateContentWithFallback({
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json({ analysis: parsedJson });
  } catch (err: any) {
    console.error('Syllabus analysis error:', err);
    res.status(500).json({
      error: err.message || 'Failed to analyze syllabus document with Gemini',
    });
  }
});

// 2. On-Demand Topic Deep Dive Explainer (English & Hindi)
app.post('/api/gemini/explain-topic', async (req, res) => {
  try {
    const { subjectName, unitTitle, topicName, syllabusContext, language } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: 'topicName is required' });
    }

    const langInstruction =
      language === 'hi'
        ? 'Explain primarily in clear Hindi/Hinglish, keeping all technical terms, code keywords, and academic headings in English so students can write their board exam answers confidently.'
        : 'Explain in simple, encouraging, student-friendly English.';

    const prompt = `As a university professor and academic mentor, provide an in-depth, crystal-clear explanation for the following syllabus topic:

Subject: ${subjectName || 'General'}
Unit: ${unitTitle || 'Unit'}
Topic: ${topicName}
Context from syllabus: ${syllabusContext || 'Standard polytechnic/engineering syllabus'}

${langInstruction}

Include:
1. "What is this topic?" - Concept definition without intimidating jargon.
2. "Why do we study this?" - Real-world application and engineering relevance.
3. "Step-by-Step Breakdown" - Core principles, logic, formulas, or code snippet if relevant.
4. "Analogy / Real-World Example" - Relatable everyday metaphor.
5. "Key Technical Terms to Remember" - 3-5 terms with simple meanings.
6. "Common Beginner Mistakes / Pitfalls" - What students usually get confused about.
7. "Exam Practice Questions" - 1 short (2-mark definition), 1 medium (4-mark explanation), and 1 long (6-mark problem or derivation) with key answer pointers.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          'You are an exceptional educator known for making complex diploma and college engineering subjects instantly understandable.',
      },
    });

    res.json({ explanation: response.text || '' });
  } catch (err: any) {
    console.error('Explain topic error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate topic explanation' });
  }
});

// 3. Grounded Syllabus AI Assistant Chat
app.post('/api/gemini/syllabus-chat', async (req, res) => {
  try {
    const { messages, syllabusContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const systemInstruction = `You are the dedicated StudySprint Syllabus Mentor and Curriculum Guide.
You have access to the student's analyzed syllabus document:
${typeof syllabusContext === 'string' ? syllabusContext : JSON.stringify(syllabusContext || {})}

YOUR CORE PRINCIPLES:
1. Base your answers on the uploaded syllabus document.
2. When answering, cite the relevant subject, unit, experiment number, or syllabus section where applicable.
3. Clearly distinguish between:
   - [Official Syllabus]: Facts, unit topics, marks, experiment lists, or rules explicitly written in the syllabus.
   - [Conceptual Explanation]: Simple pedagogical explanations of what those concepts mean.
   - [Study Advice]: Recommended strategies, revision schedules, and practice questions.
4. If a student asks about something NOT in the uploaded syllabus (e.g. an experiment or topic from another semester), clearly say: "This is not specified in your uploaded syllabus."
5. Speak in warm, supportive, clear academic language. Can respond in English or Hinglish based on student query.`;

    const response = await generateContentWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      reply: response.text || 'No response generated.',
      modelUsed: 'gemini-flash',
    });
  } catch (err: any) {
    console.error('Syllabus chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to chat with syllabus assistant' });
  }
});

// 4. Curriculum-Based Smart Study Planner Generator
app.post('/api/gemini/curriculum-study-plan', async (req, res) => {
  try {
    const {
      syllabusTitle,
      subjects,
      practicals,
      termWork,
      microProjects,
      examDate,
      dailyHours,
      knowledgeLevel,
      prioritySubjects,
      includePracticals,
      includeTermWork,
      includeMicroProjects,
    } = req.body;

    const prompt = `Create a realistic, day-by-day smart study schedule based on the student's ACTUAL uploaded curriculum.

CURRICULUM SPECIFICATIONS:
- Syllabus: ${syllabusTitle || 'College Curriculum'}
- Subjects & Units to cover: ${JSON.stringify(subjects || [])}
- Practicals: ${includePracticals ? JSON.stringify(practicals || []) : 'Excluded by student'}
- Term Work Submissions: ${includeTermWork ? JSON.stringify(termWork || []) : 'Excluded by student'}
- Micro-Projects: ${includeMicroProjects ? JSON.stringify(microProjects || []) : 'Excluded by student'}

STUDENT PREFERENCES & CONSTRAINTS:
- Target Exam Date: ${examDate || '30 days from today'}
- Available Daily Study Time: ${dailyHours || 3} hours/day
- Existing Knowledge Level: ${knowledgeLevel || 'Intermediate'}
- Priority Subjects to focus on: ${JSON.stringify(prioritySubjects || [])}

SCHEDULING RULES:
1. Calculate the available preparation days up to the exam date.
2. Distribute theory topics across days in logical sequence respecting prerequisites (fundamental concepts before advanced).
3. If practicals are included, schedule lab preparation before submission dates.
4. If term work/micro-projects are included, schedule manageable milestones (planning, draft, testing, submission).
5. Allocate dedicated revision sessions and mock exam practice in the final 5-7 days.
6. Respect daily available study hours: do not overload any single day.
7. Provide a clear 'schedulingReason' for each day explaining WHY these specific topics/tasks are assigned today.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert learning psychologist and academic scheduler. Return a structured JSON study plan.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            dailyTargetMinutes: { type: Type.INTEGER },
            strategyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dateOffsetDays: { type: Type.INTEGER },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING },
                  category: { type: Type.STRING }, // 'theory' | 'practical' | 'term_work' | 'micro_project' | 'revision'
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  studyTechnique: { type: Type.STRING },
                  schedulingReason: { type: Type.STRING },
                },
                required: ['dayNumber', 'subject', 'topic', 'durationMinutes', 'priority'],
              },
            },
          },
          required: ['title', 'summary', 'sessions', 'strategyTips'],
        },
      },
    });

    const parsedPlan = JSON.parse(response.text || '{}');
    res.json({ plan: parsedPlan });
  } catch (err: any) {
    console.error('Curriculum study plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate curriculum study plan' });
  }
});

// 5. Tailored Micro-Project Ideas Generator
app.post('/api/gemini/micro-project-ideas', async (req, res) => {
  try {
    const { subjectName, branch, semester, unitTopics } = req.body;

    const prompt = `Generate 4 innovative, realistic academic micro-project proposals for diploma / engineering students based on their actual syllabus:
Subject: ${subjectName}
Branch: ${branch || 'Computer Science & Engineering'}
Semester: ${semester || '5th Semester'}
Topics Covered in Syllabus: ${JSON.stringify(unitTopics || [])}

Provide projects that:
1. Can be built within a typical 4-8 week semester micro-project timeline.
2. Directly apply concepts from the syllabus (e.g., OOP, Database JDBC, Networking sockets, Web).
3. Have clear deliverables for evaluation (Source code, documentation report, viva demonstration).`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          'You are an engineering project coordinator. Return a JSON array of micro-project ideas.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              techStack: { type: Type.STRING },
              realWorldRelevance: { type: Type.STRING },
              milestones: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'description', 'techStack', 'realWorldRelevance', 'milestones'],
          },
        },
      },
    });

    const parsedIdeas = JSON.parse(response.text || '[]');
    res.json({ ideas: parsedIdeas });
  } catch (err: any) {
    console.error('Micro-project ideas error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate micro-project ideas' });
  }
});


// Download project zip endpoint
app.get('/api/download-zip', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'OmniStudy-source-code.zip');
  res.download(zipPath, 'OmniStudy-source-code.zip', (err) => {
    if (err) {
      console.error('Download zip error:', err);
      if (!res.headersSent) {
        res.status(500).send('Could not download zip file');
      }
    }
  });
});

// Download Spring Boot + HTML/CSS/JS zip endpoint
app.get('/api/download-spring-boot-zip', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'spring-boot-omnistudy.zip');
  res.download(zipPath, 'spring-boot-omnistudy.zip', (err) => {
    if (err) {
      console.error('Download Spring Boot zip error:', err);
      if (!res.headersSent) {
        res.status(500).send('Could not download Spring Boot zip file');
      }
    }
  });
});

// Vite middleware for dev / static for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (Prod: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

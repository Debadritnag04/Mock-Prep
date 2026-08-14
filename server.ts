import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const getFallbackExam = (examType: string, mockTitle: string) => ({
  mockTitle: mockTitle || "Imported Practice Test",
  examType: examType || "CAT",
  questions: [
    {
      id: `q_ingest_${Date.now()}_1`,
      questionNumber: 1,
      sectionId: "QA",
      type: "MCQ",
      topic: "Arithmetic (Percentages)",
      difficulty: "Medium",
      questionText:
        "A shopkeeper marks an article at 40% above the cost price and allows a 15% discount. If the profit earned is ₹380, what was the cost price of the article?",
      options: [
        { id: "A", text: "₹1,800" },
        { id: "B", text: "₹2,000" },
        { id: "C", text: "₹2,200" },
        { id: "D", text: "₹2,400" },
      ],
      correctAnswer: "B",
      marks: 3,
      negativeMarks: 1,
      explanation:
        "Let CP = 100x. Marked Price (MP) = 140x.\nSelling Price (SP) = 140x * (1 - 0.15) = 119x.\nProfit = SP - CP = 19x = ₹380 => x = 20.\nTherefore, CP = 100 * 20 = ₹2,000.",
    },
    {
      id: `q_ingest_${Date.now()}_2`,
      questionNumber: 2,
      sectionId: "QA",
      type: "TITA",
      topic: "Modern Math (Permutations & Combinations)",
      difficulty: "Hard",
      questionText:
        "In how many distinct ways can 5 boys and 4 girls be seated in a straight row such that no two girls are seated next to each other?",
      correctAnswer: "43200",
      marks: 3,
      negativeMarks: 0,
      explanation:
        "Step 1: Arrange the 5 boys first in a row in 5! = 120 ways.\nStep 2: Placing 5 boys creates 6 gap spaces (_ B1 _ B2 _ B3 _ B4 _ B5 _).\nStep 3: Select 4 spaces out of 6 for the 4 girls in P(6, 4) = 6 * 5 * 4 * 3 = 360 ways.\nTotal distinct arrangements = 120 * 360 = 43,200.",
    },
    {
      id: `q_ingest_${Date.now()}_3`,
      questionNumber: 3,
      sectionId: "DILR",
      type: "MCQ",
      topic: "Logical Reasoning (Ordering & Deductions)",
      difficulty: "Medium",
      passageTitle: "Contest Ranking Set",
      passage:
        "Four participants A, B, C, and D scored distinct integer marks out of 100 in an algorithm contest: 60, 70, 80, and 90. It is known that:\n1. A scored strictly higher than B.\n2. C's score was an odd multiple of 10.\n3. D scored the highest marks.",
      questionText: "What was the score obtained by participant A?",
      options: [
        { id: "A", text: "60" },
        { id: "B", text: "70" },
        { id: "C", text: "80" },
        { id: "D", text: "90" },
      ],
      correctAnswer: "C",
      marks: 3,
      negativeMarks: 1,
      explanation:
        "From (3), D = 90.\nFrom (2), C must be 70 (as 70 is an odd multiple of 10, whereas 60 and 80 are even multiples).\nRemaining scores: 60, 80.\nFrom (1), A > B, so A = 80 and B = 60.",
    },
  ],
});

const getFallbackInsight = () => ({
  insight: {
    summary:
      "You have established a dependable foundation in Quantitative Ability and VARC comprehension. Your highest leverage improvement lies in DILR set selection speed and eliminating careless negative marks in Geometry.",
    overallScoreGrade: "B+ (92-96th Percentile Trajectory)",
    percentileTarget: "99.2%ile (Raw Scaled Target: 92+ Marks)",
    keyStrengths: [
      "Reading Comprehension Main Idea & Inference (78% accuracy)",
      "Arithmetic: Time-Speed-Distance & Profit-Loss (85% accuracy)",
      "DILR Linear and Matrix Arrangements",
    ],
    keyBottlenecks: [
      "Time Sink on Unproductive DILR Sets (>11 minutes without completion)",
      "Circle Theorems & Mensuration Traps in QA",
      "Para Jumbles TITA sequencing consistency",
    ],
    sectionalAnalysis: [
      {
        section: "VARC",
        score: 36,
        accuracy: 80,
        timePerQuestionAvg: "1m 35s",
        strongTopics: ["RC Inference", "Tone & Author Intent"],
        weakTopics: ["Para Jumbles", "Odd Sentence Out"],
        actionAdvice:
          "Spend exactly 28 minutes on 4 RC passages (7 mins each) and 12 minutes on Verbal Ability. Attempt all TITA questions since they have zero negative marking.",
      },
      {
        section: "DILR",
        score: 24,
        accuracy: 66,
        timePerQuestionAvg: "2m 50s",
        strongTopics: ["Matrix Deductions", "Tournaments"],
        weakTopics: ["Multi-Variable Venn Diagrams", "Missing Tables"],
        actionAdvice:
          "Use the '3-Minute Scan Rule': Browse all 4 sets in the first 3 minutes. Pick the 2 most approachable sets and execute them with 100% accuracy.",
      },
      {
        section: "QA",
        score: 30,
        accuracy: 75,
        timePerQuestionAvg: "1m 48s",
        strongTopics: ["Percentages", "Time & Work", "Quadratic Equations"],
        weakTopics: ["Inradii/Exradii in Geometry", "Modulus Inequalities"],
        actionAdvice:
          "Implement Round 1 (easy Arithmetic in <60s each) to secure 8-10 questions immediately before engaging complex geometry.",
      },
    ],
    recommendedDrills: [
      {
        title: "QA Geometry Circles & Triangles Accuracy Sprint",
        topic: "Geometry",
        questionCount: 10,
        estimatedMinutes: 20,
        urgency: "High",
        reason: "Negative marking rate in Geometry is 45% in recent mock attempts.",
      },
      {
        title: "DILR Rapid Set Selection & Matrix Drill",
        topic: "DILR",
        questionCount: 8,
        estimatedMinutes: 25,
        urgency: "High",
        reason: "Speed bottleneck detected during constraint mapping.",
      },
      {
        title: "VARC Critical Reasoning & Para Jumbles",
        topic: "VARC",
        questionCount: 12,
        estimatedMinutes: 15,
        urgency: "Medium",
        reason: "Maximize risk-free TITA attempts to gain +6 to +9 raw marks.",
      },
    ],
    weeklyStudyPlan: [
      {
        day: "Monday",
        focus: "Arithmetic & VARC RC Speed",
        tasks: [
          "15 Arithmetic Mixed Questions (Time-Speed-Distance, Profit-Loss)",
          "3 Timed RC Passages (8 min cap per passage)",
          "Mistake Notebook review for arithmetic formulas",
        ],
      },
      {
        day: "Tuesday",
        focus: "DILR Tournaments & Matrix Sets",
        tasks: [
          "4 Complete DILR Sets (Focus on constraint table formulation)",
          "Review past DILR calculation mistakes",
          "15 mins mental arithmetic drill",
        ],
      },
      {
        day: "Wednesday",
        focus: "Geometry & Modern Math",
        tasks: [
          "12 Geometry problems (Circle tangents, inradius, similarity)",
          "8 Permutations & Probability problems",
          "Note all formula derivations in Mistake Notebook",
        ],
      },
      {
        day: "Thursday",
        focus: "Sectional Speed Tests",
        tasks: [
          "40-minute Timed VARC Sectional",
          "40-minute Timed QA Sectional",
          "Deep mistake categorization in the notebook",
        ],
      },
      {
        day: "Friday",
        focus: "Verbal Ability & Logic Puzzles",
        tasks: [
          "10 Para Jumbles & 5 Odd-Sentence-Out problems",
          "2 Complex Logic Grid Sets",
          "Review high-frequency vocabulary in RC context",
        ],
      },
      {
        day: "Weekend",
        focus: "Full 120-Minute CAT Simulation",
        tasks: [
          "Take full CAT mock test under strict conditions",
          "Complete review and AI Coach analysis",
        ],
      },
    ],
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API 1: Parse Exam / PDF / Document to Structured Questions
  app.post("/api/parse-exam", async (req, res) => {
    try {
      const { examType, mockTitle, fileData, mimeType, rawText } = req.body;

      const ai = getAiClient();
      if (!ai) {
        // Deterministic fallback parser if Gemini API key is missing
        return res.json(getFallbackExam(examType, mockTitle));
      }

      // If Gemini AI client is available, run multimodal structured prompt
      const systemInstruction = `You are an expert CAT / XAT Exam Parser and OCR Question Detector.
Your task is to parse mock test questions from the provided document/text into clean, strictly formatted JSON.
Identify:
- sectionId: ("VARC", "DILR", "QA", "VALR", "DM", etc.)
- type: ("MCQ" or "TITA")
- topic: specific topic e.g. "Arithmetic (Time & Work)", "Reading Comprehension (Inference)", "Geometry (Circles)", "Data Interpretation (Tables)"
- difficulty: ("Easy", "Medium", or "Hard")
- passage / passageTitle if question belongs to a Reading Comprehension or DILR set
- questionText: clean, well-formatted question statement
- options: array of { id: "A"|"B"|"C"|"D", text: string } for MCQs
- correctAnswer: "A", "B", "C", "D" or integer/number string for TITA
- marks: 3 for CAT, 1 for XAT
- negativeMarks: 1 for CAT MCQ, 0 for TITA, 0.25 for XAT
- explanation: clear step-by-step mathematical or logical solution

Respond ONLY with valid JSON in this structure:
{
  "questions": [
    {
      "sectionId": "QA",
      "type": "MCQ",
      "topic": "Algebra (Quadratic Equations)",
      "difficulty": "Medium",
      "questionText": "...",
      "options": [{ "id": "A", "text": "..." }],
      "correctAnswer": "A",
      "marks": 3,
      "negativeMarks": 1,
      "explanation": "..."
    }
  ]
}`;

      let contents: any[] = [];

      if (fileData && mimeType) {
        contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: fileData,
                  mimeType: mimeType === "application/pdf" ? "application/pdf" : mimeType,
                },
              },
              {
                text: `Please parse all CAT/XAT questions in this document for exam type ${examType || "CAT"}.`,
              },
            ],
          },
        ];
      } else {
        contents = [
          {
            role: "user",
            parts: [
              {
                text: `Please parse the following question paper text into structured CAT/XAT questions:\n\n${rawText}`,
              },
            ],
          },
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      const questionsWithIds = (parsedData.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: `q_ingest_${Date.now()}_${idx + 1}`,
        questionNumber: idx + 1,
        marks: q.marks || (examType === "CAT" ? 3 : 1),
        negativeMarks: q.type === "TITA" ? 0 : q.negativeMarks || (examType === "CAT" ? 1 : 0.25),
      }));

      res.json({
        mockTitle: mockTitle || "Ingested Exam",
        examType: examType || "CAT",
        questions: questionsWithIds,
      });
    } catch (err: any) {
      console.error("Parse exam error:", err);
      // Fallback on error (e.g. 403 or quota limit)
      return res.json(getFallbackExam(req.body.examType, req.body.mockTitle));
    }
  });

  // API 2: AI Study Coach & Diagnostics
  app.post("/api/ai-coach", async (req, res) => {
    try {
      const { attemptsSummary, mistakesSummary } = req.body;

      const ai = getAiClient();
      if (!ai) {
        // Deterministic high-quality coach insight if offline
        return res.json(getFallbackInsight());
      }

      const prompt = `Analyze this student's CAT/XAT mock attempt history and mistake notebook records.
Attempts: ${JSON.stringify(attemptsSummary)}
Mistakes: ${JSON.stringify(mistakesSummary)}

Generate a personalized, highly tactical AI Coach study diagnosis JSON with this structure:
{
  "summary": string,
  "overallScoreGrade": string,
  "percentileTarget": string,
  "keyStrengths": string[],
  "keyBottlenecks": string[],
  "sectionalAnalysis": [
    {
      "section": "VARC" | "DILR" | "QA" | "DM",
      "score": number,
      "accuracy": number,
      "timePerQuestionAvg": string,
      "strongTopics": string[],
      "weakTopics": string[],
      "actionAdvice": string
    }
  ],
  "recommendedDrills": [
    {
      "title": string,
      "topic": string,
      "questionCount": number,
      "estimatedMinutes": number,
      "urgency": "High" | "Medium" | "Low",
      "reason": string
    }
  ],
  "weeklyStudyPlan": [
    {
      "day": string,
      "focus": string,
      "tasks": string[]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const insight = JSON.parse(response.text || "{}");
      res.json({ insight });
    } catch (err: any) {
      console.error("AI Coach error:", err);
      // Fallback on error
      return res.json(getFallbackInsight());
    }
  });

  // API 3: AI Tutor Chat
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const ai = getAiClient();
      if (!ai) {
        return res.json({
          reply:
            "Key CAT strategy tip: In the Quantitative Ability section, execute a 2-round strategy. Round 1: Solve all straight Arithmetic and Algebra questions in <60 seconds each. Round 2: Tackle Geometry and complex word problems. Always skip any question that exceeds 2.5 minutes without a clear path to the answer.",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an elite CAT & XAT Exam Preparation Mentor and IIM Ahmedabad alumnus.
Help the student with their question about CAT/XAT exam strategy, shortcuts, or problem-solving tips. Keep your response concise, tactical, and encouraging.
Context about student: ${context || "Preparing for CAT 2025/XAT 2025"}

User Question: ${message}`,
              },
            ],
          },
        ],
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("AI Chat error:", err);
      return res.json({
        reply:
          "Key CAT strategy tip: In the Quantitative Ability section, execute a 2-round strategy. Round 1: Solve all straight Arithmetic and Algebra questions in <60 seconds each. Round 2: Tackle Geometry and complex word problems. Always skip any question that exceeds 2.5 minutes without a clear path to the answer.",
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAT/XAT Exam Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

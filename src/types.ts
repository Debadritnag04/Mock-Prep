export type ExamType = 'CAT' | 'XAT' | 'CMAT' | 'SNAP' | 'NMAT' | 'GMAT' | 'CUSTOM' | 'SECTIONAL' | 'TOPIC_PRACTICE' | 'MISTAKE_DRILL' | 'SPEED_TEST';

export type ExamMode = 'real_exam' | 'custom_mock';

export interface ExamRules {
  totalTimeMinutes: number;
  timingMode: 'per_section_strict' | 'shared_pool' | 'candidate_order_timed';
  isStrictSectionTimed: boolean;
  allowSectionSwitching: boolean;
  allowRevisiting: boolean;
  autoSubmitOnTimeout: boolean;
  allowEarlySectionSubmit: boolean;
  hasOnscreenCalculator: boolean;
  calculatorType: 'scientific_cat' | 'standard_4function' | 'none';
  hasQuestionPaperView: boolean;
  scoring: {
    mcqMarks: number;
    mcqNegativeMarks: number;
    titaMarks: number;
    titaNegativeMarks: number;
    unattemptedPenalty: number;
    unattemptedFreeLimit: number;
  };
}

export type QuestionType = 'MCQ' | 'TITA';

export type QuestionState = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  sectionId: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D' or numeric/string for TITA
  marks: number; // default +3
  negativeMarks: number; // default -1 for MCQ, 0 for TITA
  passageId?: string;
  passage?: string;
  passageTitle?: string;
  diagramSvg?: string;
  diagramUrl?: string;
  topic: string; // e.g. 'Arithmetic', 'Algebra', 'Geometry', 'RC', 'Arrangements'
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  sourcePdf?: string;
  sourcePage?: number;
}

export interface Passage {
  id: string;
  title: string;
  content: string;
  diagramSvg?: string;
  diagramUrl?: string;
}

export interface SectionConfig {
  id: string;
  name: string;
  durationMinutes: number;
  isTimedStrictly: boolean; // CAT has strict 40 min per section lock
  allowSectionSwitching: boolean;
  marksPerCorrect: number;
  negativeMarksMcq: number;
  negativeMarksTita: number;
  totalQuestionsTarget?: number;
}

export interface ExamTemplate {
  id: string;
  name: string;
  examType: ExamType;
  description: string;
  totalTimeMinutes: number;
  totalMarks: number;
  sections: SectionConfig[];
}

export interface MockSection {
  id: string;
  name: string;
  durationMinutes: number;
  questions: Question[];
  passages?: Passage[];
}

export interface MockTest {
  id: string;
  title: string;
  examTemplateId: string;
  examType: ExamType;
  examMode?: ExamMode;
  rules?: ExamRules;
  year?: string;
  slot?: string;
  description: string;
  totalDurationMinutes: number;
  sections: MockSection[];
  createdDate: string;
  isPreloaded?: boolean;
}

export interface UserResponse {
  answer: string;
  state: QuestionState;
  timeSpentSeconds: number;
  isCorrect?: boolean;
  marksEarned?: number;
  visitedCount?: number;
}

export interface SectionScoreSummary {
  sectionId: string;
  sectionName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  accuracy: number; // percentage
  timeSpentSeconds: number;
}

export interface UserAttempt {
  id: string;
  mockId: string;
  mockTitle: string;
  examType: ExamType;
  startedAt: number;
  completedAt?: number;
  lastSavedAt?: number;
  totalTimeSeconds: number;
  status: 'in_progress' | 'completed';
  currentSectionIndex: number;
  currentQuestionIndex?: number;
  currentQuestionId: string;
  sectionTimeRemaining?: number;
  answers: Record<string, UserResponse>;
  sectionTimes: Record<string, number>; // sectionId -> seconds
  totalScore: number;
  maxScore: number;
  accuracy: number;
  sectionalScores: Record<string, SectionScoreSummary>;
  percentileEstimate: number;
  unattemptedPenaltyApplied?: number;
}

export interface MistakeEntry {
  id: string;
  questionId: string;
  question: Question;
  mockId: string;
  mockTitle: string;
  attemptId: string;
  userAnswer: string;
  correctAnswer: string;
  date: string;
  category: 'conceptual' | 'calculation' | 'misread' | 'time_pressure' | 'guessed';
  userNote?: string;
  mastered: boolean;
  retryCount: number;
  lastRetriedAt?: string;
}

export interface AiCoachInsight {
  summary: string;
  overallScoreGrade: string;
  percentileTarget: string;
  keyStrengths: string[];
  keyBottlenecks: string[];
  sectionalAnalysis: {
    section: string;
    score: number;
    accuracy: number;
    timePerQuestionAvg: string;
    strongTopics: string[];
    weakTopics: string[];
    actionAdvice: string;
  }[];
  recommendedDrills: {
    title: string;
    topic: string;
    questionCount: number;
    estimatedMinutes: number;
    urgency: 'High' | 'Medium' | 'Low';
    reason: string;
  }[];
  weeklyStudyPlan: {
    day: string;
    focus: string;
    tasks: string[];
  }[];
}

export type ActiveTab = 'dashboard' | 'exam' | 'analytics' | 'mistakes' | 'upload' | 'coach' | 'practice';

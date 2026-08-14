import { ExamType, QuestionType } from '../types';

export type ExamMode = 'real_exam' | 'custom_mock';

export type TimingMode = 'per_section_strict' | 'shared_pool' | 'candidate_order_timed';

export type CalculatorType = 'scientific_cat' | 'standard_4function' | 'none';

export interface SectionTemplateConfig {
  id: string;
  name: string;
  shortCode: string;
  durationMinutes: number;
  targetQuestions: number;
  allowedQuestionTypes: QuestionType[];
  isTimedStrictly: boolean;
  allowSectionSwitching: boolean;
  allowRevisiting: boolean;
  hasCalculator?: boolean;
  marksPerCorrect: number;
  negativeMarksMcq: number;
  negativeMarksTita: number;
  unattemptedPenalty?: number;
  unattemptedFreeLimit?: number;
}

export interface ExamRules {
  totalTimeMinutes: number;
  timingMode: TimingMode;
  isStrictSectionTimed: boolean;
  allowSectionSwitching: boolean;
  allowRevisiting: boolean;
  autoSubmitOnTimeout: boolean;
  allowEarlySectionSubmit: boolean;
  hasOnscreenCalculator: boolean;
  calculatorType: CalculatorType;
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

export interface ExamTemplateDefinition {
  id: string;
  name: string;
  shortName: string;
  examType: ExamType;
  category: 'management' | 'international' | 'custom';
  description: string;
  officialPatternYear: string;
  totalTimeMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  rules: ExamRules;
  sections: SectionTemplateConfig[];
  percentileEstimator: (score: number, maxScore: number) => number;
}

export interface PdfDetectedStructure {
  fileName: string;
  totalQuestions: number;
  totalSections: number;
  totalMinutes: number;
  diagramsCount: number;
  tablesCount: number;
  passagesCount: number;
  detectedSectionNames: string[];
  detectedQuestionTypes: QuestionType[];
}

export interface TemplateValidationResult {
  status: 'exact_match' | 'partial_match' | 'mismatch';
  matchedSections: string[];
  missingSections: string[];
  extraSections: string[];
  expectedQuestions: number;
  detectedQuestions: number;
  expectedDuration: number;
  detectedDuration: number;
  mismatchSummary: string;
  details: {
    label: string;
    detected: string | number;
    expected: string | number;
    isMatch: boolean;
  }[];
}

export interface ExamConfigMismatchIssue {
  id: string;
  field: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  currentValue: string | number;
  expectedValue: string | number;
  suggestion: string;
}

export interface UserDefinedExamConfig {
  sections: {
    id: string;
    name: string;
    durationMinutes: number;
    questionCount: number;
  }[];
  mcqMarks: number;
  mcqNegativeMarks: number;
  titaMarks: number;
  titaNegativeMarks: number;
  isStrictSectionTimed: boolean;
  allowSectionSwitching: boolean;
  autoSubmitOnTimeout: boolean;
  totalDurationMinutes?: number;
}

export interface ExamConfigValidationReport {
  isValid: boolean;
  hasCriticalErrors: boolean;
  criticalCount: number;
  warningCount: number;
  issues: ExamConfigMismatchIssue[];
  summary: string;
}

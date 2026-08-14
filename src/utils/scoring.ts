import { MockTest, SectionScoreSummary, UserResponse, ExamType } from '../types';
import { ExamRulesEngine } from '../rules/examEngine';

export function calculateDeterministicScore(
  mock: MockTest,
  answers: Record<string, UserResponse>,
  sectionTimes: Record<string, number>
): {
  totalScore: number;
  maxScore: number;
  accuracy: number;
  sectionalScores: Record<string, SectionScoreSummary>;
  percentileEstimate: number;
  unattemptedPenaltyApplied?: number;
} {
  return ExamRulesEngine.scoreAttempt(mock, answers, sectionTimes);
}

export function estimatePercentile(score: number, examType: ExamType, maxScore: number): number {
  const template = ExamRulesEngine.getTemplate(examType);
  return template.percentileEstimator(score, maxScore);
}


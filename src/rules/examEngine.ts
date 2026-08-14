import { ExamType, MockTest, UserResponse, SectionScoreSummary } from '../types';
import {
  ExamTemplateDefinition,
  PdfDetectedStructure,
  TemplateValidationResult,
  ExamMode,
  ExamRules,
  UserDefinedExamConfig,
  ExamConfigValidationReport,
  ExamConfigMismatchIssue,
} from './types';
import { OFFICIAL_EXAM_TEMPLATES } from './examTemplates';

export class ExamRulesEngine {
  /**
   * Retrieve the declarative exam template for a given ExamType
   */
  static getTemplate(examType: ExamType | string): ExamTemplateDefinition {
    const key = (examType || 'CAT').toUpperCase();
    return OFFICIAL_EXAM_TEMPLATES[key] || OFFICIAL_EXAM_TEMPLATES.CAT;
  }

  /**
   * List all officially supported exam templates
   */
  static getAllTemplates(): ExamTemplateDefinition[] {
    return Object.values(OFFICIAL_EXAM_TEMPLATES);
  }

  /**
   * Validate user-defined exam rules and structure (time, section count, marks, questions)
   * against the selected official Exam Template, flagging critical errors and warnings.
   */
  static validateExamConfiguration(
    config: UserDefinedExamConfig,
    template: ExamTemplateDefinition,
    mode: ExamMode
  ): ExamConfigValidationReport {
    const issues: ExamConfigMismatchIssue[] = [];

    const totalMinutes = config.sections.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
    const totalQuestions = config.sections.reduce((acc, s) => acc + (Number(s.questionCount) || 0), 0);
    const sectionCount = config.sections.length;

    // 1. Critical Empty or Zero Validations
    if (sectionCount === 0) {
      issues.push({
        id: 'zero_sections',
        field: 'sections',
        severity: 'critical',
        title: 'No Exam Sections Defined',
        message: 'The mock test must contain at least 1 valid exam section.',
        currentValue: 0,
        expectedValue: template.sections.length,
        suggestion: `Initialize standard ${template.shortName} sections (${template.sections.map((s) => s.shortCode).join(', ')}).`,
      });
    }

    config.sections.forEach((sec, idx) => {
      if (!sec.name || sec.name.trim() === '') {
        issues.push({
          id: `sec_empty_name_${idx}`,
          field: `section_${idx}_name`,
          severity: 'critical',
          title: `Section ${idx + 1} Name Missing`,
          message: `Section ${idx + 1} has an empty or invalid name.`,
          currentValue: '(empty)',
          expectedValue: template.sections[idx]?.name || `Section ${idx + 1}`,
          suggestion: 'Provide a descriptive title for this section.',
        });
      }

      if (sec.durationMinutes <= 0) {
        issues.push({
          id: `sec_zero_time_${idx}`,
          field: `section_${idx}_duration`,
          severity: 'critical',
          title: `Section "${sec.name || idx + 1}" Duration Invalid`,
          message: `Duration must be greater than 0 minutes. Current value is ${sec.durationMinutes}m.`,
          currentValue: `${sec.durationMinutes} mins`,
          expectedValue: `> 0 mins (${template.sections[idx]?.durationMinutes || 40}m recommended)`,
          suggestion: 'Assign a valid positive duration in minutes.',
        });
      }

      if (sec.questionCount <= 0) {
        issues.push({
          id: `sec_zero_questions_${idx}`,
          field: `section_${idx}_questions`,
          severity: 'critical',
          title: `Section "${sec.name || idx + 1}" Has Zero Questions`,
          message: `Question count must be at least 1. Current value is ${sec.questionCount}.`,
          currentValue: `${sec.questionCount} Qs`,
          expectedValue: `> 0 Qs (${template.sections[idx]?.targetQuestions || 20} Qs recommended)`,
          suggestion: 'Configure at least 1 question for this section.',
        });
      }
    });

    // 2. Scoring Scheme Sanity Checks
    if (config.mcqMarks <= 0) {
      issues.push({
        id: 'invalid_mcq_marks',
        field: 'mcqMarks',
        severity: 'critical',
        title: 'MCQ Marks per Correct Answer is Invalid',
        message: 'Marks awarded for a correct MCQ must be positive and greater than 0.',
        currentValue: config.mcqMarks,
        expectedValue: template.rules.scoring.mcqMarks,
        suggestion: `Set positive MCQ marks (official ${template.shortName} standard is +${template.rules.scoring.mcqMarks}).`,
      });
    }

    if (config.mcqNegativeMarks < 0) {
      issues.push({
        id: 'negative_mcq_penalty',
        field: 'mcqNegativeMarks',
        severity: 'critical',
        title: 'MCQ Negative Deduction is Negative',
        message: 'Negative marking deduction cannot be negative (would add marks on wrong answers).',
        currentValue: config.mcqNegativeMarks,
        expectedValue: template.rules.scoring.mcqNegativeMarks,
        suggestion: `Set positive deduction value (official ${template.shortName} deduction is ${template.rules.scoring.mcqNegativeMarks}).`,
      });
    }

    if (config.titaMarks <= 0) {
      issues.push({
        id: 'invalid_tita_marks',
        field: 'titaMarks',
        severity: 'warning',
        title: 'TITA / Numeric Marks are 0 or Negative',
        message: 'Marks for numeric/TITA questions are usually positive.',
        currentValue: config.titaMarks,
        expectedValue: template.rules.scoring.titaMarks,
        suggestion: `Set TITA marks to +${template.rules.scoring.titaMarks}.`,
      });
    }

    // 3. Real Exam Mode Strict Template Match Mismatches
    if (mode === 'real_exam') {
      if (sectionCount !== template.sections.length) {
        issues.push({
          id: 'real_mode_section_count_mismatch',
          field: 'sections',
          severity: 'critical',
          title: `Real Exam Mode Section Count Mismatch (${template.shortName})`,
          message: `Official ${template.shortName} examination requires exactly ${template.sections.length} sections (${template.sections.map((s) => s.shortCode).join(', ')}). Configured: ${sectionCount}.`,
          currentValue: `${sectionCount} sections`,
          expectedValue: `${template.sections.length} sections`,
          suggestion: 'Switch to Custom Mock Mode to run custom section counts, or align with official sections.',
        });
      }

      if (totalMinutes !== template.totalTimeMinutes) {
        issues.push({
          id: 'real_mode_duration_mismatch',
          field: 'totalDuration',
          severity: 'warning',
          title: `Total Duration Differs from Official ${template.shortName} Pattern`,
          message: `Configured duration is ${totalMinutes}m vs official ${template.totalTimeMinutes}m pattern.`,
          currentValue: `${totalMinutes} mins`,
          expectedValue: `${template.totalTimeMinutes} mins`,
          suggestion: `Align section timings to sum to ${template.totalTimeMinutes} mins for authentic simulation.`,
        });
      }

      if (config.mcqMarks !== template.rules.scoring.mcqMarks) {
        issues.push({
          id: 'real_mode_mcq_marks_mismatch',
          field: 'mcqMarks',
          severity: 'warning',
          title: `MCQ Marks Vary from Official ${template.shortName} Scheme`,
          message: `Configured +${config.mcqMarks} marks per MCQ vs official +${template.rules.scoring.mcqMarks}.`,
          currentValue: `+${config.mcqMarks}`,
          expectedValue: `+${template.rules.scoring.mcqMarks}`,
          suggestion: `Use standard +${template.rules.scoring.mcqMarks} for accurate percentile calculations.`,
        });
      }

      if (config.mcqNegativeMarks !== template.rules.scoring.mcqNegativeMarks) {
        issues.push({
          id: 'real_mode_mcq_negative_mismatch',
          field: 'mcqNegativeMarks',
          severity: 'warning',
          title: `Negative Marking Differs from Official ${template.shortName} Pattern`,
          message: `Configured -${config.mcqNegativeMarks} deduction vs official -${template.rules.scoring.mcqNegativeMarks}.`,
          currentValue: `-${config.mcqNegativeMarks}`,
          expectedValue: `-${template.rules.scoring.mcqNegativeMarks}`,
          suggestion: `Align negative marking with official -${template.rules.scoring.mcqNegativeMarks}.`,
        });
      }
    } else {
      // Custom Mock Mode Warnings
      if (totalMinutes < 5) {
        issues.push({
          id: 'custom_mode_duration_too_short',
          field: 'totalDuration',
          severity: 'warning',
          title: 'Total Exam Duration is Exceptionally Short',
          message: `The total exam time (${totalMinutes}m) may be too short for comprehensive practice.`,
          currentValue: `${totalMinutes} mins`,
          expectedValue: `≥ 15 mins`,
          suggestion: 'Ensure students have adequate time to attempt questions.',
        });
      }
    }

    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const hasCriticalErrors = criticalCount > 0;
    const isValid = !hasCriticalErrors;

    let summary = '';
    if (isValid && warningCount === 0) {
      summary = `Configuration fully validated against ${template.shortName} rules. Ready for mock creation.`;
    } else if (hasCriticalErrors) {
      summary = `Configuration contains ${criticalCount} critical error${criticalCount > 1 ? 's' : ''} that must be resolved before launching the mock.`;
    } else {
      summary = `Configuration has ${warningCount} advisory variation${warningCount > 1 ? 's' : ''} against official ${template.shortName} pattern.`;
    }

    return {
      isValid,
      hasCriticalErrors,
      criticalCount,
      warningCount,
      issues,
      summary,
    };
  }

  /**
   * Validate a detected PDF against the selected Exam Template
   * Generates deep structural diagnostics (exact match vs mismatch warnings)
   */
  static validatePdfStructure(
    pdf: PdfDetectedStructure,
    template: ExamTemplateDefinition
  ): TemplateValidationResult {
    const expectedSections = template.sections.map((s) => s.id);
    const expectedSectionNames = template.sections.map((s) => s.name.toLowerCase());
    const detectedNames = pdf.detectedSectionNames.map((n) => n.toLowerCase());

    const matchedSections: string[] = [];
    const missingSections: string[] = [];

    template.sections.forEach((sec) => {
      const isFound = detectedNames.some(
        (dn) =>
          dn.includes(sec.id.toLowerCase()) ||
          dn.includes(sec.shortCode.toLowerCase()) ||
          sec.name.toLowerCase().includes(dn)
      );

      if (isFound) {
        matchedSections.push(sec.name);
      } else {
        missingSections.push(sec.name);
      }
    });

    const extraSections: string[] = pdf.detectedSectionNames.filter(
      (dn) =>
        !template.sections.some(
          (s) =>
            dn.toLowerCase().includes(s.id.toLowerCase()) ||
            dn.toLowerCase().includes(s.shortCode.toLowerCase()) ||
            s.name.toLowerCase().includes(dn.toLowerCase())
        )
    );

    const questionsMatch = Math.abs(pdf.totalQuestions - template.totalQuestions) <= 5;
    const sectionsCountMatch = pdf.totalSections === template.sections.length;
    const durationMatch = Math.abs(pdf.totalMinutes - template.totalTimeMinutes) <= 15;

    let status: 'exact_match' | 'partial_match' | 'mismatch' = 'exact_match';

    if (missingSections.length > 0 || !sectionsCountMatch) {
      status = missingSections.length >= 2 ? 'mismatch' : 'partial_match';
    } else if (!questionsMatch || !durationMatch) {
      status = 'partial_match';
    }

    // Build human-friendly diagnostic summary
    let mismatchSummary = '';
    if (status === 'exact_match') {
      mismatchSummary = `Matches ${template.shortName} official pattern perfectly. All ${template.sections.length} sections and parameters aligned.`;
    } else if (missingSections.length > 0) {
      mismatchSummary = `You selected ${template.shortName}, but the PDF appears to contain only ${pdf.totalSections} section${
        pdf.totalSections === 1 ? '' : 's'
      }. Detected: ${matchedSections.map((s) => `✓ ${s}`).join(', ')}${
        missingSections.length > 0 ? ` • ✗ ${missingSections.join(', ')} not detected` : ''
      }.`;
    } else {
      mismatchSummary = `PDF has minor structural variations from standard ${template.shortName} pattern (${pdf.totalQuestions} questions detected vs ${template.totalQuestions} expected).`;
    }

    const details = [
      {
        label: 'Sections Count',
        detected: `${pdf.totalSections} sections`,
        expected: `${template.sections.length} sections`,
        isMatch: sectionsCountMatch,
      },
      {
        label: 'Total Duration',
        detected: `${pdf.totalMinutes} mins`,
        expected: `${template.totalTimeMinutes} mins`,
        isMatch: durationMatch,
      },
      {
        label: 'Question Count',
        detected: `${pdf.totalQuestions} questions`,
        expected: `${template.totalQuestions} questions`,
        isMatch: questionsMatch,
      },
      {
        label: 'Section Mappings',
        detected: matchedSections.length > 0 ? matchedSections.join(', ') : 'None matched',
        expected: template.sections.map((s) => s.shortCode).join(', '),
        isMatch: missingSections.length === 0,
      },
    ];

    return {
      status,
      matchedSections,
      missingSections,
      extraSections,
      expectedQuestions: template.totalQuestions,
      detectedQuestions: pdf.totalQuestions,
      expectedDuration: template.totalTimeMinutes,
      detectedDuration: pdf.totalMinutes,
      mismatchSummary,
      details,
    };
  }

  /**
   * Resolve runtime rules depending on Real Exam Mode vs Custom Mock Mode
   */
  static resolveRules(
    template: ExamTemplateDefinition,
    mode: ExamMode,
    customOverrides?: Partial<ExamRules>
  ): ExamRules {
    if (mode === 'real_exam') {
      // Return official template rules strictly
      return { ...template.rules };
    }

    // Custom Mock Mode allows custom overrides while inheriting defaults
    return {
      ...template.rules,
      ...(customOverrides || {}),
      scoring: {
        ...template.rules.scoring,
        ...(customOverrides?.scoring || {}),
      },
    };
  }

  /**
   * Deterministic Scoring Engine driven directly by the resolved Exam Rules
   */
  static scoreAttempt(
    mock: MockTest,
    answers: Record<string, UserResponse>,
    sectionTimes: Record<string, number>
  ): {
    totalScore: number;
    maxScore: number;
    accuracy: number;
    sectionalScores: Record<string, SectionScoreSummary>;
    percentileEstimate: number;
    unattemptedPenaltyApplied: number;
  } {
    const template = this.getTemplate(mock.examType);
    const rules: ExamRules = mock.rules || template.rules;

    let totalScore = 0;
    let maxScore = 0;
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalUnattempted = 0;

    const sectionalScores: Record<string, SectionScoreSummary> = {};

    mock.sections.forEach((section) => {
      let secScore = 0;
      let secAttempted = 0;
      let secCorrect = 0;
      let secIncorrect = 0;
      let secUnattempted = 0;

      const questions = section.questions;

      questions.forEach((q) => {
        const qMarks = q.marks || (q.type === 'TITA' ? rules.scoring.titaMarks : rules.scoring.mcqMarks);
        const qNegative =
          q.type === 'TITA' ? rules.scoring.titaNegativeMarks : (q.negativeMarks !== undefined ? q.negativeMarks : rules.scoring.mcqNegativeMarks);

        maxScore += qMarks;
        const resp = answers[q.id];
        const userAnswer = resp ? resp.answer?.trim() : '';

        if (!userAnswer || userAnswer === '') {
          secUnattempted++;
          totalUnattempted++;
          if (resp) {
            resp.isCorrect = false;
            resp.marksEarned = 0;
          }
        } else {
          secAttempted++;
          totalAttempted++;

          // Comparison: Case-insensitive for MCQ, trimmed numeric/string check for TITA
          const isMatch =
            q.type === 'MCQ'
              ? userAnswer.toUpperCase() === q.correctAnswer.toUpperCase()
              : userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() ||
                parseFloat(userAnswer) === parseFloat(q.correctAnswer);

          if (isMatch) {
            secCorrect++;
            totalCorrect++;
            secScore += qMarks;
            totalScore += qMarks;
            if (resp) {
              resp.isCorrect = true;
              resp.marksEarned = qMarks;
            }
          } else {
            secIncorrect++;
            secScore -= qNegative;
            totalScore -= qNegative;
            if (resp) {
              resp.isCorrect = false;
              resp.marksEarned = -qNegative;
            }
          }
        }
      });

      const accuracy = secAttempted > 0 ? Math.round((secCorrect / secAttempted) * 100) : 0;

      sectionalScores[section.id] = {
        sectionId: section.id,
        sectionName: section.name,
        totalQuestions: questions.length,
        attempted: secAttempted,
        correct: secCorrect,
        incorrect: secIncorrect,
        unattempted: secUnattempted,
        score: Math.round(secScore * 100) / 100,
        accuracy,
        timeSpentSeconds: sectionTimes[section.id] || 0,
      };
    });

    // Handle Unattempted Question Penalties (e.g., XAT negative marking after 8 unattempted)
    let unattemptedPenaltyApplied = 0;
    if (rules.scoring.unattemptedPenalty > 0 && totalUnattempted > rules.scoring.unattemptedFreeLimit) {
      const penalizedCount = totalUnattempted - rules.scoring.unattemptedFreeLimit;
      unattemptedPenaltyApplied = Math.round(penalizedCount * rules.scoring.unattemptedPenalty * 100) / 100;
      totalScore = Math.max(0, totalScore - unattemptedPenaltyApplied);
    }

    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const percentileEstimate = template.percentileEstimator(totalScore, maxScore);

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      maxScore,
      accuracy: overallAccuracy,
      sectionalScores,
      percentileEstimate,
      unattemptedPenaltyApplied,
    };
  }
}

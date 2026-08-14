import React, { useState, useEffect, useRef } from 'react';
import { MockTest, Question, UserResponse, QuestionState, UserAttempt } from '../../types';
import { CatCalculator } from './CatCalculator';
import { QuestionPalette } from './QuestionPalette';
import { QuestionPaperModal, InstructionsModal, SubmitConfirmationModal, KeyboardHelpModal } from './ExamModals';
import { calculateDeterministicScore } from '../../utils/scoring';
import { StorageService } from '../../utils/storage';
import { ExamRulesEngine } from '../../rules/examEngine';
import {
  Calculator,
  HelpCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Lock,
  Layers,
  Keyboard,
  Check
} from 'lucide-react';

interface ExamScreenProps {
  mock: MockTest;
  existingAttempt?: UserAttempt | null;
  onFinishExam: (attempt: UserAttempt) => void;
  onExitWithoutSaving: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  mock,
  existingAttempt,
  onFinishExam,
  onExitWithoutSaving,
}) => {
  // Retrieve declarative rules for this mock
  const template = ExamRulesEngine.getTemplate(mock.examType);
  const rules = mock.rules || template.rules;

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(
    existingAttempt?.currentSectionIndex ?? 0
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(
    existingAttempt?.currentQuestionIndex ?? 0
  );

  // Answers map
  const [answers, setAnswers] = useState<Record<string, UserResponse>>(
    existingAttempt?.answers || {}
  );

  // Selected answer for current question
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Modals state
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Section timing & Rules
  const isStrictSectionTimed = rules.isStrictSectionTimed;
  const currentSection = mock.sections[currentSectionIndex] || mock.sections[0];
  const sectionDurationSeconds = (currentSection?.durationMinutes || 40) * 60;

  // Track time remaining per section & total
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState<number>(
    existingAttempt?.sectionTimeRemaining ?? sectionDurationSeconds
  );
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(
    existingAttempt?.totalTimeSeconds || 0
  );
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>(
    existingAttempt?.sectionTimes || {}
  );

  // Attempt IDs and Auto-save status tracking
  const attemptIdRef = useRef<string>(existingAttempt?.id || `attempt_${Date.now()}`);
  const startedAtRef = useRef<number>(existingAttempt?.startedAt || Date.now());
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Synchronized state references for listeners and intervals
  const totalTimeSpentRef = useRef(totalTimeSpent);
  totalTimeSpentRef.current = totalTimeSpent;

  const currentSectionIndexRef = useRef(currentSectionIndex);
  currentSectionIndexRef.current = currentSectionIndex;

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  currentQuestionIndexRef.current = currentQuestionIndex;

  const sectionTimeRemainingRef = useRef(sectionTimeRemaining);
  sectionTimeRemainingRef.current = sectionTimeRemaining;

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const sectionTimesRef = useRef(sectionTimes);
  sectionTimesRef.current = sectionTimes;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestions = currentSection?.questions || [];
  const currentQuestion: Question | undefined = currentQuestions[currentQuestionIndex];
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;

  // Save in-progress snapshot to LocalStorage
  const saveAttemptSnapshot = (status: 'in_progress' | 'completed' = 'in_progress') => {
    if (!mock) return;
    setIsAutoSaving(true);

    const snapshot: UserAttempt = {
      id: attemptIdRef.current,
      mockId: mock.id,
      mockTitle: mock.title,
      examType: mock.examType,
      startedAt: startedAtRef.current,
      lastSavedAt: Date.now(),
      totalTimeSeconds: totalTimeSpentRef.current,
      status: status,
      currentSectionIndex: currentSectionIndexRef.current,
      currentQuestionIndex: currentQuestionIndexRef.current,
      currentQuestionId: mock.sections[currentSectionIndexRef.current]?.questions[currentQuestionIndexRef.current]?.id || '',
      sectionTimeRemaining: sectionTimeRemainingRef.current,
      answers: answersRef.current,
      sectionTimes: sectionTimesRef.current,
      totalScore: 0,
      maxScore: mock.sections.reduce((acc, s) => acc + s.questions.length * 3, 0),
      accuracy: 0,
      sectionalScores: {},
      percentileEstimate: 0,
    };

    StorageService.saveActiveAttempt(snapshot);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(timeStr);
    setTimeout(() => setIsAutoSaving(false), 500);
  };

  // 1. Initial snapshot on mount
  useEffect(() => {
    saveAttemptSnapshot('in_progress');
  }, []);

  // 2. Auto-save interval every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveAttemptSnapshot('in_progress');
    }, 30000); // 30s auto-save cadence

    return () => clearInterval(autoSaveInterval);
  }, []);

  // 3. Auto-save on visibility change (tab switch / background) or window unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveAttemptSnapshot('in_progress');
      }
    };

    const handleBeforeUnload = () => {
      saveAttemptSnapshot('in_progress');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Initialize active question answer
  useEffect(() => {
    if (currentQuestion) {
      const existing = answers[currentQuestion.id];
      if (existing) {
        setSelectedAnswer(existing.answer || '');
      } else {
        setSelectedAnswer('');
        // Mark as visited (not answered) if not already visited
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            answer: '',
            state: 'not_answered',
            timeSpentSeconds: 0,
          },
        }));
      }
    }
  }, [currentQuestion?.id, currentSectionIndex]);

  // Main countdown timer loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);

      setSectionTimes((prev) => ({
        ...prev,
        [currentSection.id]: (prev[currentSection.id] || 0) + 1,
      }));

      // Update question time spent
      if (currentQuestion) {
        setAnswers((prev) => {
          const curr = prev[currentQuestion.id];
          if (!curr) return prev;
          return {
            ...prev,
            [currentQuestion.id]: {
              ...curr,
              timeSpentSeconds: (curr.timeSpentSeconds || 0) + 1,
            },
          };
        });
      }

      setSectionTimeRemaining((prev) => {
        if (prev <= 1) {
          // If strictly timed section, advance to next section or auto-submit
          if (isStrictSectionTimed) {
            if (currentSectionIndex < mock.sections.length - 1) {
              handleNextSection();
              return (mock.sections[currentSectionIndex + 1]?.durationMinutes || 40) * 60;
            } else {
              // Final section timer ran out -> Auto submit
              handleAutoSubmit();
              return 0;
            }
          } else {
            // Flexible test timer finished -> Auto submit
            handleAutoSubmit();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSectionIndex, currentQuestion?.id, isStrictSectionTimed]);

  const handleNextSection = () => {
    if (currentSectionIndex < mock.sections.length - 1) {
      const nextIdx = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIdx);
      setCurrentQuestionIndex(0);
      setSectionTimeRemaining((mock.sections[nextIdx]?.durationMinutes || 40) * 60);
    }
  };

  const handleSelectSection = (index: number) => {
    if (index === currentSectionIndex) return;

    if (isStrictSectionTimed) {
      // In CAT, can only move forward, not back, or cannot manually switch until time finishes
      return;
    }

    setCurrentSectionIndex(index);
    setCurrentQuestionIndex(0);
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;

    const hasAnswer = selectedAnswer && selectedAnswer.trim() !== '';
    const newState: QuestionState = hasAnswer ? 'answered' : 'not_answered';

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: {
        ...(answers[currentQuestion.id] || { timeSpentSeconds: 0 }),
        answer: selectedAnswer,
        state: newState,
      },
    };

    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (!isStrictSectionTimed && currentSectionIndex < mock.sections.length - 1) {
      // Prompt next section if allowed
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }

    // Auto-save immediately on save action
    setTimeout(() => saveAttemptSnapshot('in_progress'), 50);
  };

  // Action: Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setSelectedAnswer('');

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: {
        ...(answers[currentQuestion.id] || { timeSpentSeconds: 0 }),
        answer: '',
        state: 'not_answered' as QuestionState,
      },
    };

    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;
    setTimeout(() => saveAttemptSnapshot('in_progress'), 50);
  };

  // Action: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;

    const hasAnswer = selectedAnswer && selectedAnswer.trim() !== '';
    const newState: QuestionState = hasAnswer ? 'answered_marked' : 'marked_for_review';

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: {
        ...(answers[currentQuestion.id] || { timeSpentSeconds: 0 }),
        answer: selectedAnswer,
        state: newState,
      },
    };

    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }

    setTimeout(() => saveAttemptSnapshot('in_progress'), 50);
  };

  // Navigation: Previous
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Navigation: Next (without saving)
  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      // Escape always closes any open modal / overlay
      if (e.key === 'Escape') {
        setShowCalculator(false);
        setShowQuestionPaper(false);
        setShowInstructions(false);
        setShowSubmitModal(false);
        setShowKeyboardHelp(false);
        return;
      }

      // Help shortcuts: '?' or 'h' / 'H' (when not typing in TITA input)
      if ((e.key === '?' || e.key === 'h' || e.key === 'H') && !isInputFocused) {
        e.preventDefault();
        setShowKeyboardHelp((prev) => !prev);
        return;
      }

      // If a modal dialog is actively open, prevent key actions from taking effect in the background
      if (showSubmitModal || showInstructions || showQuestionPaper || showKeyboardHelp) {
        return;
      }

      // When typing inside TITA input or search inputs
      if (isInputFocused) {
        // Allow Ctrl+Enter or Cmd+Enter to Save & Next from input
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey)) {
          e.preventDefault();
          handleSaveAndNext();
        }
        return;
      }

      const key = e.key.toUpperCase();

      // Option selections for MCQ questions (A, B, C, D or 1, 2, 3, 4)
      if (currentQuestion?.type === 'MCQ' && currentQuestion.options) {
        if (key === 'A' || key === '1') {
          e.preventDefault();
          setSelectedAnswer('A');
          return;
        }
        if (key === 'B' || key === '2') {
          e.preventDefault();
          setSelectedAnswer('B');
          return;
        }
        if (key === 'C' || key === '3') {
          e.preventDefault();
          setSelectedAnswer('C');
          return;
        }
        if (key === 'D' || key === '4') {
          e.preventDefault();
          setSelectedAnswer('D');
          return;
        }
      }

      // Save & Next: 'S' or 'Enter'
      if (key === 'S' || e.key === 'Enter') {
        e.preventDefault();
        handleSaveAndNext();
        return;
      }

      // Mark for Review: 'R'
      if (key === 'R') {
        e.preventDefault();
        handleMarkForReviewAndNext();
        return;
      }

      // Clear Response: 'X' or 'Delete'
      if (key === 'X' || e.key === 'Delete') {
        e.preventDefault();
        handleClearResponse();
        return;
      }

      // Previous Question: 'P' or Left Arrow
      if (key === 'P' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
        return;
      }

      // Next Question: 'N' or Right Arrow
      if (key === 'N' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }

      // Calculator: 'K'
      if (key === 'K') {
        e.preventDefault();
        setShowCalculator((prev) => !prev);
        return;
      }

      // Question Paper Overview: 'J'
      if (key === 'J') {
        e.preventDefault();
        setShowQuestionPaper((prev) => !prev);
        return;
      }

      // Instructions: 'I'
      if (key === 'I') {
        e.preventDefault();
        setShowInstructions((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentQuestion,
    selectedAnswer,
    currentQuestionIndex,
    currentSectionIndex,
    answers,
    showCalculator,
    showQuestionPaper,
    showInstructions,
    showSubmitModal,
    showKeyboardHelp,
  ]);

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    finalizeSubmission();
  };

  // Submit test
  const finalizeSubmission = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const scoreResults = calculateDeterministicScore(mock, answers, sectionTimes);

    const completedAttempt: UserAttempt = {
      id: existingAttempt?.id || `attempt_${Date.now()}`,
      mockId: mock.id,
      mockTitle: mock.title,
      examType: mock.examType,
      startedAt: existingAttempt?.startedAt || Date.now() - totalTimeSpent * 1000,
      completedAt: Date.now(),
      totalTimeSeconds: totalTimeSpent,
      status: 'completed',
      currentSectionIndex,
      currentQuestionId: currentQuestion?.id || '',
      answers,
      sectionTimes,
      totalScore: scoreResults.totalScore,
      maxScore: scoreResults.maxScore,
      accuracy: scoreResults.accuracy,
      sectionalScores: scoreResults.sectionalScores,
      percentileEstimate: scoreResults.percentileEstimate,
    };

    StorageService.saveAttempt(completedAttempt);
    StorageService.saveActiveAttempt(null);
    onFinishExam(completedAttempt);
  };

  // Format timer
  const minutes = Math.floor(sectionTimeRemaining / 60);
  const seconds = sectionTimeRemaining % 60;
  const isTimeCritical = sectionTimeRemaining < 300; // less than 5 mins

  return (
    <div id="cbt-exam-container" className="fixed inset-0 z-40 bg-[#f8fafc] text-slate-900 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200 gap-4 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Brand Logo */}
          <div className="bg-indigo-600 text-white font-bold p-2 rounded-xl shadow-xs flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>

          {/* Section Navigation Tabs Bar (Pill Navigation) */}
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 overflow-x-auto">
            {mock.sections.map((sec, idx) => {
              const isActive = idx === currentSectionIndex;
              const isCompletedSection = isStrictSectionTimed && idx < currentSectionIndex;
              const isLockedSection = isStrictSectionTimed && idx > currentSectionIndex;

              return (
                <button
                  key={sec.id}
                  disabled={isStrictSectionTimed && !isActive}
                  onClick={() => handleSelectSection(idx)}
                  className={`px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white shadow-xs text-slate-900 font-bold'
                      : isCompletedSection || isLockedSection
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span>{sec.id || sec.name}</span>
                  {isStrictSectionTimed && isLockedSection && <Lock className="w-3 h-3 text-slate-400" />}
                  {isStrictSectionTimed && isCompletedSection && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 font-normal text-slate-600">
                    {sec.questions.length}Q
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Timer & Exam Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Auto-save Status Indicator */}
          {lastSavedTime && (
            <div
              id="autosave-status-indicator"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs transition-colors"
              title="State automatically saved to LocalStorage"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isAutoSaving ? 'bg-indigo-600 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-600">
                {isAutoSaving ? 'Auto-saving...' : `Saved at ${lastSavedTime}`}
              </span>
            </div>
          )}

          {/* Keyboard Shortcuts Help Button */}
          <button
            id="toggle-shortcuts-btn"
            onClick={() => setShowKeyboardHelp((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showKeyboardHelp
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="View active keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono text-slate-600 font-bold">
              ?
            </kbd>
          </button>

          {/* Scientific Calculator button (Shown if permitted by Exam Rules Engine) */}
          {rules.hasOnscreenCalculator && (
            <button
              id="toggle-calculator-btn"
              onClick={() => setShowCalculator((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showCalculator
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title={`Open ${template.shortName} Calculator (K)`}
            >
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
          )}

          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="View Exam Instructions (I)"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Instructions</span>
          </button>

          {/* Section Timer Display */}
          <div
            className={`flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-mono font-bold text-base sm:text-lg ${
              isTimeCritical ? 'animate-pulse bg-rose-100/80' : ''
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Submit Test Button */}
          <button
            id="submit-exam-trigger-btn"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Examination Workspace: Split Passage/Question + Question Palette */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Question & Passage Pane */}
        <main className="w-full lg:w-[72%] flex flex-col bg-white overflow-y-auto px-6 sm:px-12 py-8">
          {/* Question Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold tracking-wider uppercase">
                QUESTION {currentQuestionIndex + 1} • {currentQuestion?.topic || currentSection?.name}
              </div>
              <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {currentQuestion?.type}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span>
                Correct: <strong className="text-emerald-600 font-bold">+{currentQuestion?.marks || 3}</strong>
              </span>
              <span>
                Negative: <strong className="text-rose-600 font-bold">-{currentQuestion?.type === 'MCQ' ? currentQuestion?.negativeMarks || 1 : 0}</strong>
              </span>
            </div>
          </div>

          {/* Scrollable Question and Passage Workspace */}
          <div className="space-y-6">
            {/* If question belongs to a Reading Comprehension passage or DILR set */}
            {currentQuestion?.passage && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    {currentQuestion.passageTitle || 'Comprehension Context / Problem Set Data'}
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Reference Context
                  </span>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-serif">
                  {currentQuestion.passage}
                </div>
                {/* Diagram/Vector SVG if attached to passage */}
                {currentQuestion.diagramSvg && (
                  <div
                    className="pt-2 overflow-x-auto flex justify-center"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }}
                  />
                )}
              </div>
            )}

            {/* Standalone Question Diagram if attached directly to question */}
            {!currentQuestion?.passage && currentQuestion?.diagramSvg && (
              <div
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto flex justify-center"
                dangerouslySetInnerHTML={{ __html: currentQuestion.diagramSvg }}
              />
            )}

            {/* Question Statement */}
            <div className="prose prose-slate max-w-none">
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                {currentQuestion?.questionText}
              </p>
            </div>

            {/* Options Area: MCQ vs TITA */}
            <div className="pt-2">
              {currentQuestion?.type === 'MCQ' && currentQuestion.options ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedAnswer === opt.id;
                    return (
                      <label
                        key={opt.id}
                        id={`option-${opt.id}`}
                        onClick={() => setSelectedAnswer(opt.id)}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors group ${
                          isSelected
                            ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                            : 'border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-2 border-indigo-600 bg-indigo-600'
                              : 'border-2 border-slate-300 group-hover:border-indigo-500'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-sm sm:text-base leading-relaxed">
                          ({opt.id}) {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                /* TITA: Type In The Answer Virtual Keypad & Input */
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Type In The Answer (TITA):
                    </label>
                    <input
                      id="tita-answer-input"
                      type="text"
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      placeholder="Enter integer, decimal or text..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-base font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Virtual Numeric Pad for TITA Convenience */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500">On-screen Keypad:</div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                      {['7', '8', '9', 'C', '4', '5', '6', 'Del', '1', '2', '3', '-', '0', '.', '00', 'Clear'].map(
                        (key) => (
                          <button
                            key={key}
                            onClick={() => {
                              if (key === 'C' || key === 'Clear') setSelectedAnswer('');
                              else if (key === 'Del') setSelectedAnswer((prev) => prev.slice(0, -1));
                              else setSelectedAnswer((prev) => prev + key);
                            }}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold transition text-center shadow-2xs cursor-pointer"
                          >
                            {key}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Clean Minimalist Question Palette */}
        <aside className="w-full lg:w-[28%] bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0">
          <QuestionPalette
            questions={currentQuestions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onSelectQuestion={(idx) => setCurrentQuestionIndex(idx)}
            onOpenQuestionPaper={() => setShowQuestionPaper(true)}
            onOpenInstructions={() => setShowInstructions(true)}
          />
        </aside>
      </div>

      {/* Bottom Minimalist CBT Action Footer Bar */}
      <footer className="h-20 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
        {/* Left Secondary Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="mark-review-btn"
            onClick={handleMarkForReviewAndNext}
            className="px-3.5 sm:px-6 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Mark for Review (R)"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span className="hidden xs:inline">Mark for Review</span>
            <span className="xs:hidden">Review</span>
          </button>

          <button
            id="clear-response-btn"
            onClick={handleClearResponse}
            className="px-3.5 sm:px-6 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Clear current selection (X)"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden xs:inline">Clear Response</span>
            <span className="xs:hidden">Clear</span>
          </button>
        </div>

        {/* Center: Non-intrusive Quick Shortcuts Footer Overlay Pill */}
        <button
          onClick={() => setShowKeyboardHelp(true)}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-600 font-medium transition-colors cursor-pointer"
          title="Click to view all keyboard shortcuts (?)"
        >
          <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Keys:</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">A-D</kbd> Select
            <span className="text-slate-300">•</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">S</kbd> Save & Next
            <span className="text-slate-300">•</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">R</kbd> Review
            <span className="text-slate-300">•</span>
            <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">?</kbd> All Hotkeys
          </span>
        </button>

        {/* Right Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 sm:px-8 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 cursor-pointer"
            title="Previous Question (P / ←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            id="save-next-btn"
            onClick={handleSaveAndNext}
            className="px-5 sm:px-8 py-2.5 bg-indigo-600 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Save & Next (S / Enter)"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Floating Authentic Scientific Calculator */}
      {showCalculator && <CatCalculator onClose={() => setShowCalculator(false)} />}

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && <KeyboardHelpModal onClose={() => setShowKeyboardHelp(false)} />}

      {/* Question Paper Overview Modal */}
      {showQuestionPaper && (
        <QuestionPaperModal
          mock={mock}
          currentSectionIndex={currentSectionIndex}
          onClose={() => setShowQuestionPaper(false)}
          onJumpToQuestion={(secIdx, qIdx) => {
            if (!isStrictSectionTimed || secIdx === currentSectionIndex) {
              setCurrentSectionIndex(secIdx);
              setCurrentQuestionIndex(qIdx);
            }
          }}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <InstructionsModal
          examType={mock.examType}
          onClose={() => setShowInstructions(false)}
        />
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitConfirmationModal
          mock={mock}
          answers={answers}
          totalSecondsRemaining={sectionTimeRemaining}
          onConfirmSubmit={finalizeSubmission}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

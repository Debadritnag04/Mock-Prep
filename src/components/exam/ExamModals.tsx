import React from 'react';
import { MockTest, Question, UserResponse } from '../../types';
import { X, AlertCircle, CheckCircle, Clock, BookOpen, Calculator, Keyboard, Sparkles, Command } from 'lucide-react';

interface QuestionPaperModalProps {
  mock: MockTest;
  currentSectionIndex: number;
  onClose: () => void;
  onJumpToQuestion: (sectionIndex: number, questionIndex: number) => void;
}

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({
  mock,
  currentSectionIndex,
  onClose,
  onJumpToQuestion,
}) => {
  const currentSection = mock.sections[currentSectionIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Question Paper Overview - {currentSection?.name}
            </h3>
            <p className="text-xs text-slate-500">Review all questions in the current active section</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-slate-100">
          {currentSection?.questions.map((q, idx) => (
            <div key={q.id} className="pt-4 first:pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  Q{idx + 1} ({q.type} | +{q.marks}, -{q.type === 'MCQ' ? q.negativeMarks : 0})
                </span>
                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Topic: {q.topic}
                </span>
              </div>

              {q.passage && (
                <div className="p-3 bg-slate-50 border-l-4 border-indigo-600 rounded text-xs text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto">
                  <div className="font-bold text-slate-900 mb-1">Passage Reference:</div>
                  {q.passage}
                </div>
              )}

              <div className="text-sm text-slate-800 font-normal whitespace-pre-line">{q.questionText}</div>

              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2"
                    >
                      <span className="font-bold text-indigo-600">({opt.id})</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    onJumpToQuestion(currentSectionIndex, idx);
                    onClose();
                  }}
                  className="text-xs px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium cursor-pointer shadow-xs"
                >
                  Solve Question {idx + 1} →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};

interface InstructionsModalProps {
  examType: string;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ examType, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Standard Examination Instructions ({examType})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">General Examination Rules</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>The clock will be set at the server. The countdown timer in the top right corner displays remaining time.</li>
              <li>When the timer reaches zero, the examination will automatically submit.</li>
              {examType === 'CAT' ? (
                <li className="text-amber-700 font-semibold">
                  Section Timer Lock: You will have strictly 40 minutes per section. When the section timer expires, the test automatically transitions to the next section and you cannot return to previous sections.
                </li>
              ) : (
                <li>Section Navigation: You can freely switch between sections at any time during the test.</li>
              )}
            </ul>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Marking Scheme (CAT & XAT)</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>MCQ Questions:</strong> +3 Marks for correct answer, -1 Mark for incorrect answer.</li>
              <li><strong>TITA (Non-MCQ) Questions:</strong> +3 Marks for correct answer, 0 Negative Marking.</li>
              <li><strong>Unattempted Questions:</strong> 0 Marks.</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Navigating & Answering</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Click <strong>Save & Next</strong> to record your answer and move to the next question.</li>
              <li>Click <strong>Clear Response</strong> to deselect a chosen option.</li>
              <li>Click <strong>Mark for Review & Next</strong> to flag the question for re-evaluation.</li>
              <li>An onscreen calculator is accessible at any time via the top toolbar.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

interface SubmitConfirmationModalProps {
  mock: MockTest;
  answers: Record<string, UserResponse>;
  totalSecondsRemaining: number;
  onConfirmSubmit: () => void;
  onCancel: () => void;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  mock,
  answers,
  totalSecondsRemaining,
  onConfirmSubmit,
  onCancel,
}) => {
  let totalAnswered = 0;
  let totalMarked = 0;
  let totalNotAnswered = 0;
  let totalQuestions = 0;

  mock.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      totalQuestions++;
      const resp = answers[q.id];
      if (resp?.state === 'answered' || resp?.state === 'answered_marked') {
        totalAnswered++;
      }
      if (resp?.state === 'marked_for_review' || resp?.state === 'answered_marked') {
        totalMarked++;
      }
      if (!resp || resp.state === 'not_answered' || resp.state === 'not_visited') {
        totalNotAnswered++;
      }
    });
  });

  const minutesLeft = Math.floor(totalSecondsRemaining / 60);
  const secondsLeft = totalSecondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">Submit Examination?</h3>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Are you sure you want to finish this mock exam? Once submitted, your scores, sectional analysis, and mistake notebook entries will be finalized deterministically.
        </p>

        {/* Summary Table */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
            <span>Total Questions</span>
            <span className="font-bold text-slate-900">{totalQuestions}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
            <span>Answered Questions</span>
            <span className="font-bold">{totalAnswered}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 text-purple-700">
            <span>Marked for Review</span>
            <span className="font-bold">{totalMarked}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
            <span>Unanswered / Unvisited</span>
            <span className="font-bold">{totalNotAnswered}</span>
          </div>
          <div className="flex justify-between py-1 text-slate-500">
            <span>Time Remaining</span>
            <span className="font-mono font-bold text-slate-900">
              {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Return to Test
          </button>
          <button
            id="confirm-final-submit-btn"
            onClick={onConfirmSubmit}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Yes, Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

interface KeyboardHelpModalProps {
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ onClose }) => {
  const shortcutGroups = [
    {
      title: 'MCQ Option Selection',
      description: 'Quickly select answers without moving your mouse cursor',
      items: [
        { keys: ['A', 'or', '1'], label: 'Select Option A / (1)' },
        { keys: ['B', 'or', '2'], label: 'Select Option B / (2)' },
        { keys: ['C', 'or', '3'], label: 'Select Option C / (3)' },
        { keys: ['D', 'or', '4'], label: 'Select Option D / (4)' },
      ],
    },
    {
      title: 'Action & Answering',
      description: 'Record, flag, or erase responses with instant feedback',
      items: [
        { keys: ['S', 'Enter'], label: 'Save & Next (Commit response and advance)' },
        { keys: ['R'], label: 'Mark for Review & Next (Flag for re-evaluation)' },
        { keys: ['X', 'or', 'Del'], label: 'Clear Response (Deselect chosen option)' },
      ],
    },
    {
      title: 'Question Navigation',
      description: 'Move through questions seamlessly',
      items: [
        { keys: ['P', '←'], label: 'Previous Question (Go to previous item)' },
        { keys: ['N', '→'], label: 'Next Question (Peek next without saving)' },
      ],
    },
    {
      title: 'Tools & Modals',
      description: 'Access exam utilities and reference dialogs',
      items: [
        { keys: ['K'], label: 'Toggle CAT Scientific Calculator' },
        { keys: ['J'], label: 'Question Paper Overview Grid' },
        { keys: ['I'], label: 'Exam Pattern Instructions' },
        { keys: ['?'], label: 'Toggle this Shortcuts Guide' },
        { keys: ['Esc'], label: 'Close active overlay / modal' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="keyboard-shortcuts-modal"
        className="bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                Active Keyboard Shortcuts & Speed Controls
              </h3>
              <p className="text-xs text-slate-500">
                Speed up your CBT test taking with native hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 cursor-pointer shadow-2xs"
            title="Close Help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pro-tip for CAT Aspirants:</span> Mastering keyboard shortcuts saves 3-5 seconds per question (~2.5 minutes per section), giving you more time for complex DILR and Quant computations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcutGroups.map((group) => (
              <div
                key={group.title}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {group.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{group.description}</p>
                </div>

                <div className="space-y-2">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-200/60 last:border-0"
                    >
                      <span className="text-slate-700 font-medium text-[11.5px] leading-tight">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) =>
                          k === 'or' ? (
                            <span key={kIdx} className="text-[10px] text-slate-400 font-medium">
                              or
                            </span>
                          ) : (
                            <kbd
                              key={kIdx}
                              className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 font-mono text-[11px] font-bold rounded shadow-2xs"
                            >
                              {k}
                            </kbd>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">?</kbd> at any point to toggle this overlay.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Got it, Back to Test
          </button>
        </div>
      </div>
    </div>
  );
};

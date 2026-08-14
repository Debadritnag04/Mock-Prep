import React from 'react';
import { Question, QuestionState, UserResponse } from '../../types';
import { CheckCircle2, Bookmark, Eye, HelpCircle, FileText, Check } from 'lucide-react';

interface QuestionPaletteProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, UserResponse>;
  onSelectQuestion: (index: number) => void;
  onOpenQuestionPaper: () => void;
  onOpenInstructions: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  onSelectQuestion,
  onOpenQuestionPaper,
  onOpenInstructions,
}) => {
  // Count states
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;
  let markedForReviewCount = 0;
  let answeredAndMarkedCount = 0;

  questions.forEach((q, idx) => {
    const resp = answers[q.id];
    const state: QuestionState = resp ? resp.state : 'not_visited';

    if (state === 'answered') answeredCount++;
    else if (state === 'not_answered') notAnsweredCount++;
    else if (state === 'marked_for_review') markedForReviewCount++;
    else if (state === 'answered_marked') answeredAndMarkedCount++;
    else notVisitedCount++;
  });

  const getQuestionButtonClass = (q: Question, idx: number) => {
    const isCurrent = idx === currentQuestionIndex;
    const resp = answers[q.id];
    const state: QuestionState = resp ? resp.state : 'not_visited';

    let baseClass =
      'relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs ';

    if (isCurrent) {
      baseClass += 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-50 bg-white text-indigo-600 font-black ';
    }

    switch (state) {
      case 'answered':
        return baseClass + 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold';
      case 'not_answered':
        return baseClass + 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold';
      case 'marked_for_review':
        return baseClass + 'bg-amber-400 hover:bg-amber-500 text-white font-bold';
      case 'answered_marked':
        return baseClass + 'bg-purple-600 hover:bg-purple-700 text-white font-bold';
      case 'not_visited':
      default:
        return baseClass + 'bg-slate-200 hover:bg-slate-300 text-slate-500 font-semibold';
    }
  };

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto bg-slate-50 text-slate-900">
      {/* Candidate Profile Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            CAT
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">Candidate: CAT Aspirant</div>
            <div className="text-[11px] text-slate-500 font-mono">Roll: 2025-CBT-9842</div>
          </div>
        </div>
      </div>

      {/* Palette Legend */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Palette Legend</div>
        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              {answeredCount}
            </span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-400 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              {markedForReviewCount}
            </span>
            <span>Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px]">
              {notAnsweredCount}
            </span>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
              {notVisitedCount}
            </span>
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <span className="relative w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              {answeredAndMarkedCount}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
            </span>
            <span>Answered & Marked</span>
          </div>
        </div>
      </div>

      {/* Grid of Questions */}
      <div className="p-4 sm:p-5 flex-1">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Question Grid</span>
          <span className="text-[11px] text-slate-400 font-mono font-normal">{questions.length} Total</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const resp = answers[q.id];
            const state: QuestionState = resp ? resp.state : 'not_visited';
            return (
              <button
                key={q.id}
                id={`palette-btn-${idx + 1}`}
                onClick={() => onSelectQuestion(idx)}
                className={getQuestionButtonClass(q, idx)}
                title={`Question ${idx + 1} (${q.type})`}
              >
                {idx + 1}
                {state === 'answered_marked' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Strategy Coach Tip box */}
      <div className="p-4 sm:p-5 bg-slate-100/70 border-t border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">CBT Strategy Tip</div>
            <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Round 1: Pick straight arithmetic / inference questions. Round 2: Tackle algebra & sets.
            </div>
          </div>
        </div>
      </div>

      {/* Utility Buttons */}
      <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={onOpenQuestionPaper}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-semibold border border-slate-200 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Paper View</span>
        </button>
        <button
          onClick={onOpenInstructions}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-semibold border border-slate-200 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Instructions</span>
        </button>
      </div>
    </div>
  );
};

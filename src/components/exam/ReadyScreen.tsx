import React from 'react';
import { MockTest } from '../../types';
import { ExamRulesEngine } from '../../rules/examEngine';
import {
  AlertTriangle,
  Clock,
  FileText,
  Layers,
  CheckCircle2,
  Calculator,
  ShieldAlert,
  ArrowLeft,
  Play,
  Award,
  Sparkles,
  Sliders
} from 'lucide-react';

interface ReadyScreenProps {
  mock: MockTest;
  onStartExam: () => void;
  onBack: () => void;
}

export const ReadyScreen: React.FC<ReadyScreenProps> = ({
  mock,
  onStartExam,
  onBack,
}) => {
  const template = ExamRulesEngine.getTemplate(mock.examType);
  const rules = mock.rules || template.rules;

  const totalQuestions = mock.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalDuration = mock.totalDurationMinutes || mock.sections.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-6 sm:px-8 py-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              {template.shortName} Simulation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {mock.examMode === 'custom_mock' ? 'Custom Configured Mock' : 'Official CBT Format'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rules Engine Verified</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Mock Title */}
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mock.title}
            </h1>
            <p className="text-sm text-slate-400">
              {mock.description || `${template.name} examination pattern with live simulation rules.`}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-700/70 p-4 rounded-xl text-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Questions
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalQuestions}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/70 p-4 rounded-xl text-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Total Time
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalDuration} <span className="text-sm font-semibold text-slate-400">min</span>
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/70 p-4 rounded-xl text-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Sections
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {mock.sections.length}
              </span>
            </div>
          </div>

          {/* Sectional Timing Breakdown Table */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Sectional Breakdown</span>
              <span>Duration & Questions</span>
            </div>

            <div className="divide-y divide-slate-800">
              {mock.sections.map((section, idx) => (
                <div
                  key={section.id || idx}
                  className="px-4 py-3 flex items-center justify-between text-sm hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {section.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                    <span className="text-slate-400">
                      {section.questions.length} Qs
                    </span>
                    <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/50">
                      {section.durationMinutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marking Rules Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-900/40 border border-slate-700/40 p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                <strong>MCQ Scheme:</strong> +{rules.scoring.mcqMarks} Marks (Correct), -{rules.scoring.mcqNegativeMarks} Marks (Wrong)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>
                <strong>TITA / Numeric:</strong> +{rules.scoring.titaMarks} Marks, -{rules.scoring.titaNegativeMarks} Negative
              </span>
            </div>
          </div>

          {/* Unattempted Warning if configured (e.g. XAT) */}
          {rules.scoring.unattemptedPenalty > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Unattempted Question Penalty Active:</strong> -{rules.scoring.unattemptedPenalty} marks per unattempted question after {rules.scoring.unattemptedFreeLimit} skipped questions.
              </span>
            </div>
          )}

          {/* Critical Timer Notice Warning Box */}
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-300 text-sm">
                ⚠ Once the test starts, the timer cannot be paused.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Ensure you have a quiet environment and stable setup. Section timing is{' '}
                {rules.isStrictSectionTimed ? 'strictly locked per section' : 'managed as a shared time pool'} and progress is auto-saved locally.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-slate-900/90 border-t border-slate-700/80 px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Setup</span>
          </button>

          <button
            id="ready-screen-start-btn"
            onClick={onStartExam}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};


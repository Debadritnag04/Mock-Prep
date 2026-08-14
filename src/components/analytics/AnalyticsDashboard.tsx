import React, { useState, useEffect } from 'react';
import { UserAttempt, Question, MockTest, MistakeEntry, SectionScoreSummary } from '../../types';
import { StorageService } from '../../utils/storage';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  RotateCcw,
  BookOpen,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface AnalyticsDashboardProps {
  attempt: UserAttempt;
  mock: MockTest;
  onRetake: () => void;
  onOpenMistakeNotebook: () => void;
  onOpenAiCoach: () => void;
  onBackToHome: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  attempt,
  mock,
  onRetake,
  onOpenMistakeNotebook,
  onOpenAiCoach,
  onBackToHome,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Trigger celebration if high score
  useEffect(() => {
    if (attempt.percentileEstimate >= 90) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.percentileEstimate]);

  // Collect all questions
  const allQuestions: Question[] = [];
  mock.sections.forEach((sec) => allQuestions.push(...sec.questions));

  // Prepare chart data for sectional scores
  const sectionalChartData = (Object.values(attempt.sectionalScores) as SectionScoreSummary[]).map((sec) => ({
    name: sec.sectionId,
    Score: sec.score,
    Accuracy: sec.accuracy,
    Attempted: sec.attempted,
    Total: sec.totalQuestions,
  }));

  // Topic wise performance map
  const topicStats: Record<string, { topic: string; total: number; correct: number; incorrect: number; unattempted: number }> = {};

  allQuestions.forEach((q) => {
    const t = q.topic || 'General';
    if (!topicStats[t]) {
      topicStats[t] = { topic: t, total: 0, correct: 0, incorrect: 0, unattempted: 0 };
    }
    topicStats[t].total++;

    const resp = attempt.answers[q.id];
    if (!resp || !resp.answer || resp.answer.trim() === '') {
      topicStats[t].unattempted++;
    } else if (resp.isCorrect) {
      topicStats[t].correct++;
    } else {
      topicStats[t].incorrect++;
    }
  });

  const topicChartData = Object.values(topicStats).map((ts) => ({
    topic: ts.topic,
    Accuracy: ts.total > 0 ? Math.round((ts.correct / (ts.correct + ts.incorrect || 1)) * 100) : 0,
    Correct: ts.correct,
    Incorrect: ts.incorrect,
  }));

  // Filtered questions for review
  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedSectionFilter !== 'all' && q.sectionId !== selectedSectionFilter) return false;

    const resp = attempt.answers[q.id];
    const isAnswered = resp && resp.answer && resp.answer.trim() !== '';

    if (filterType === 'correct') return resp?.isCorrect;
    if (filterType === 'incorrect') return isAnswered && !resp?.isCorrect;
    if (filterType === 'unattempted') return !isAnswered;
    return true;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Banner / Summary Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
              {attempt.examType} Performance Report
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Completed: {new Date(attempt.completedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{attempt.mockTitle}</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Deterministic Evaluation & Deep Performance Diagnostics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAiCoach}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Strategy Coach</span>
          </button>
          <button
            onClick={onOpenMistakeNotebook}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>Mistake Notebook</span>
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Exit to Home
          </button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Score */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Overall Score</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {attempt.totalScore}
              <span className="text-xs text-slate-400 font-normal ml-1">/ {attempt.maxScore}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Raw scaled assessment</div>
          </div>
        </div>

        {/* Estimated Percentile */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estimated Percentile</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
              {attempt.percentileEstimate}%ile
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Based on historical CAT/XAT curves</div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {attempt.accuracy}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Target: 80%+ for 99th percentile
            </div>
          </div>
        </div>

        {/* Total Time Spent */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {formatDuration(attempt.totalTimeSeconds)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Avg {allQuestions.length > 0 ? Math.round(attempt.totalTimeSeconds / allQuestions.length) : 0}s / question
            </div>
          </div>
        </div>
      </div>

      {/* Sectional Performance Breakdown Grid */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Sectional Diagnostic Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(attempt.sectionalScores) as SectionScoreSummary[]).map((sec) => (
            <div
              key={sec.sectionId}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{sec.sectionName}</h3>
                  <span className="text-xs text-slate-400 font-mono">({sec.sectionId})</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600 font-mono">{sec.score} pts</div>
                  <div className="text-[10px] text-slate-500">Accuracy: {sec.accuracy}%</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                  <div className="text-emerald-700 font-bold text-sm">{sec.correct}</div>
                  <div className="text-[10px] text-emerald-600">Correct</div>
                </div>
                <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-200">
                  <div className="text-rose-700 font-bold text-sm">{sec.incorrect}</div>
                  <div className="text-[10px] text-rose-600">Wrong</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="text-slate-600 font-bold text-sm">{sec.unattempted}</div>
                  <div className="text-[10px] text-slate-400">Skipped</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Time Spent:</span>
                <span className="font-mono text-slate-800 font-medium">{formatDuration(sec.timeSpentSeconds)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Chart: Topic Mastery */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          Topic & Subtopic Accuracy Matrix
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="topic" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Bar dataKey="Accuracy" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question by Question Detailed Review */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Detailed Question Solutions & Explanations
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${filterType === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                All ({allQuestions.length})
              </button>
              <button
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${filterType === 'correct' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Correct
              </button>
              <button
                onClick={() => setFilterType('incorrect')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${filterType === 'incorrect' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Incorrect
              </button>
              <button
                onClick={() => setFilterType('unattempted')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${filterType === 'unattempted' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Unattempted
              </button>
            </div>

            {/* Section Filter */}
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Sections</option>
              {mock.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const resp = attempt.answers[q.id];
            const isAnswered = resp && resp.answer && resp.answer.trim() !== '';
            const isCorrect = resp?.isCorrect;
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${
                  isCorrect
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : isAnswered
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Bar */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isAnswered
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Q{q.questionNumber || idx + 1} ({q.sectionId})
                        </span>
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {q.topic}
                        </span>
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Type: {q.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {q.questionText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{q.marks})
                        </span>
                      ) : isAnswered ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect (-{q.type === 'MCQ' ? q.negativeMarks : 0})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Unattempted (0)</span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Solution Pane */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-4 text-xs sm:text-sm">
                    {/* Passage Context if applicable */}
                    {q.passage && (
                      <div className="p-3.5 bg-white border-l-4 border-indigo-600 rounded-lg text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto shadow-2xs">
                        <div className="font-bold text-slate-900 mb-1">
                          {q.passageTitle || 'Comprehension / Set Passage'}:
                        </div>
                        {q.passage}
                      </div>
                    )}

                    {/* Diagram preview if applicable */}
                    {q.diagramSvg && (
                      <div
                        className="bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto flex justify-center shadow-2xs"
                        dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                      />
                    )}

                    {/* Full Question Statement */}
                    <div className="font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                      {q.questionText}
                    </div>

                    {/* Options List */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isUserChoice = resp?.answer === opt.id;
                          const isCorrectOption = q.correctAnswer === opt.id;

                          let optionClass = 'p-3 rounded-xl border text-xs flex items-start gap-2.5 ';
                          if (isCorrectOption) {
                            optionClass += 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium';
                          } else if (isUserChoice && !isCorrectOption) {
                            optionClass += 'bg-rose-50 border-rose-300 text-rose-900 font-medium';
                          } else {
                            optionClass += 'bg-white border-slate-200 text-slate-700';
                          }

                          return (
                            <div key={opt.id} className={optionClass}>
                              <span className="font-bold">({opt.id})</span>
                              <div className="flex-1">{opt.text}</div>
                              {isCorrectOption && (
                                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  Correct Answer
                                </span>
                              )}
                              {isUserChoice && !isCorrectOption && (
                                <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* For TITA Questions: Show Expected vs User Value */}
                    {q.type === 'TITA' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
                          <span className="text-slate-500 block mb-1">Your Answer:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {resp?.answer || 'Not Attempted'}
                          </span>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                          <span className="text-emerald-700 block mb-1 font-semibold">Official Key:</span>
                          <span className="font-mono font-bold text-emerald-800">
                            {q.correctAnswer}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Mathematical / Logical Explanation */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                      <div className="font-bold text-xs uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                        <Brain className="w-4 h-4" />
                        Step-by-Step Official Solution
                      </div>
                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

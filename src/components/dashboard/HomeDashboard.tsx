import React, { useState, useEffect } from 'react';
import { MockTest, UserAttempt, ExamType, Question } from '../../types';
import { StorageService } from '../../utils/storage';
import {
  Trophy,
  Target,
  Clock,
  Play,
  UploadCloud,
  Brain,
  BookOpen,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Filter,
  BarChart2,
  RotateCcw
} from 'lucide-react';

interface HomeDashboardProps {
  onStartExam: (mock: MockTest) => void;
  onResumeExam?: (mock: MockTest, attempt: UserAttempt) => void;
  onOpenPdfUpload: () => void;
  onOpenMistakeNotebook: () => void;
  onOpenAiCoach: () => void;
  onViewAttemptReport: (attempt: UserAttempt, mock: MockTest) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartExam,
  onResumeExam,
  onOpenPdfUpload,
  onOpenMistakeNotebook,
  onOpenAiCoach,
  onViewAttemptReport,
}) => {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<UserAttempt | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'full' | 'sectional' | 'custom'>('all');
  const [filterExam, setFilterExam] = useState<'all' | 'CAT' | 'XAT'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMocks = StorageService.getMocks();
    const allAttempts = StorageService.getAttempts();
    const savedActive = StorageService.getActiveAttempt();
    setMocks(allMocks);
    setAttempts(allAttempts);
    setActiveAttempt(savedActive);
  };

  // High level stats
  const totalMocksTaken = attempts.length;
  const bestPercentile = attempts.reduce(
    (max, a) => (a.percentileEstimate > max ? a.percentileEstimate : max),
    0
  );
  const avgAccuracy =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.accuracy, 0) / attempts.length)
      : 0;
  const unmasteredMistakesCount = StorageService.getMistakes().filter((m) => !m.mastered).length;

  const filteredMocks = mocks.filter((m) => {
    if (filterExam !== 'all' && m.examType !== filterExam) return false;
    if (filterType === 'full' && m.sections.length <= 1) return false;
    if (filterType === 'sectional' && m.sections.length > 1) return false;
    if (filterType === 'custom' && m.isPreloaded) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                CAT & XAT CBT Pro
              </h1>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                Exam Simulator
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clean CBT Testing Interface • PDF/OCR Ingestion • AI Strategy Coach
            </p>
          </div>
        </div>

        {/* Global Action Quick Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenPdfUpload}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Ingest PDF Mock</span>
          </button>

          <button
            onClick={onOpenMistakeNotebook}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>Mistakes ({unmasteredMistakesCount})</span>
          </button>

          <button
            onClick={onOpenAiCoach}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Coach</span>
          </button>
        </div>
      </header>

      {/* Hero Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tests Attempted</span>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalMocksTaken}</div>
            <div className="text-[11px] text-slate-500 mt-1">Full & Sectional Mocks</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Peak Percentile</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {bestPercentile > 0 ? `${bestPercentile}%ile` : '--'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">CAT Scaled Score Trajectory</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {avgAccuracy > 0 ? `${avgAccuracy}%` : '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across all attempted questions</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Mistakes</span>
            <BookOpen className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600">
              {unmasteredMistakesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting retry drill</div>
          </div>
        </div>
      </div>

      {/* In-Progress Interrupted Mock Resume Banner */}
      {activeAttempt && (
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/50 border border-indigo-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Saved Attempt In Progress
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeAttempt.lastSavedAt
                    ? `Auto-saved at ${new Date(activeAttempt.lastSavedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}`
                    : 'Auto-saved locally'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {activeAttempt.mockTitle || 'CAT / XAT Simulation'}
              </h3>
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
                <span>
                  Section:{' '}
                  <strong>
                    {mocks.find((m) => m.id === activeAttempt.mockId)?.sections[
                      activeAttempt.currentSectionIndex || 0
                    ]?.name || 'Current Section'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Responses:{' '}
                  <strong>
                    {Object.values(activeAttempt.answers || {}).filter((a) => Boolean(a && typeof a === 'object' && 'answer' in a && a.answer)).length} answered
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Elapsed:{' '}
                  <strong>{Math.floor((activeAttempt.totalTimeSeconds || 0) / 60)} mins</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to discard this in-progress mock? Your saved progress will be cleared.'
                  )
                ) {
                  StorageService.saveActiveAttempt(null);
                  setActiveAttempt(null);
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
            >
              Discard
            </button>

            <button
              onClick={() => {
                const targetMock = mocks.find((m) => m.id === activeAttempt.mockId);
                if (targetMock) {
                  if (onResumeExam) {
                    onResumeExam(targetMock, activeAttempt);
                  } else {
                    onStartExam(targetMock);
                  }
                }
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Mock Library Section */}
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              CBT Mock Test Library
            </h2>
            <p className="text-xs text-slate-500">
              Standard 120-min CAT simulations, XAT papers, section sprints, and custom uploaded mocks.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
              <button
                onClick={() => setFilterExam('all')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterExam === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Exams
              </button>
              <button
                onClick={() => setFilterExam('CAT')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterExam === 'CAT' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                CAT
              </button>
              <button
                onClick={() => setFilterExam('XAT')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterExam === 'XAT' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                XAT
              </button>
            </div>

            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Tests
              </button>
              <button
                onClick={() => setFilterType('full')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'full' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Full Length
              </button>
              <button
                onClick={() => setFilterType('sectional')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'sectional' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sectionals
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'custom' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Uploaded
              </button>
            </div>
          </div>
        </div>

        {/* Mock Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMocks.map((mock) => {
            const totalQCount = mock.sections.reduce((acc, s) => acc + s.questions.length, 0);
            const totalDuration = mock.totalDurationMinutes || mock.sections.reduce((acc, s) => acc + s.durationMinutes, 0);

            // Check if user already took this mock
            const mockAttempts = attempts.filter((a) => a.mockId === mock.id);
            const latestAttempt = mockAttempts[mockAttempts.length - 1];

            return (
              <div
                key={mock.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                        mock.examType === 'CAT'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {mock.examType} {mock.sections.length > 1 ? 'Full Mock' : 'Sectional'}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      {mock.year} {mock.slot ? `• ${mock.slot}` : ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {mock.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {mock.description}
                    </p>
                  </div>

                  {/* Section Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {mock.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className="text-[10px] px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200/80"
                      >
                        {sec.name.split(' ')[0]}: {sec.questions.length}Q
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalDuration} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalQCount} Questions</span>
                    </div>
                    <div className="text-emerald-600 font-semibold">
                      +{mock.examType === 'CAT' ? 3 : 1} / -{mock.examType === 'CAT' ? 1 : 0.25}
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="pt-2 border-t border-slate-100">
                  {latestAttempt ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500">Previous Score:</span>
                        <span className="font-bold text-indigo-700 font-mono">
                          {latestAttempt.totalScore} pts ({latestAttempt.percentileEstimate}%ile)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onViewAttemptReport(latestAttempt, mock)}
                          className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer shadow-2xs"
                        >
                          View Analysis
                        </button>
                        <button
                          onClick={() => onStartExam(mock)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      id={`start-mock-btn-${mock.id}`}
                      onClick={() => onStartExam(mock)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Live Exam Simulation</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts History Table */}
      {attempts.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Previous Exam Attempts History
          </h2>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Mock Title</th>
                    <th className="p-3.5">Exam</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Accuracy</th>
                    <th className="p-3.5">Est. Percentile</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attempts.map((att) => {
                    const targetMock = mocks.find((m) => m.id === att.mockId) || mocks[0];
                    return (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{att.mockTitle}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                            {att.examType}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 font-mono">
                          {att.totalScore} / {att.maxScore}
                        </td>
                        <td className="p-3.5 font-semibold text-emerald-600">{att.accuracy}%</td>
                        <td className="p-3.5 font-bold text-indigo-600 font-mono">
                          {att.percentileEstimate}%ile
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(att.completedAt || att.startedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onViewAttemptReport(att, targetMock)}
                            className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-indigo-600 rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            Review & Solutions →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

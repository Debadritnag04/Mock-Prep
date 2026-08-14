import React, { useState, useEffect } from 'react';
import { MistakeEntry, Question } from '../../types';
import { StorageService } from '../../utils/storage';
import {
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Search,
  Tag,
  MessageSquare,
  AlertTriangle,
  Play,
  Check,
  Brain
} from 'lucide-react';

interface MistakeNotebookProps {
  onStartMistakePractice: (mistakeQuestions: Question[]) => void;
  onBackToHome: () => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  onStartMistakePractice,
  onBackToHome,
}) => {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterMastery, setFilterMastery] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Retry state for single question in notebook
  const [activeRetryId, setActiveRetryId] = useState<string | null>(null);
  const [retryAnswer, setRetryAnswer] = useState<string>('');
  const [retryResult, setRetryResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  // Student note edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = () => {
    const list = StorageService.getMistakes();
    setMistakes(list);
  };

  const handleUpdateCategory = (mistake: MistakeEntry, category: MistakeEntry['category']) => {
    const updated = { ...mistake, category };
    StorageService.updateMistake(updated);
    loadMistakes();
  };

  const handleSaveNote = (mistake: MistakeEntry) => {
    const updated = { ...mistake, userNote: noteText };
    StorageService.updateMistake(updated);
    setEditingNoteId(null);
    loadMistakes();
  };

  const handleToggleMastery = (mistake: MistakeEntry) => {
    const updated = { ...mistake, mastered: !mistake.mastered };
    StorageService.updateMistake(updated);
    loadMistakes();
  };

  const handleVerifyRetry = (mistake: MistakeEntry) => {
    const q = mistake.question;
    const isCorrect =
      q.type === 'MCQ'
        ? retryAnswer.toUpperCase() === q.correctAnswer.toUpperCase()
        : retryAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() ||
          parseFloat(retryAnswer) === parseFloat(q.correctAnswer);

    if (isCorrect) {
      setRetryResult({
        isCorrect: true,
        feedback: 'Correct! Excellent recovery. You have mastered this question.',
      });
      const updated: MistakeEntry = {
        ...mistake,
        mastered: true,
        retryCount: mistake.retryCount + 1,
        lastRetriedAt: new Date().toISOString(),
      };
      StorageService.updateMistake(updated);
      loadMistakes();
    } else {
      setRetryResult({
        isCorrect: false,
        feedback: `Incorrect. Expected answer is ${q.correctAnswer}. Review the formula below.`,
      });
    }
  };

  // Filter list
  const filteredMistakes = mistakes.filter((m) => {
    if (filterSection !== 'all' && m.question.sectionId !== filterSection) return false;
    if (filterMastery === 'unmastered' && m.mastered) return false;
    if (filterMastery === 'mastered' && !m.mastered) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTopic = m.question.topic?.toLowerCase().includes(q);
      const matchText = m.question.questionText?.toLowerCase().includes(q);
      const matchMock = m.mockTitle?.toLowerCase().includes(q);
      return matchTopic || matchText || matchMock;
    }
    return true;
  });

  const unmasteredCount = mistakes.filter((m) => !m.mastered).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider">
              Preparation Growth Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {unmasteredCount} Active Unmastered Mistakes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-rose-600" />
            My Mistakes Notebook
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Catalog of all incorrect questions with self-reflection notes and interactive retry drills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {unmasteredCount > 0 && (
            <button
              onClick={() => {
                const unmasteredQuestions = mistakes.filter((m) => !m.mastered).map((m) => m.question);
                onStartMistakePractice(unmasteredQuestions);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Retry Active Mistakes Quiz ({unmasteredCount}Q)</span>
            </button>
          )}

          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Section Filter */}
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Sections (VARC, DILR, QA)</option>
            <option value="VARC">VARC Only</option>
            <option value="DILR">DILR Only</option>
            <option value="QA">QA Only</option>
            <option value="DM">Decision Making Only</option>
          </select>

          {/* Mastery Filter */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterMastery('unmastered')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filterMastery === 'unmastered' ? 'bg-rose-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Active Mistakes ({unmasteredCount})
            </button>
            <button
              onClick={() => setFilterMastery('mastered')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filterMastery === 'mastered' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mastered
            </button>
            <button
              onClick={() => setFilterMastery('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filterMastery === 'all' ? 'bg-indigo-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({mistakes.length})
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, formula, mock..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Mistakes Card Grid / List */}
      <div className="max-w-7xl mx-auto space-y-4">
        {filteredMistakes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Mistakes Found in This Category</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Take full mocks or sectional tests to automatically log incorrect problems here for focused revision.
            </p>
          </div>
        ) : (
          filteredMistakes.map((m) => {
            const q = m.question;
            const isRetrying = activeRetryId === m.id;

            return (
              <div
                key={m.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                  m.mastered
                    ? 'border-emerald-200 bg-slate-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                      {q.sectionId}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">Topic: {q.topic}</span>
                    <span className="text-xs text-slate-400">• {m.mockTitle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Error Category Selector */}
                    <select
                      value={m.category || 'conceptual'}
                      onChange={(e) => handleUpdateCategory(m, e.target.value as MistakeEntry['category'])}
                      className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="conceptual">🧠 Conceptual Gap</option>
                      <option value="calculation">🔢 Calculation Error</option>
                      <option value="misread">👀 Misread Question</option>
                      <option value="time_pressure">⏱️ Time Pressure</option>
                      <option value="guessed">🎲 Blind Guess</option>
                    </select>

                    <button
                      onClick={() => handleToggleMastery(m)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        m.mastered
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m.mastered ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{m.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-xs sm:text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-line">
                  {q.questionText}
                </div>

                {/* Diagram if present */}
                {q.diagramSvg && (
                  <div
                    className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-x-auto flex justify-center max-w-sm"
                    dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                  />
                )}

                {/* Comparison Box: Your Wrong Answer vs Correct Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                    <span className="text-rose-700 font-bold block mb-1">Your Exam Attempt:</span>
                    <span className="font-mono text-rose-900 font-medium">
                      Option ({m.userAnswer || 'Blank'}) — Incorrect
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <span className="text-emerald-700 font-bold block mb-1">Correct Answer:</span>
                    <span className="font-mono text-emerald-900 font-medium">Option ({q.correctAnswer})</span>
                  </div>
                </div>

                {/* Student Personal Reflection Note */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      My Reflection & Takeaway Note:
                    </span>
                    {editingNoteId !== m.id && (
                      <button
                        onClick={() => {
                          setEditingNoteId(m.id);
                          setNoteText(m.userNote || '');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                      >
                        {m.userNote ? 'Edit Note' : '+ Add Reflection'}
                      </button>
                    )}
                  </div>

                  {editingNoteId === m.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write down why you got this wrong, shortcut formula to remember, or trap to avoid..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(m)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          Save Reflection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      {m.userNote || 'No reflection added yet. Add a note explaining the trap or concept gap.'}
                    </p>
                  )}
                </div>

                {/* Interactive In-Place Retry Module */}
                <div className="border-t border-slate-100 pt-3">
                  {!isRetrying ? (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActiveRetryId(m.id);
                          setRetryAnswer('');
                          setRetryResult(null);
                        }}
                        className="text-xs font-bold px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Interactive Retry in Notebook</span>
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Retried: {m.retryCount} times
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="font-bold text-xs text-slate-800">
                        Solve Again Without Looking at the Answer:
                      </div>

                      {q.type === 'MCQ' && q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setRetryAnswer(opt.id)}
                              className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                                retryAnswer === opt.id
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                              }`}
                            >
                              <span className="font-bold">({opt.id})</span>
                              <span className="truncate">{opt.text}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={retryAnswer}
                          onChange={(e) => setRetryAnswer(e.target.value)}
                          placeholder="Type in your re-calculated answer..."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setActiveRetryId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Close Retry
                        </button>
                        <button
                          onClick={() => handleVerifyRetry(m)}
                          disabled={!retryAnswer}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          Verify Answer
                        </button>
                      </div>

                      {retryResult && (
                        <div
                          className={`p-3 rounded-lg border text-xs font-semibold ${
                            retryResult.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-rose-50 border-rose-300 text-rose-800'
                          }`}
                        >
                          {retryResult.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

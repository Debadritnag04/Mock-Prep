import React, { useState, useEffect, useMemo } from 'react';
import { UserAttempt, Question, MockTest, SectionScoreSummary, QuestionOption } from '../../types';
import {
  Trophy, Target, Clock, CheckCircle2, XCircle, AlertCircle, BarChart3,
  Bookmark, ChevronDown, ChevronUp, Sparkles, TrendingUp, Brain,
  BookOpen, Calculator, FastForward, PlayCircle, MinusCircle, Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

type TabView = 'OVERVIEW' | 'QUESTIONS' | 'TOPICS' | 'TIME' | 'REVIEW';

interface AnalyticsDashboardProps {
  attempt: UserAttempt;
  mock: MockTest;
  onRetake: () => void;
  onOpenMistakeNotebook: () => void;
  onOpenAiCoach: () => void;
  onBackToHome: () => void;
}

const PercentileEstimatorTool = ({ defaultScore }: { defaultScore: number }) => {
  const [examType, setExamType] = useState('CAT');
  const [score, setScore] = useState<string>(defaultScore.toString());
  const [estimatedPercentile, setEstimatedPercentile] = useState<number | null>(null);

  const calculatePercentile = () => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return;
    
    // Very basic historical heuristic for estimation
    let est = 0;
    if (examType === 'CAT') {
      if (numScore >= 100) est = 99.9;
      else if (numScore >= 80) est = 99.0;
      else if (numScore >= 65) est = 95.0;
      else if (numScore >= 50) est = 90.0;
      else if (numScore >= 35) est = 80.0;
      else if (numScore >= 20) est = 60.0;
      else est = Math.max(0, numScore * 1.5);
    } else {
      if (numScore >= 45) est = 99.0;
      else if (numScore >= 35) est = 95.0;
      else if (numScore >= 28) est = 90.0;
      else if (numScore >= 20) est = 80.0;
      else est = Math.max(0, numScore * 2.5);
    }
    
    // Add some variance based on exact score
    const variance = (numScore % 10) / 10;
    est = Math.min(99.99, est + variance);
    setEstimatedPercentile(est);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-indigo-500" />
        Percentile Estimator Tool
      </h3>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Exam</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CAT">CAT</option>
              <option value="XAT">XAT</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Overall Score</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <button
          onClick={calculatePercentile}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs mb-4"
        >
          Calculate
        </button>

        {estimatedPercentile !== null && (
          <div className="mt-auto p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">Estimated Overall</div>
            <div className="text-2xl font-black text-indigo-700 font-mono">
              {estimatedPercentile.toFixed(2)} <span className="text-sm font-bold">%ile</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  attempt,
  mock,
  onRetake,
  onOpenMistakeNotebook,
  onOpenAiCoach,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<TabView>('OVERVIEW');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [aiExplanationMode, setAiExplanationMode] = useState<Record<string, string>>({});

  // Trigger celebration if high score
  useEffect(() => {
    if (attempt.percentileEstimate >= 90) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.percentileEstimate]);

  // Aggregate questions
  const allQuestions: Question[] = useMemo(() => {
    const qs: Question[] = [];
    mock.sections.forEach((sec) => qs.push(...sec.questions));
    return qs;
  }, [mock]);

  // Topic wise performance map
  const topicStats = useMemo(() => {
    const stats: Record<string, { topic: string; total: number; correct: number; incorrect: number; unattempted: number; totalTimeSeconds: number }> = {};
    allQuestions.forEach((q) => {
      const t = q.topic || 'General';
      if (!stats[t]) {
        stats[t] = { topic: t, total: 0, correct: 0, incorrect: 0, unattempted: 0, totalTimeSeconds: 0 };
      }
      stats[t].total++;

      const resp = attempt.answers[q.id];
      if (!resp || !resp.answer || resp.answer.trim() === '') {
        stats[t].unattempted++;
      } else if (resp.isCorrect) {
        stats[t].correct++;
      } else {
        stats[t].incorrect++;
      }

      if (resp?.timeSpentSeconds) {
        stats[t].totalTimeSeconds += resp.timeSpentSeconds;
      }
    });
    return stats;
  }, [allQuestions, attempt.answers]);

  const topicChartData = useMemo(() => {
    return Object.values(topicStats).map((ts: any) => ({
      topic: ts.topic,
      Accuracy: ts.total > ts.unattempted ? Math.round((ts.correct / (ts.correct + ts.incorrect)) * 100) : 0,
      Correct: ts.correct,
      Incorrect: ts.incorrect,
      Unattempted: ts.unattempted,
      totalTimeSeconds: ts.totalTimeSeconds,
      total: ts.total,
    }));
  }, [topicStats]);

  const weakestTopic = [...topicChartData].sort((a, b) => a.Accuracy - b.Accuracy)[0];
  const strongestTopic = [...topicChartData].sort((a, b) => b.Accuracy - a.Accuracy)[0];

  // Time metrics
  const timeMetrics = useMemo(() => {
    let fastest = Infinity;
    let slowest = 0;
    let correctTimeSum = 0;
    let wrongTimeSum = 0;
    let correctCount = 0;
    let wrongCount = 0;

    allQuestions.forEach(q => {
      const resp = attempt.answers[q.id];
      if (resp && resp.timeSpentSeconds > 0) {
        if (resp.timeSpentSeconds < fastest) fastest = resp.timeSpentSeconds;
        if (resp.timeSpentSeconds > slowest) slowest = resp.timeSpentSeconds;
        
        if (resp.isCorrect) {
          correctTimeSum += resp.timeSpentSeconds;
          correctCount++;
        } else if (resp.answer && resp.answer.trim() !== '') {
          wrongTimeSum += resp.timeSpentSeconds;
          wrongCount++;
        }
      }
    });

    return {
      fastest: fastest === Infinity ? 0 : fastest,
      slowest,
      average: allQuestions.length > 0 ? Math.round(attempt.totalTimeSeconds / allQuestions.length) : 0,
      avgCorrect: correctCount > 0 ? Math.round(correctTimeSum / correctCount) : 0,
      avgWrong: wrongCount > 0 ? Math.round(wrongTimeSum / wrongCount) : 0,
    };
  }, [allQuestions, attempt]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId: string) => {
    const resp = attempt.answers[qId];
    if (!resp || !resp.answer || resp.answer.trim() === '') return 'UNATTEMPTED';
    return resp.isCorrect ? 'CORRECT' : 'WRONG';
  };

  const renderOverviewTab = () => {
    const overallCorrect = allQuestions.filter(q => getQuestionStatus(q.id) === 'CORRECT').length;
    const overallWrong = allQuestions.filter(q => getQuestionStatus(q.id) === 'WRONG').length;
    const overallUnattempted = allQuestions.filter(q => getQuestionStatus(q.id) === 'UNATTEMPTED').length;
    const attempted = overallCorrect + overallWrong;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Main Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Overall Performance</h3>
                <div className="text-4xl font-black text-slate-900">
                  {attempt.totalScore}
                  <span className="text-lg text-slate-400 font-normal ml-1">/ {attempt.maxScore}</span>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Estimated Percentile</h3>
                <div className="text-3xl font-black text-indigo-600 font-mono">
                  ~{attempt.percentileEstimate.toFixed(1)} <span className="text-sm">%ile</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[120px] ml-auto">
                  Estimated from selected benchmark/distribution
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Accuracy</div>
                <div className="text-lg font-bold text-slate-800">{attempt.accuracy}%</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Correct</div>
                <div className="text-lg font-bold text-emerald-700">{overallCorrect}</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <div className="text-[10px] text-rose-600 font-bold uppercase mb-1">Wrong</div>
                <div className="text-lg font-bold text-rose-700">{overallWrong}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Unattempted</div>
                <div className="text-lg font-bold text-slate-700">{overallUnattempted}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Attempted: {attempted}/{allQuestions.length}</span>
              <span>Time Used: {formatDuration(attempt.totalTimeSeconds)}</span>
            </div>
          </div>

          <PercentileEstimatorTool defaultScore={attempt.totalScore} />
        </div>

        {/* Section-wise results */}
        <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">Section-wise Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.values(attempt.sectionalScores) as SectionScoreSummary[]).map((sec) => (
            <div key={sec.sectionId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-1">{sec.sectionName}</h3>
              <div className="border-b border-slate-100 pb-3 mb-3 text-xs text-slate-500 flex justify-between">
                <span>Score: {sec.score} / {sec.totalQuestions * (mock.rules?.scoring.mcqMarks || 3)}</span>
                <span className="font-bold text-indigo-600 font-mono">~{attempt.percentileEstimate > 0 ? Math.min(99.9, attempt.percentileEstimate + (sec.accuracy - attempt.accuracy)/2).toFixed(1) : 0}%ile</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Correct:</span> <span className="font-bold">{sec.correct}</span>
                </div>
                <div className="flex justify-between items-center text-rose-700">
                  <span>Wrong:</span> <span className="font-bold">{sec.incorrect}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Unattempted:</span> <span className="font-bold">{sec.unattempted}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-100 mt-2">
                  <span>Accuracy:</span> <span className="font-bold">{sec.accuracy}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Time:</span> <span className="font-mono">{formatDuration(sec.timeSpentSeconds)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionCard = (q: Question, idx: number) => {
    const isExpanded = expandedQuestionId === q.id;
    const resp = attempt.answers[q.id];
    const status = getQuestionStatus(q.id);
    const timeSpent = resp?.timeSpentSeconds || 0;
    
    let statusBg = 'bg-slate-100 text-slate-600 border-slate-200';
    let statusIcon = <MinusCircle className="w-4 h-4" />;
    
    if (status === 'CORRECT') {
      statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      statusIcon = <CheckCircle2 className="w-4 h-4" />;
    } else if (status === 'WRONG') {
      statusBg = 'bg-rose-50 text-rose-700 border-rose-200';
      statusIcon = <XCircle className="w-4 h-4" />;
    }

    return (
      <div key={q.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 mb-4">
        <div 
          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold font-mono text-sm border ${statusBg}`}>
              Q{idx + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-xs font-bold ${
                  status === 'CORRECT' ? 'text-emerald-600' : status === 'WRONG' ? 'text-rose-600' : 'text-slate-500'
                }`}>
                  {statusIcon}
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-[11px] text-slate-500 font-mono">
                {status !== 'UNATTEMPTED' && <span>Your answer: <strong className="text-slate-700">{resp.answer}</strong></span>}
                {status !== 'CORRECT' && <span>Correct: <strong className="text-emerald-700">{q.correctAnswer}</strong></span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(timeSpent)}</span>
              </div>
            </div>
          </div>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            {/* Original Question Rendering */}
            <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Question</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{q.topic}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    q.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' :
                    q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
              
              {q.passage && (
                <div className="mb-4 p-4 bg-slate-50 border-l-4 border-slate-300 text-sm leading-relaxed text-slate-700 font-serif">
                  {q.passage}
                </div>
              )}
              {q.diagramUrl && (
                <div className="mb-4 max-w-sm">
                  <img src={q.diagramUrl} alt="Question Diagram" className="w-full h-auto rounded-lg border border-slate-200" />
                </div>
              )}
              {q.diagramSvg && (
                <div className="mb-4 max-w-sm" dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
              )}
              <div className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-wrap mb-4">
                {q.questionText}
              </div>
              {q.options && (
                <div className="space-y-2 mt-4">
                  {q.options.map(opt => (
                    <div key={opt.id} className={`p-3 rounded-lg border text-sm flex gap-3 ${
                      opt.id === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' :
                      opt.id === resp?.answer ? 'bg-rose-50 border-rose-200 text-rose-900' :
                      'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <span className="font-bold">{opt.id}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'TITA' && (
                <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Your Input:</span>
                    <span className={status === 'CORRECT' ? 'text-emerald-700 font-bold' : status === 'WRONG' ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                      {resp?.answer || '(None)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Correct Value:</span>
                    <span className="text-emerald-700 font-bold">{q.correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Answer / Explanation Engine */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                Why did I get it wrong?
              </h4>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                <strong className="text-slate-900 block mb-2">Detailed Solution:</strong>
                {q.explanation}
              </div>

              {/* AI Explanation Levels */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mt-4">
                <h5 className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI Study Coach — Explain this differently
                </h5>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => setAiExplanationMode({ ...aiExplanationMode, [q.id]: 'beginner' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${aiExplanationMode[q.id] === 'beginner' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    Explain like I'm a beginner
                  </button>
                  <button 
                    onClick={() => setAiExplanationMode({ ...aiExplanationMode, [q.id]: 'shortcut' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${aiExplanationMode[q.id] === 'shortcut' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    Show me a faster shortcut
                  </button>
                  <button 
                    onClick={() => setAiExplanationMode({ ...aiExplanationMode, [q.id]: 'core' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${aiExplanationMode[q.id] === 'core' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    What's the core concept?
                  </button>
                </div>
                
                {aiExplanationMode[q.id] && (
                  <div className="bg-white border border-indigo-100 p-4 rounded-lg text-sm text-slate-700 animate-in fade-in slide-in-from-top-2">
                    {aiExplanationMode[q.id] === 'beginner' && (
                      <p><strong>Beginner's Breakdown:</strong> Imagine you have a pie... The question is essentially asking to find the common denominator before multiplying. Break it down step by step instead of jumping straight to the formula.</p>
                    )}
                    {aiExplanationMode[q.id] === 'shortcut' && (
                      <p><strong>Speed Shortcut:</strong> Instead of calculating the exact value, use digital roots or approximation! Since the options are far apart, rounding 41.8 to 42 makes this mental math. You can solve this in 15 seconds.</p>
                    )}
                    {aiExplanationMode[q.id] === 'core' && (
                      <p><strong>Core Concept:</strong> This tests the fundamental property of similar triangles combined with a basic arithmetic progression. Review the section on "Proportionality Theorems".</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  const renderQuestionsTab = () => {
    return (
      <div className="animate-in fade-in duration-300">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Question Analysis</h2>
        <div className="space-y-4">
          {allQuestions.map((q, idx) => renderQuestionCard(q, idx))}
        </div>
      </div>
    );
  };

  const renderTopicsTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Your Performance by Topic
          </h2>
          
          <div className="space-y-6">
            {topicChartData.map((topic, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span className="flex items-center gap-2">
                    {topic.topic}
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {topic.total} Qs
                    </span>
                  </span>
                  <span>{topic.Accuracy}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000" 
                    style={{ width: `${(topic.Correct / topic.total) * 100}%` }} 
                    title={`${topic.Correct} Correct`}
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-1000" 
                    style={{ width: `${(topic.Incorrect / topic.total) * 100}%` }} 
                    title={`${topic.Incorrect} Wrong`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Avg Time: {topic.totalTimeSeconds > 0 ? formatDuration(topic.totalTimeSeconds / (topic.Correct + topic.Incorrect || 1)) : '0:00'}</span>
                  <span>Attempted: {topic.Correct + topic.Incorrect}/{topic.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {weakestTopic && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-rose-900 mb-1">Weakest Area: {weakestTopic.topic}</h3>
              <div className="text-sm text-rose-700 mb-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <span>Attempted: {weakestTopic.Correct + weakestTopic.Incorrect}/{weakestTopic.total}</span>
                <span>Accuracy: {weakestTopic.Accuracy}%</span>
                <span>Avg Time: {formatDuration(weakestTopic.totalTimeSeconds / (weakestTopic.Correct + weakestTopic.Incorrect || 1))}</span>
              </div>
              <p className="text-sm text-rose-800 font-medium bg-white/60 p-3 rounded-lg inline-block">
                Recommendation: Practice 15 medium {weakestTopic.topic} questions to improve fundamentals.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTimeTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Time Analysis
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Fastest</div>
              <div className="text-2xl font-mono font-bold text-emerald-600">{formatDuration(timeMetrics.fastest)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Slowest</div>
              <div className="text-2xl font-mono font-bold text-rose-600">{formatDuration(timeMetrics.slowest)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Overall Avg</div>
              <div className="text-2xl font-mono font-bold text-indigo-600">{formatDuration(timeMetrics.average)}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-emerald-700 font-bold uppercase mb-2">Avg (Correct)</div>
              <div className="text-2xl font-mono font-bold text-emerald-700">{formatDuration(timeMetrics.avgCorrect)}</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-rose-700 font-bold uppercase mb-2">Avg (Wrong)</div>
              <div className="text-2xl font-mono font-bold text-rose-700">{formatDuration(timeMetrics.avgWrong)}</div>
            </div>
          </div>

          {timeMetrics.avgWrong > timeMetrics.avgCorrect * 1.3 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex gap-3 items-center">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>
                <strong>Time Trap Detected:</strong> You are spending significantly more time on questions you eventually get wrong ({formatDuration(timeMetrics.avgWrong)} vs {formatDuration(timeMetrics.avgCorrect)}). Work on identifying tough questions earlier and skipping them to save time.
              </p>
            </div>
          )}
        </div>

        {/* Detailed Time Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Time per Question</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allQuestions.map((q, i) => ({
                name: `Q${i+1}`,
                time: attempt.answers[q.id]?.timeSpentSeconds || 0,
                status: getQuestionStatus(q.id)
              }))} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={1} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${Math.floor(val/60)}m`} />
                <Tooltip 
                  formatter={(value: number) => formatDuration(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                  {allQuestions.map((q, index) => {
                    const status = getQuestionStatus(q.id);
                    return <Cell key={`cell-${index}`} fill={status === 'CORRECT' ? '#10b981' : status === 'WRONG' ? '#f43f5e' : '#cbd5e1'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewTab = () => {
    const reviewQuestions = allQuestions.filter(q => {
      const status = getQuestionStatus(q.id);
      const isMarked = attempt.answers[q.id]?.state === 'marked_for_review' || attempt.answers[q.id]?.state === 'answered_marked';
      return status === 'WRONG' || status === 'UNATTEMPTED' || isMarked;
    });

    return (
      <div className="animate-in fade-in duration-300">
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900">Focus Review</h2>
            <p className="text-xs text-slate-500 mt-1">Filtered: Wrong, Skipped, and Marked for Review</p>
          </div>
          <div className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg text-sm border border-indigo-100">
            {reviewQuestions.length} Questions
          </div>
        </div>
        
        <div className="space-y-4">
          {reviewQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Nothing to review here! Perfect accuracy.</div>
          ) : (
            reviewQuestions.map((q, idx) => renderQuestionCard(q, idx))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mock Complete</h1>
          <p className="text-sm text-slate-500 mt-0.5">{attempt.mockTitle}</p>
        </div>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-colors shadow-xs"
        >
          Exit to Dashboard
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          {(['OVERVIEW', 'QUESTIONS', 'TOPICS', 'TIME', 'REVIEW'] as TabView[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto pb-24">
          {activeTab === 'OVERVIEW' && renderOverviewTab()}
          {activeTab === 'QUESTIONS' && renderQuestionsTab()}
          {activeTab === 'TOPICS' && renderTopicsTab()}
          {activeTab === 'TIME' && renderTimeTab()}
          {activeTab === 'REVIEW' && renderReviewTab()}
        </div>
      </main>

      {/* Persistent Bottom Action Bar (What should I do next) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Your Next Step</h4>
              <p className="text-xs text-slate-500">
                Based on this mock, your accuracy in {weakestTopic?.topic || 'certain areas'} needs improvement.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenMistakeNotebook}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Mistake Notebook
            </button>
            <button
              onClick={onOpenAiCoach}
              className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Start Targeted Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

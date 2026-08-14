import React, { useState, useRef } from 'react';
import { MockTest, Question, MockSection, ExamType } from '../../types';
import { StorageService } from '../../utils/storage';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Edit3,
  Trash2,
  Plus,
  Brain,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  Eye
} from 'lucide-react';

interface PdfUploadViewProps {
  onMockCreated: (mock: MockTest) => void;
  onBackToHome: () => void;
}

export const PdfUploadView: React.FC<PdfUploadViewProps> = ({
  onMockCreated,
  onBackToHome,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [examType, setExamType] = useState<ExamType>('CAT');
  const [mockTitle, setMockTitle] = useState<string>('Custom Uploaded Mock Test');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Validation Studio state
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'review'>('upload');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setMockTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleProcessPdf = async () => {
    if (!file && !pastedText.trim()) {
      setError('Please select a PDF file or paste question paper text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsingStep('Initializing PDF parser and OCR pipeline...');

    try {
      let fileBase64 = '';
      if (file) {
        setParsingStep('Reading PDF pages and extracting text/diagram vector layers...');
        fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setParsingStep('AI Question Detector running: Identifying passages, MCQs, TITAs & topic tagging...');

      const response = await fetch('/api/parse-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          mockTitle,
          fileData: fileBase64,
          mimeType: file ? file.type : 'text/plain',
          rawText: pastedText,
        }),
      });

      if (!response.ok) {
        throw new Error('Parser failed to structure questions from the document.');
      }

      const result = await response.json();
      if (result.questions && result.questions.length > 0) {
        setExtractedQuestions(result.questions);
        setActiveTab('review');
      } else {
        throw new Error('No valid questions could be detected. Please verify your document format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample preset quick loader
  const handleLoadSamplePreset = (type: 'cat_sample' | 'xat_sample') => {
    if (type === 'cat_sample') {
      setMockTitle('CAT 2024 Practice Sectional (Ingested)');
      setExamType('CAT');
      setPastedText(`SECTION: Quantitative Ability
Q1. (MCQ) A shopkeeper marks up his goods by 40% and offers a discount of 15%. If he makes a profit of Rs. 380, find the cost price of the goods.
(A) Rs. 1800
(B) Rs. 2000
(C) Rs. 2200
(D) Rs. 2400
Correct: B
Topic: Arithmetic (Profit & Loss)
Explanation: Let CP = 100x. MP = 140x. SP = 140x * 0.85 = 119x. Profit = 19x = 380 => x = 20. CP = 100 * 20 = Rs. 2000.

Q2. (TITA) In how many ways can 5 boys and 4 girls be seated in a row such that no two girls are seated together?
Correct: 43200
Topic: Modern Math (Permutations)
Explanation: Seat 5 boys first in 5! = 120 ways. This creates 6 available spaces for 4 girls. Ways to seat girls = P(6, 4) = 6 * 5 * 4 * 3 = 360. Total arrangements = 120 * 360 = 43,200.

SECTION: Data Interpretation & Logical Reasoning
[PASSAGE: Four students A, B, C, D participated in a coding contest where scores were 60, 70, 80, 90 in some order. A scored higher than B. C scored an odd multiple of 10. D scored the highest.]
Q3. (MCQ) What was the score obtained by A?
(A) 60
(B) 70
(C) 80
(D) 90
Correct: C
Topic: Logical Reasoning (Order & Ranking)
Explanation: D = 90 (highest). C = 70 (odd multiple of 10). Remaining scores are 60 and 80. Since A > B, A = 80 and B = 60.`);
    } else {
      setMockTitle('XAT 2024 Decision Making Ingestion Drill');
      setExamType('XAT');
      setPastedText(`SECTION: Decision Making
[PASSAGE: An EV startup discovered a minor battery overheating issue under extreme desert conditions (temperatures above 48°C). Fixing it requires recall of 5,000 units costing $2M, while only 12 vehicles operate in desert regions.]
Q1. (MCQ) What is the most ethically and strategically sound decision for the CEO?
(A) Ignore the issue since desert usage is negligible.
(B) Issue a targeted OTA software thermal update immediately and offer free hardware cooling retrofits for desert customers while monitoring fleet telemetry.
(C) Liquidate the company to avoid warranty liabilities.
(D) Blame the battery supplier publicly.
Correct: B
Topic: Decision Making (Ethics & Crisis Management)
Explanation: Targeted software mitigation and direct customer support for affected regions balances customer safety with financial prudence.`);
    }
  };

  // Update a question in Validation Studio
  const handleUpdateCurrentQuestion = (field: keyof Question, value: any) => {
    setExtractedQuestions((prev) => {
      const updated = [...prev];
      updated[selectedQuestionIndex] = {
        ...updated[selectedQuestionIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // Finalize & Deploy Mock to CBT Engine
  const handleDeployToCbt = () => {
    // Group questions by section
    const sectionMap: Record<string, Question[]> = {};

    extractedQuestions.forEach((q, idx) => {
      const secId = q.sectionId || 'QA';
      if (!sectionMap[secId]) sectionMap[secId] = [];
      sectionMap[secId].push({
        ...q,
        questionNumber: idx + 1,
      });
    });

    const mockSections: MockSection[] = Object.entries(sectionMap).map(([secId, qList]) => ({
      id: secId,
      name: secId === 'VARC' ? 'Verbal Ability & Reading Comprehension' : secId === 'DILR' ? 'Data Interpretation & Logical Reasoning' : secId === 'QA' ? 'Quantitative Ability' : secId,
      durationMinutes: 40,
      questions: qList,
    }));

    const newMock: MockTest = {
      id: `mock_custom_${Date.now()}`,
      title: mockTitle,
      examTemplateId: examType === 'CAT' ? 'cat_standard' : 'xat_standard',
      examType: examType,
      year: '2025',
      slot: 'Custom Ingested',
      description: `Ingested from ${file ? file.name : 'OCR / Text Parser'} with ${extractedQuestions.length} validated questions.`,
      totalDurationMinutes: mockSections.reduce((acc, s) => acc + s.durationMinutes, 0),
      sections: mockSections,
      createdDate: new Date().toISOString().split('T')[0],
      isPreloaded: false,
    };

    StorageService.saveMock(newMock);
    onMockCreated(newMock);
  };

  const selectedQuestion: Question | undefined = extractedQuestions[selectedQuestionIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
              Multimodal Ingestion Pipeline
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-indigo-600" />
            PDF & OCR Mock Ingestion Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Ingest mock exam PDFs, scanned papers, and question banks. AI parses questions, diagrams, and answers, which you validate before deploying to the deterministic CBT engine.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          Back to Dashboard
        </button>
      </div>

      {activeTab === 'upload' ? (
        /* Upload & OCR Ingestion View */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
            {/* Exam Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mock Test Title:
                </label>
                <input
                  type="text"
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  placeholder="e.g. CAT 2024 Slot 2 Mock Paper"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Exam Pattern:
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CAT">CAT (3 Sections, Strict 40m Locks, +3/-1 MCQ, +3/0 TITA)</option>
                  <option value="XAT">XAT (VALR, DM, QA-DI, Free Navigation, +1/-0.25)</option>
                  <option value="SECTIONAL">Sectional Drill (Single 40m Section)</option>
                </select>
              </div>
            </div>

            {/* Drag and drop upload box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Upload Mock Paper PDF / Scanned Document:
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 rounded-2xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {file ? file.name : 'Click to browse or drag and drop Mock PDF'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports text PDFs, scanned OCR documents, or past test papers (up to 25MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Test Ingestion Presets:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLoadSamplePreset('cat_sample')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Load CAT Ingestion Sample
                </button>
                <button
                  onClick={() => handleLoadSamplePreset('xat_sample')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-purple-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Load XAT Ingestion Sample
                </button>
              </div>
            </div>

            {/* Paste Raw Text Alternative */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Or Paste Question Paper Content Directly:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste questions with options, passages, and answer keys here..."
                rows={6}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleProcessPdf}
              disabled={isProcessing || (!file && !pastedText.trim())}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{parsingStep || 'Extracting questions...'}</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Extract Questions & Open Validation Studio</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Validation & Review Studio */
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {extractedQuestions.length}
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Validation Studio: {extractedQuestions.length} Questions Extracted
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inspect and edit questions, verify answer keys, then deploy into the CBT Exam Simulator.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Back to Upload
              </button>
              <button
                onClick={handleDeployToCbt}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Deploy as Live CBT Mock Exam</span>
              </button>
            </div>
          </div>

          {/* Studio Workspace: Left Question Selector, Right Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Question List */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-2 max-h-[70vh] overflow-y-auto shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Parsed Question Queue
              </div>

              {extractedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors flex items-start gap-2.5 cursor-pointer ${
                    selectedQuestionIndex === idx
                      ? 'bg-indigo-50 border-indigo-300 text-slate-900 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs text-indigo-600 shrink-0">Q{idx + 1}</span>
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs font-semibold truncate">{q.topic || 'General'}</div>
                    <div className="text-[11px] text-slate-500 truncate">{q.questionText}</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {q.type}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Question Inspector & Editor */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              {selectedQuestion ? (
                <div className="space-y-4">
                  {/* Meta Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Section:
                      </label>
                      <select
                        value={selectedQuestion.sectionId}
                        onChange={(e) => handleUpdateCurrentQuestion('sectionId', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="VARC">VARC</option>
                        <option value="DILR">DILR</option>
                        <option value="QA">QA</option>
                        <option value="VALR">VALR</option>
                        <option value="DM">DM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Question Type:
                      </label>
                      <select
                        value={selectedQuestion.type}
                        onChange={(e) => handleUpdateCurrentQuestion('type', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="MCQ">MCQ (Multiple Choice)</option>
                        <option value="TITA">TITA (Type In The Answer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Topic / Category:
                      </label>
                      <input
                        type="text"
                        value={selectedQuestion.topic}
                        onChange={(e) => handleUpdateCurrentQuestion('topic', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Passage Text if available */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Comprehension / Set Passage (Optional):
                    </label>
                    <textarea
                      value={selectedQuestion.passage || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('passage', e.target.value)}
                      rows={3}
                      placeholder="Paste passage or DILR context if this question is part of a set..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Question Statement:
                    </label>
                    <textarea
                      value={selectedQuestion.questionText}
                      onChange={(e) => handleUpdateCurrentQuestion('questionText', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-normal focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Options Editor for MCQ */}
                  {selectedQuestion.type === 'MCQ' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">
                        Multiple Choice Options:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                          const optObj = selectedQuestion.options?.find((o) => o.id === optKey);
                          return (
                            <div key={optKey} className="flex items-center gap-2">
                              <span className="font-bold text-xs text-indigo-600 w-5">({optKey})</span>
                              <input
                                type="text"
                                value={optObj?.text || ''}
                                onChange={(e) => {
                                  const curOpts = selectedQuestion.options || [];
                                  const updatedOpts = ['A', 'B', 'C', 'D'].map((k) => ({
                                    id: k,
                                    text: k === optKey ? e.target.value : curOpts.find((o) => o.id === k)?.text || '',
                                  }));
                                  handleUpdateCurrentQuestion('options', updatedOpts);
                                }}
                                placeholder={`Option ${optKey} text...`}
                                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Correct Answer & Marks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">
                        Verified Correct Answer Key:
                      </label>
                      <input
                        type="text"
                        value={selectedQuestion.correctAnswer}
                        onChange={(e) => handleUpdateCurrentQuestion('correctAnswer', e.target.value)}
                        placeholder="e.g. A, B, C, D or numerical 42"
                        className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2 text-xs font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Difficulty Rating:
                      </label>
                      <select
                        value={selectedQuestion.difficulty}
                        onChange={(e) => handleUpdateCurrentQuestion('difficulty', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Step-by-Step Explanation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Step-by-Step Explanation & Method:
                    </label>
                    <textarea
                      value={selectedQuestion.explanation}
                      onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a question on the left to review and adjust parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

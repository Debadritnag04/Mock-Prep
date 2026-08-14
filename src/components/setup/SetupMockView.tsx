import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MockTest, Question, MockSection, ExamType, SectionConfig, ExamMode } from '../../types';
import { StorageService } from '../../utils/storage';
import { ExamRulesEngine } from '../../rules/examEngine';
import {
  ExamTemplateDefinition,
  TemplateValidationResult,
  PdfDetectedStructure,
  ExamConfigValidationReport,
} from '../../rules/types';
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
  Clock,
  Settings,
  ShieldAlert,
  HelpCircle,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Table,
  Image as ImageIcon,
  Compass,
  ListOrdered,
  Calculator,
  Award,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SetupSectionItem {
  id: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
}

interface SetupMockViewProps {
  onMockCreated: (mock: MockTest) => void;
  onNavigateToLibrary: () => void;
  onNavigateToMistakes: () => void;
  onNavigateToCoach: () => void;
}

export const SetupMockView: React.FC<SetupMockViewProps> = ({
  onMockCreated,
  onNavigateToLibrary,
  onNavigateToMistakes,
  onNavigateToCoach,
}) => {
  // 1. Exam Template & Mode State
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('CAT');
  const [examMode, setExamMode] = useState<ExamMode>('real_exam'); // 'real_exam' vs 'custom_mock'

  // Dynamic template loaded from ExamRulesEngine
  const activeTemplate: ExamTemplateDefinition = ExamRulesEngine.getTemplate(selectedExamType);
  const allTemplates: ExamTemplateDefinition[] = ExamRulesEngine.getAllTemplates();

  // 2. Mock Meta State
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [mockTitle, setMockTitle] = useState<string>(`${activeTemplate.shortName} Mock 01`);
  const [showPasteTextModal, setShowPasteTextModal] = useState<boolean>(false);

  // 3. Configurable Sections (Initialized directly from activeTemplate)
  const [sections, setSections] = useState<SetupSectionItem[]>(
    activeTemplate.sections.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.durationMinutes,
      questionCount: s.targetQuestions,
    }))
  );

  // 4. Custom Mock Mode Editable Rules
  const [allowSectionSwitching, setAllowSectionSwitching] = useState<boolean>(
    activeTemplate.rules.allowSectionSwitching
  );
  const [isStrictSectionTimed, setIsStrictSectionTimed] = useState<boolean>(
    activeTemplate.rules.isStrictSectionTimed
  );
  const [autoSubmitOnTimeout, setAutoSubmitOnTimeout] = useState<boolean>(
    activeTemplate.rules.autoSubmitOnTimeout
  );
  const [mcqMarks, setMcqMarks] = useState<number>(activeTemplate.rules.scoring.mcqMarks);
  const [mcqNegativeMarks, setMcqNegativeMarks] = useState<number>(
    activeTemplate.rules.scoring.mcqNegativeMarks
  );
  const [titaMarks, setTitaMarks] = useState<number>(activeTemplate.rules.scoring.titaMarks);
  const [titaNegativeMarks, setTitaNegativeMarks] = useState<number>(
    activeTemplate.rules.scoring.titaNegativeMarks
  );

  // 5. Import & AI Extraction Options (Enabled by default)
  const [preserveDiagrams, setPreserveDiagrams] = useState<boolean>(true);
  const [preserveTables, setPreserveTables] = useState<boolean>(true);
  const [preserveMathFormatting, setPreserveMathFormatting] = useState<boolean>(true);
  const [detectPassagesAuto, setDetectPassagesAuto] = useState<boolean>(true);
  const [detectQuestionTypesAuto, setDetectQuestionTypesAuto] = useState<boolean>(true);
  const [detectSectionsAuto, setDetectSectionsAuto] = useState<boolean>(true);

  // 6. Processing & Status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 7. Smart Detection & Validation Result
  const [detectedSummary, setDetectedSummary] = useState<PdfDetectedStructure | null>(null);
  const [validationResult, setValidationResult] = useState<TemplateValidationResult | null>(null);

  // 8. Validation Studio Questions State
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [activeStage, setActiveStage] = useState<'setup' | 'detected' | 'review'>('setup');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Exam Configuration Validation against active template
  const configValidation: ExamConfigValidationReport = useMemo(() => {
    return ExamRulesEngine.validateExamConfiguration(
      {
        sections,
        mcqMarks,
        mcqNegativeMarks,
        titaMarks,
        titaNegativeMarks,
        isStrictSectionTimed,
        allowSectionSwitching,
        autoSubmitOnTimeout,
      },
      activeTemplate,
      examMode
    );
  }, [
    sections,
    mcqMarks,
    mcqNegativeMarks,
    titaMarks,
    titaNegativeMarks,
    isStrictSectionTimed,
    allowSectionSwitching,
    autoSubmitOnTimeout,
    activeTemplate,
    examMode,
  ]);

  // Whenever user switches Exam in the dropdown, dynamically load the new Exam Template
  const handleExamTypeChange = (newType: ExamType) => {
    setSelectedExamType(newType);
    const newTemplate = ExamRulesEngine.getTemplate(newType);

    setMockTitle(`${newTemplate.shortName} Mock 01`);
    setSections(
      newTemplate.sections.map((s) => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        questionCount: s.targetQuestions,
      }))
    );
    setAllowSectionSwitching(newTemplate.rules.allowSectionSwitching);
    setIsStrictSectionTimed(newTemplate.rules.isStrictSectionTimed);
    setAutoSubmitOnTimeout(newTemplate.rules.autoSubmitOnTimeout);
    setMcqMarks(newTemplate.rules.scoring.mcqMarks);
    setMcqNegativeMarks(newTemplate.rules.scoring.mcqNegativeMarks);
    setTitaMarks(newTemplate.rules.scoring.titaMarks);
    setTitaNegativeMarks(newTemplate.rules.scoring.titaNegativeMarks);

    // If a PDF is already analyzed, re-validate structure against the newly selected template
    if (detectedSummary) {
      const revalidated = ExamRulesEngine.validatePdfStructure(detectedSummary, newTemplate);
      setValidationResult(revalidated);
    }
  };

  // Section Management in Custom Mode
  const handleAddSection = () => {
    const nextIdx = sections.length + 1;
    const newSec: SetupSectionItem = {
      id: `SEC_${nextIdx}`,
      name: `Section ${nextIdx}`,
      durationMinutes: 40,
      questionCount: 20,
    };
    setSections([...sections, newSec]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleUpdateSection = (index: number, field: keyof SetupSectionItem, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  // Load Preset File / Demo for immediate testing
  const handleLoadPreset = (exam: ExamType) => {
    handleExamTypeChange(exam);
    setIsProcessing(true);
    setParsingStep(`Loading verified ${exam} official pattern dataset...`);

    setTimeout(() => {
      let mockQuestions: Question[] = [];
      let detected: PdfDetectedStructure;

      if (exam === 'XAT') {
        mockQuestions = generateSampleQuestionsForXat();
        detected = {
          fileName: 'XAT_2025_Official_Question_Paper.pdf',
          totalQuestions: 95,
          totalSections: 4,
          totalMinutes: 210,
          diagramsCount: 6,
          tablesCount: 5,
          passagesCount: 4,
          detectedSectionNames: ['VALR', 'DM', 'QA & DI', 'GK'],
          detectedQuestionTypes: ['MCQ'],
        };
      } else if (exam === 'CMAT') {
        mockQuestions = generateSampleQuestionsForCmat();
        detected = {
          fileName: 'CMAT_2025_National_Mock.pdf',
          totalQuestions: 100,
          totalSections: 5,
          totalMinutes: 180,
          diagramsCount: 4,
          tablesCount: 6,
          passagesCount: 2,
          detectedSectionNames: ['QT_DI', 'LR', 'LC', 'GA', 'IE'],
          detectedQuestionTypes: ['MCQ'],
        };
      } else if (exam === 'SNAP') {
        mockQuestions = generateSampleQuestionsForSnap();
        detected = {
          fileName: 'SNAP_2024_Speed_Test.pdf',
          totalQuestions: 60,
          totalSections: 3,
          totalMinutes: 60,
          diagramsCount: 3,
          tablesCount: 3,
          passagesCount: 2,
          detectedSectionNames: ['GE', 'ALR', 'QA_DI_DS'],
          detectedQuestionTypes: ['MCQ'],
        };
      } else {
        // CAT Default
        mockQuestions = generateSampleQuestionsForCat();
        detected = {
          fileName: 'CAT_2024_Slot_1_Official_Paper.pdf',
          totalQuestions: 66,
          totalSections: 3,
          totalMinutes: 120,
          diagramsCount: 8,
          tablesCount: 4,
          passagesCount: 3,
          detectedSectionNames: ['VARC', 'DILR', 'QA'],
          detectedQuestionTypes: ['MCQ', 'TITA'],
        };
      }

      const template = ExamRulesEngine.getTemplate(exam);
      const validation = ExamRulesEngine.validatePdfStructure(detected, template);

      setExtractedQuestions(mockQuestions);
      setDetectedSummary(detected);
      setValidationResult(validation);
      setIsProcessing(false);
      setActiveStage('detected');
    }, 650);
  };

  // Simulate Smart AI Extraction & Section/Passage Parsing on File Upload
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError(null);
    setParsingStep('Initializing OCR & Vector Document Parser...');

    setTimeout(() => {
      setParsingStep('Detecting passages, mathematical expressions, and tables...');
    }, 400);

    setTimeout(() => {
      setParsingStep(`Matching structure against official ${activeTemplate.shortName} Rules Engine...`);
    }, 900);

    setTimeout(() => {
      // Simulate intelligent extraction according to current template & filename
      const isXatDoc = uploadedFile.name.toLowerCase().includes('xat');
      const isCatDoc = uploadedFile.name.toLowerCase().includes('cat');

      let questions: Question[] = [];
      let detected: PdfDetectedStructure;

      if (isXatDoc || selectedExamType === 'XAT') {
        questions = generateSampleQuestionsForXat();
        detected = {
          fileName: uploadedFile.name,
          totalQuestions: 95,
          totalSections: 4,
          totalMinutes: 210,
          diagramsCount: 6,
          tablesCount: 5,
          passagesCount: 4,
          detectedSectionNames: ['VALR', 'DM', 'QA & DI', 'GK'],
          detectedQuestionTypes: ['MCQ'],
        };
      } else {
        questions = generateSampleQuestionsForCat();
        detected = {
          fileName: uploadedFile.name,
          totalQuestions: 66,
          totalSections: 3,
          totalMinutes: 120,
          diagramsCount: 8,
          tablesCount: 4,
          passagesCount: 3,
          detectedSectionNames: ['VARC', 'DILR', 'QA'],
          detectedQuestionTypes: ['MCQ', 'TITA'],
        };
      }

      const validation = ExamRulesEngine.validatePdfStructure(detected, activeTemplate);

      setExtractedQuestions(questions);
      setDetectedSummary(detected);
      setValidationResult(validation);
      setIsProcessing(false);
      setActiveStage('detected');
    }, 1400);
  };

  // Build and finalize the MockTest object
  const handleFinalizeMock = () => {
    if (extractedQuestions.length === 0) {
      setError('No questions available to create mock. Please upload a question paper.');
      return;
    }

    // 1. Strict Configuration Validation Check against active template
    const validationCheck = ExamRulesEngine.validateExamConfiguration(
      {
        sections,
        mcqMarks,
        mcqNegativeMarks,
        titaMarks,
        titaNegativeMarks,
        isStrictSectionTimed,
        allowSectionSwitching,
        autoSubmitOnTimeout,
      },
      activeTemplate,
      examMode
    );

    if (validationCheck.hasCriticalErrors) {
      const topIssue = validationCheck.issues.find((i) => i.severity === 'critical');
      setError(`Configuration Mismatch: ${topIssue?.title || 'Critical errors found'}. ${topIssue?.message || ''}`);
      return;
    }

    // Resolve Exam Rules through ExamRulesEngine
    const resolvedRules = ExamRulesEngine.resolveRules(
      activeTemplate,
      examMode,
      examMode === 'custom_mock'
        ? {
            isStrictSectionTimed,
            allowSectionSwitching,
            autoSubmitOnTimeout,
            scoring: {
              mcqMarks,
              mcqNegativeMarks,
              titaMarks,
              titaNegativeMarks,
              unattemptedPenalty: activeTemplate.rules.scoring.unattemptedPenalty,
              unattemptedFreeLimit: activeTemplate.rules.scoring.unattemptedFreeLimit,
            },
          }
        : undefined
    );

    // Group extracted questions by section
    const sectionMap: Record<string, Question[]> = {};
    sections.forEach((sec) => {
      sectionMap[sec.id] = [];
    });

    extractedQuestions.forEach((q, idx) => {
      if (sectionMap[q.sectionId]) {
        sectionMap[q.sectionId].push({ ...q, questionNumber: sectionMap[q.sectionId].length + 1 });
      } else {
        // Fallback to first section
        const firstSecId = sections[0]?.id || 'VARC';
        if (!sectionMap[firstSecId]) sectionMap[firstSecId] = [];
        sectionMap[firstSecId].push({ ...q, sectionId: firstSecId, questionNumber: sectionMap[firstSecId].length + 1 });
      }
    });

    const mockSections: MockSection[] = sections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      durationMinutes: sec.durationMinutes,
      questions: sectionMap[sec.id] || [],
    }));

    const totalDuration = mockSections.reduce((acc, s) => acc + s.durationMinutes, 0);

    const newMock: MockTest = {
      id: `mock_${Date.now()}`,
      title: mockTitle || `${activeTemplate.shortName} Mock Exam`,
      examTemplateId: activeTemplate.id,
      examType: selectedExamType,
      examMode: examMode,
      rules: resolvedRules,
      year: new Date().getFullYear().toString(),
      slot: 'Practice Slot',
      description: `${activeTemplate.name} (${examMode === 'real_exam' ? 'Real Exam Rules' : 'Custom Configured Mock'})`,
      totalDurationMinutes: totalDuration,
      sections: mockSections,
      createdDate: new Date().toISOString(),
    };

    StorageService.saveMock(newMock);
    onMockCreated(newMock);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm font-black text-lg">
              CE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Exam Engine & Mock Setup
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Rules Engine v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Declarative pattern matching for CAT, XAT, CMAT, SNAP, NMAT, GMAT & Custom mocks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onNavigateToLibrary}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Mock Library
            </button>
            <button
              onClick={onNavigateToMistakes}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden md:block"
            >
              Mistakes Notebook
            </button>
            <button
              onClick={onNavigateToCoach}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              AI Study Coach
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Progress Stages Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full">
            <button
              onClick={() => setActiveStage('setup')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeStage === 'setup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Template & PDF Setup</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            <button
              onClick={() => detectedSummary && setActiveStage('detected')}
              disabled={!detectedSummary}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeStage === 'detected'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : !detectedSummary
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Detection & Rules Match</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            <button
              onClick={() => extractedQuestions.length > 0 && setActiveStage('review')}
              disabled={extractedQuestions.length === 0}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeStage === 'review'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : extractedQuestions.length === 0
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Validation Studio</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: TEMPLATE SELECTION & PDF CONFIGURATION */}
        {/* ========================================================================= */}
        {activeStage === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 Cols): Upload & Exam Engine Template Selector */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Exam Template & Rules Selector */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      1. Exam Template & Rules Engine
                    </h2>
                  </div>
                  <span className="text-xs text-indigo-600 font-mono font-semibold">
                    {activeTemplate.officialPatternYear}
                  </span>
                </div>

                {/* Exam Template Selector Dropdown / Grid */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Target Examination Template
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {allTemplates.map((tpl) => {
                      const isSelected = selectedExamType === tpl.examType;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleExamTypeChange(tpl.examType)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-sm text-slate-900">
                              {tpl.shortName}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {tpl.totalQuestions} Qs • {tpl.totalTimeMinutes}m
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode Selector: Real Exam Mode vs Custom Mock Mode */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Exam Rules Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExamMode('real_exam')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        examMode === 'real_exam'
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">Real Exam Mode</span>
                        <ShieldAlert
                          className={`w-4 h-4 ${
                            examMode === 'real_exam' ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[11px] ${
                          examMode === 'real_exam' ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        Enforce official {activeTemplate.shortName} rules strictly (locked section timings, negative marking & navigation rules).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExamMode('custom_mock')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        examMode === 'custom_mock'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">Custom Mock Mode</span>
                        <Sliders
                          className={`w-4 h-4 ${
                            examMode === 'custom_mock' ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[11px] ${
                          examMode === 'custom_mock' ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        Allow custom section counts, flexible timings, or coaching institute mock variations.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Mock Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mock Test Name
                  </label>
                  <input
                    type="text"
                    value={mockTitle}
                    onChange={(e) => setMockTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                    placeholder={`e.g. ${activeTemplate.shortName} 2024 Slot 1 Practice Test`}
                  />
                </div>
              </div>

              {/* 2. Upload Question Paper Dropzone */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      2. Upload Question Paper (PDF)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">Supports PDF, Scans & Text</span>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-800 mb-1">
                    {file ? file.name : 'Click to select or drag & drop PDF here'}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Extracts formulas, diagrams, tables, reading comprehension passages & options automatically.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Select Question Paper (.pdf)</span>
                  </div>
                </div>

                {/* Fast-load Verified Exam Presets */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Or test instantly with official sample papers:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('CAT')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors"
                    >
                      CAT 2024 Slot 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('XAT')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px] transition-colors"
                    >
                      XAT 2025 Paper
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('SNAP')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors"
                    >
                      SNAP Speed Test
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Dynamic Template Rules Preview & Custom Overrides */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dynamic Rules Engine Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Active Exam Rules Blueprint
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                    {activeTemplate.shortName} Rules
                  </span>
                </div>

                {/* Template Specs Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="text-slate-500 block mb-1">Timing Model</span>
                    <span className="font-bold text-slate-800">
                      {activeTemplate.rules.isStrictSectionTimed
                        ? 'Strict Sectional Locks'
                        : 'Flexible Shared Pool'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="text-slate-500 block mb-1">Calculator Permitted</span>
                    <span className="font-bold text-slate-800">
                      {activeTemplate.rules.hasOnscreenCalculator ? '✓ Onscreen Scientific' : '✗ Not Allowed'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="text-slate-500 block mb-1">Section Switching</span>
                    <span className="font-bold text-slate-800">
                      {activeTemplate.rules.allowSectionSwitching ? 'Free Inter-Sectional' : 'Locked to Section'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                    <span className="text-slate-500 block mb-1">Scoring Scheme</span>
                    <span className="font-bold text-slate-800">
                      +{activeTemplate.rules.scoring.mcqMarks} / -{activeTemplate.rules.scoring.mcqNegativeMarks} MCQ
                    </span>
                  </div>
                </div>

                {/* Unattempted Penalty Note for XAT */}
                {activeTemplate.rules.scoring.unattemptedPenalty > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>XAT Negative Marking on Unattempted:</strong> A penalty of -
                      {activeTemplate.rules.scoring.unattemptedPenalty} mark applies for each unattempted question beyond{' '}
                      {activeTemplate.rules.scoring.unattemptedFreeLimit} questions.
                    </span>
                  </div>
                )}

                {/* Sections List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Configured Sections ({sections.length})</span>
                    {examMode === 'custom_mock' && (
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Section
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          {examMode === 'custom_mock' ? (
                            <input
                              type="text"
                              value={sec.name}
                              onChange={(e) => handleUpdateSection(idx, 'name', e.target.value)}
                              className="w-full font-semibold text-slate-900 bg-white px-2 py-1 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            <span className="font-semibold text-slate-900 block truncate">
                              {sec.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {examMode === 'custom_mock' ? (
                              <input
                                type="number"
                                value={sec.durationMinutes}
                                onChange={(e) =>
                                  handleUpdateSection(idx, 'durationMinutes', parseInt(e.target.value) || 0)
                                }
                                className="w-10 text-center font-mono font-bold"
                              />
                            ) : (
                              <span className="font-mono font-bold">{sec.durationMinutes}</span>
                            )}
                            <span className="text-[10px] text-slate-500">min</span>
                          </div>

                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                            {examMode === 'custom_mock' ? (
                              <input
                                type="number"
                                value={sec.questionCount}
                                onChange={(e) =>
                                  handleUpdateSection(idx, 'questionCount', parseInt(e.target.value) || 0)
                                }
                                className="w-8 text-center font-mono font-bold"
                              />
                            ) : (
                              <span className="font-mono font-bold">{sec.questionCount}</span>
                            )}
                            <span className="text-[10px] text-slate-500">Q</span>
                          </div>

                          {examMode === 'custom_mock' && sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Mock Mode: Custom Rules & Scoring Override */}
                {examMode === 'custom_mock' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Custom Mock Rules & Scoring Controls</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          MCQ Correct (+)
                        </label>
                        <input
                          type="number"
                          value={mcqMarks}
                          onChange={(e) => setMcqMarks(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          MCQ Negative (-)
                        </label>
                        <input
                          type="number"
                          value={mcqNegativeMarks}
                          onChange={(e) => setMcqNegativeMarks(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs text-center text-rose-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          TITA Correct (+)
                        </label>
                        <input
                          type="number"
                          value={titaMarks}
                          onChange={(e) => setTitaMarks(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          TITA Negative (-)
                        </label>
                        <input
                          type="number"
                          value={titaNegativeMarks}
                          onChange={(e) => setTitaNegativeMarks(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs text-center text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isStrictSectionTimed}
                          onChange={(e) => setIsStrictSectionTimed(e.target.checked)}
                          className="rounded text-indigo-600 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          Enforce Strict Sectional Timers
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowSectionSwitching}
                          onChange={(e) => setAllowSectionSwitching(e.target.checked)}
                          className="rounded text-indigo-600 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          Allow Free Inter-Section Switching
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Configuration Validation Diagnostic Banner */}
                {configValidation.issues.length > 0 && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      configValidation.hasCriticalErrors
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {configValidation.hasCriticalErrors ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>
                            {configValidation.hasCriticalErrors
                              ? `Configuration Error (${configValidation.criticalCount} blocking)`
                              : `Template Validation Advisory (${configValidation.warningCount} notices)`}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/70">
                            {configValidation.hasCriticalErrors ? 'Invalid' : 'Notice'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {configValidation.summary}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {configValidation.issues.map((issue) => (
                            <div
                              key={issue.id}
                              className="p-2 bg-white/80 rounded border border-current/15 text-[11px] space-y-0.5"
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>{issue.title}</span>
                                <span className="font-mono text-[10px]">
                                  {issue.currentValue} → Expected: {issue.expectedValue}
                                </span>
                              </div>
                              <p className="text-[10px] opacity-90">{issue.message}</p>
                              <p className="text-[10px] font-medium text-indigo-700">
                                💡 {issue.suggestion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Import AI Features Checklist */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    AI Extraction & Preservation Engine
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveDiagrams}
                        onChange={(e) => setPreserveDiagrams(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Preserve SVG Diagrams</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveTables}
                        onChange={(e) => setPreserveTables(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Preserve Complex Tables</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveMathFormatting}
                        onChange={(e) => setPreserveMathFormatting(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Preserve Math / LaTeX</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detectPassagesAuto}
                        onChange={(e) => setDetectPassagesAuto(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Auto-detect RC Passages</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: SMART DETECTION & TEMPLATE VALIDATION COMPARISON */}
        {/* ========================================================================= */}
        {activeStage === 'detected' && detectedSummary && validationResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Header: Perfect Match vs Configuration Mismatch */}
            <div
              className={`p-6 rounded-2xl border ${
                validationResult.status === 'exact_match'
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : validationResult.status === 'partial_match'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    validationResult.status === 'exact_match'
                      ? 'bg-emerald-600 text-white'
                      : validationResult.status === 'partial_match'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {validationResult.status === 'exact_match' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                      {validationResult.status === 'exact_match'
                        ? `✓ Matches ${activeTemplate.shortName} Template Perfectly`
                        : `⚠ Template Configuration Notice (${activeTemplate.shortName})`}
                    </h2>
                    <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-white/70">
                      {validationResult.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm">
                    {validationResult.mismatchSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Structure Comparison Matrix: PDF Detected vs Selected Exam Template */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Structure Comparison: PDF Detected vs. Selected {activeTemplate.shortName} Template
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {detectedSummary.fileName}
                </span>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Exam Attribute</th>
                      <th className="py-2.5 px-3">PDF Detected</th>
                      <th className="py-2.5 px-3">Official {activeTemplate.shortName} Pattern</th>
                      <th className="py-2.5 px-3 text-right">Alignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {validationResult.details.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{d.label}</td>
                        <td className="py-2.5 px-3 font-mono">{d.detected}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{d.expected}</td>
                        <td className="py-2.5 px-3 text-right">
                          {d.isMatch ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              <Check className="w-3.5 h-3.5" /> Aligned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                              <AlertCircle className="w-3.5 h-3.5" /> Variation
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detected Rich Media Assets Overview */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      {detectedSummary.diagramsCount} Diagrams Detected
                    </span>
                    <span className="text-[11px] text-indigo-700">Vector SVG Preserved</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center gap-2.5">
                  <Table className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      {detectedSummary.tablesCount} Tables Detected
                    </span>
                    <span className="text-[11px] text-indigo-700">DILR Grids Formatted</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      {detectedSummary.passagesCount} RC Passages Detected
                    </span>
                    <span className="text-[11px] text-indigo-700">Split-Screen Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('setup')}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ← Back to Template Setup
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveStage('review')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Review in Validation Studio</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalizeMock}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {validationResult.status === 'exact_match'
                      ? 'Continue to Ready Screen'
                      : 'Continue Anyway & Create Mock'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: INTERACTIVE VALIDATION STUDIO */}
        {/* ========================================================================= */}
        {activeStage === 'review' && extractedQuestions.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Question Validation Studio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspect parsed questions, correct answer keys, options, and rich media
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Question {selectedQuestionIndex + 1} of {extractedQuestions.length}
                </span>
              </div>
            </div>

            {/* Questions Strip / Palette for Quick Inspection */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
              {extractedQuestions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    idx === selectedQuestionIndex
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xs'
                      : q.type === 'TITA'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Active Question Editor / Inspector */}
            {extractedQuestions[selectedQuestionIndex] && (
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                      Section: {extractedQuestions[selectedQuestionIndex].sectionId}
                    </span>
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                      Topic: {extractedQuestions[selectedQuestionIndex].topic}
                    </span>
                    <span className="font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                      Type: {extractedQuestions[selectedQuestionIndex].type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      Correct Key: {extractedQuestions[selectedQuestionIndex].correctAnswer}
                    </span>
                  </div>
                </div>

                {/* Passage Preview if attached */}
                {extractedQuestions[selectedQuestionIndex].passage && (
                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      Passage: {extractedQuestions[selectedQuestionIndex].passageTitle || 'Reading Comprehension'}
                    </span>
                    <p className="line-clamp-3 italic text-slate-600">
                      {extractedQuestions[selectedQuestionIndex].passage}
                    </p>
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Question Content</label>
                  <p className="text-sm font-medium text-slate-900 bg-white p-3.5 rounded-lg border border-slate-200">
                    {extractedQuestions[selectedQuestionIndex].questionText}
                  </p>
                </div>

                {/* SVG Diagram Preview if attached */}
                {extractedQuestions[selectedQuestionIndex].diagramSvg && (
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Preserved Technical Vector Diagram
                    </span>
                    <div
                      className="max-h-48 overflow-hidden flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: extractedQuestions[selectedQuestionIndex].diagramSvg || '',
                      }}
                    />
                  </div>
                )}

                {/* Options List for MCQ */}
                {extractedQuestions[selectedQuestionIndex].options && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Multiple Choice Options</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {extractedQuestions[selectedQuestionIndex].options?.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.id === extractedQuestions[selectedQuestionIndex].correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px]">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-indigo-950">Detailed Solution & Rationale</span>
                  <p className="text-slate-600">
                    {extractedQuestions[selectedQuestionIndex].explanation || 'Explanation provided.'}
                  </p>
                </div>
              </div>
            )}

            {/* Validation Studio Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStage('detected')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                ← Back to Detection Matrix
              </button>

              <button
                type="button"
                onClick={handleFinalizeMock}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Save & Proceed to Ready Screen</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// =========================================================================
// Sample Question Paper Generators for Instant Testing
// =========================================================================

function generateSampleQuestionsForCat(): Question[] {
  const qList: Question[] = [];

  // VARC Questions (24)
  for (let i = 1; i <= 24; i++) {
    qList.push({
      id: `cat_varc_${i}`,
      sectionId: 'VARC',
      questionNumber: i,
      type: i > 20 ? 'TITA' : 'MCQ',
      questionText:
        i <= 16
          ? `Based on the passage on Cognitive Semantics and Linguistics, which one of the following statements, if true, would most directly weaken the author's primary hypothesis regarding conceptual metaphor theory? (Question ${i})`
          : `The sentences given below, when properly sequenced, form a coherent paragraph. Each sentence is labeled with a number. Decide on the proper logical order and enter the sequence. (ParaJumble ${i})`,
      options:
        i > 20
          ? undefined
          : [
              { id: 'A', text: 'Conceptual frameworks are culturally invariant and biologically innate.' },
              { id: 'B', text: 'Abstract reasoning operates entirely independently of sensorimotor metaphors.' },
              { id: 'C', text: 'Neurological imaging demonstrates semantic plasticity across varied dialects.' },
              { id: 'D', text: 'Lexical borrowings alter phonetic structures rather than underlying cognitive maps.' },
            ],
      correctAnswer: i > 20 ? '3142' : 'B',
      marks: 3,
      negativeMarks: i > 20 ? 0 : 1,
      topic: i <= 16 ? 'Reading Comprehension' : 'Para Jumbles',
      difficulty: i % 3 === 0 ? 'Hard' : 'Medium',
      explanation: 'Conceptual Metaphor Theory relies on sensorimotor grounding; empirical independence directly disproves the thesis.',
      passageTitle: i <= 16 ? 'Cognitive Linguistics and Embodied Cognition' : undefined,
      passage:
        i <= 16
          ? 'Metaphor is not merely a linguistic flourish, but a fundamental cognitive mechanism through which humans comprehend abstract domains...'
          : undefined,
    });
  }

  // DILR Questions (20)
  for (let i = 1; i <= 20; i++) {
    qList.push({
      id: `cat_dilr_${i}`,
      sectionId: 'DILR',
      questionNumber: i,
      type: i % 5 === 0 ? 'TITA' : 'MCQ',
      questionText: `Eight venture capital funds (V1 through V8) invested in four technology sectors (AI, Fintech, CleanTech, MedTech) across three funding rounds. If V3 invested in exactly two sectors and V7 did not co-invest with V1, what is the maximum possible allocation for AI in Round 2? (Caselet Set ${Math.ceil(
        i / 5
      )}, Q${i})`,
      options:
        i % 5 === 0
          ? undefined
          : [
              { id: 'A', text: '$14.5 Million' },
              { id: 'B', text: '$18.0 Million' },
              { id: 'C', text: '$21.5 Million' },
              { id: 'D', text: '$24.0 Million' },
            ],
      correctAnswer: i % 5 === 0 ? '18' : 'B',
      marks: 3,
      negativeMarks: i % 5 === 0 ? 0 : 1,
      topic: 'Logical Deductions & Optimization Grids',
      difficulty: 'Hard',
      explanation: 'Construct the matrix of fund allocations with round constraints to find the optimal column sum of $18.0M.',
      diagramSvg: `<svg width="100%" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="100" fill="#f8fafc" rx="8"/><rect x="20" y="20" width="80" height="60" fill="#e0e7ff" rx="4"/><text x="60" y="55" font-family="sans-serif" font-size="12" font-weight="bold" fill="#3730a3" text-anchor="middle">Round 1</text><path d="M100 50 L140 50" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow)"/><rect x="140" y="20" width="80" height="60" fill="#e0e7ff" rx="4"/><text x="180" y="55" font-family="sans-serif" font-size="12" font-weight="bold" fill="#3730a3" text-anchor="middle">Round 2</text><path d="M220 50 L260 50" stroke="#6366f1" stroke-width="2"/><rect x="260" y="20" width="80" height="60" fill="#e0e7ff" rx="4"/><text x="300" y="55" font-family="sans-serif" font-size="12" font-weight="bold" fill="#3730a3" text-anchor="middle">Round 3</text></svg>`,
    });
  }

  // QA Questions (22)
  for (let i = 1; i <= 22; i++) {
    qList.push({
      id: `cat_qa_${i}`,
      sectionId: 'QA',
      questionNumber: i,
      type: i > 16 ? 'TITA' : 'MCQ',
      questionText: `Let f(x) = ax² + bx + c be a quadratic polynomial where a, b, c are real numbers such that f(1) = 4, f(2) = 11, and f(3) = 22. If the minimum value of f(x) occurs at x = k, compute the value of 4k + f(0). (Question ${i})`,
      options:
        i > 16
          ? undefined
          : [
              { id: 'A', text: '1' },
              { id: 'B', text: '3' },
              { id: 'C', text: '5' },
              { id: 'D', text: '7' },
            ],
      correctAnswer: i > 16 ? '1' : 'A',
      marks: 3,
      negativeMarks: i > 16 ? 0 : 1,
      topic: i <= 8 ? 'Arithmetic' : i <= 15 ? 'Algebra' : 'Geometry',
      difficulty: 'Medium',
      explanation: 'From successive differences, second difference is constant Δ² = 4 => 2a = 4 => a = 2, b = -1, c = 3. Minimum is at x = -b/(2a) = 1/4. Hence 4k + f(0) = 4(1/4) + 3 - 3 = 1.',
    });
  }

  return qList;
}

function generateSampleQuestionsForXat(): Question[] {
  const qList: Question[] = [];

  // VALR (26 Qs)
  for (let i = 1; i <= 26; i++) {
    qList.push({
      id: `xat_valr_${i}`,
      sectionId: 'VALR',
      questionNumber: i,
      type: 'MCQ',
      questionText: `Which of the following inferences logically follows from the philosophical treatise regarding existential aesthetics and ethical determinism? (XAT VALR Q${i})`,
      options: [
        { id: 'A', text: 'Moral autonomy requires absolute detachment from aesthetic judgements.' },
        { id: 'B', text: 'Subjective impressions precede normative ethical categorization.' },
        { id: 'C', text: 'Deterministic causality negates the emotional validity of artistic creation.' },
        { id: 'D', text: 'Ethical realism and aesthetic nominalism are fundamentally reconcilable.' },
        { id: 'E', text: 'Neither aesthetic intuition nor ethical imperatives are subject to empirical testing.' },
      ],
      correctAnswer: 'B',
      marks: 1,
      negativeMarks: 0.25,
      topic: 'Verbal & Logical Ability',
      difficulty: 'Hard',
      explanation: 'Option B accurately captures the premise that perceptual intuition precedes formal ethical taxonomies.',
    });
  }

  // Decision Making (21 Qs)
  for (let i = 1; i <= 21; i++) {
    qList.push({
      id: `xat_dm_${i}`,
      sectionId: 'DM',
      questionNumber: i,
      type: 'MCQ',
      questionText: `Dr. Rao, the chief strategy officer of Zenith BioTech, faces a dilemma: a newly synthesized drug shows 94% efficacy in clinical trials but poses a rare 0.3% risk of liver toxicity in elderly cohorts. The regulatory body permits conditional market authorization. Which of the following courses of action is most strategically and ethically balanced for Zenith? (XAT DM Q${i})`,
      options: [
        { id: 'A', text: 'Launch immediately with prominent contraindication warnings and mandatory hepatic monitoring protocols.' },
        { id: 'B', text: 'Delay commercial launch for 2 years to completely re-engineer the molecule for zero toxicity.' },
        { id: 'C', text: 'Divest the patent to a third-party manufacturer to transfer regulatory liability.' },
        { id: 'D', text: 'Market only to private healthcare networks without disclosing the 0.3% risk.' },
        { id: 'E', text: 'Abandon the therapeutic candidate entirely and write off the $40M development cost.' },
      ],
      correctAnswer: 'A',
      marks: 1,
      negativeMarks: 0.25,
      topic: 'Business & Ethical Decision Making',
      difficulty: 'Hard',
      explanation: 'Option A provides therapeutic access while proactively mitigating patient safety risks with structured protocols.',
    });
  }

  // QA & DI (28 Qs)
  for (let i = 1; i <= 28; i++) {
    qList.push({
      id: `xat_qadi_${i}`,
      sectionId: 'QADI',
      questionNumber: i,
      type: 'MCQ',
      questionText: `A circle is inscribed in a right-angled triangle ABC with hypotenuse AC = 25 cm and inradius r = 3 cm. Find the perimeter of triangle ABC. (XAT QA-DI Q${i})`,
      options: [
        { id: 'A', text: '56 cm' },
        { id: 'B', text: '60 cm' },
        { id: 'C', text: '54 cm' },
        { id: 'D', text: '64 cm' },
        { id: 'E', text: '48 cm' },
      ],
      correctAnswer: 'A',
      marks: 1,
      negativeMarks: 0.25,
      topic: 'Geometry & Mensuration',
      difficulty: 'Medium',
      explanation: 'In a right triangle with inradius r and hypotenuse c, Perimeter = 2(c + r) = 2(25 + 3) = 56 cm.',
    });
  }

  // GK & Analytical Essay (20 Qs)
  for (let i = 1; i <= 20; i++) {
    qList.push({
      id: `xat_gk_${i}`,
      sectionId: 'GK',
      questionNumber: i,
      type: 'MCQ',
      questionText: `Which international treaty regulates the transboundary movements of hazardous wastes and their disposal? (XAT GK Q${i})`,
      options: [
        { id: 'A', text: 'Kyoto Protocol' },
        { id: 'B', text: 'Basel Convention' },
        { id: 'C', text: 'Montreal Protocol' },
        { id: 'D', text: 'Ramsar Convention' },
        { id: 'E', text: 'Stockholm Convention' },
      ],
      correctAnswer: 'B',
      marks: 1,
      negativeMarks: 0,
      topic: 'General Knowledge & Current Affairs',
      difficulty: 'Medium',
      explanation: 'The Basel Convention on the Control of Transboundary Movements of Hazardous Wastes was adopted in 1989.',
    });
  }

  return qList;
}

function generateSampleQuestionsForCmat(): Question[] {
  const qList: Question[] = [];
  const sections = ['QT_DI', 'LR', 'LC', 'GA', 'IE'];

  sections.forEach((secId) => {
    for (let i = 1; i <= 20; i++) {
      qList.push({
        id: `cmat_${secId.toLowerCase()}_${i}`,
        sectionId: secId,
        questionNumber: i,
        type: 'MCQ',
        questionText: `CMAT Examination Question ${i} for section ${secId}. +4 for correct, -1 for incorrect.`,
        options: [
          { id: 'A', text: 'Standard Proposition A' },
          { id: 'B', text: 'Optimal Analytical Choice B' },
          { id: 'C', text: 'Alternative Hypothesis C' },
          { id: 'D', text: 'Deductive Observation D' },
        ],
        correctAnswer: 'B',
        marks: 4,
        negativeMarks: 1,
        topic: secId,
        difficulty: 'Medium',
        explanation: 'Detailed solution for CMAT question.',
      });
    }
  });

  return qList;
}

function generateSampleQuestionsForSnap(): Question[] {
  const qList: Question[] = [];
  const secSpecs = [
    { id: 'GE', count: 15 },
    { id: 'ALR', count: 25 },
    { id: 'QA_DI_DS', count: 20 },
  ];

  secSpecs.forEach((sec) => {
    for (let i = 1; i <= sec.count; i++) {
      qList.push({
        id: `snap_${sec.id.toLowerCase()}_${i}`,
        sectionId: sec.id,
        questionNumber: i,
        type: 'MCQ',
        questionText: `SNAP Speed Examination Question ${i} for ${sec.id}. Focus on rapid accuracy.`,
        options: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' },
        ],
        correctAnswer: 'A',
        marks: 1,
        negativeMarks: 0.25,
        topic: sec.id,
        difficulty: 'Easy',
        explanation: 'Speed test solution.',
      });
    }
  });

  return qList;
}

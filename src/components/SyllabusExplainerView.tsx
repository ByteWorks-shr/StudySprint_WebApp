import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  FlaskConical,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Languages,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Check,
  Plus,
  Trash2,
  Loader2,
  Target,
  Award,
  BookMarked,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  SyllabusDocument,
  SyllabusSubject,
  SyllabusUnit,
  SyllabusTopic,
  SyllabusPractical,
  TermWorkItem,
  MicroProjectInfo,
  StudentCurriculumProgress,
  StudyPlan,
  StudyTask,
} from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { SAMPLE_SBTE_5TH_SEM_SYLLABUS } from '../utils/sampleSyllabusText';
import { generateId } from '../services/studyService';
import { TopicExplanationModal } from './TopicExplanationModal';
import { SyllabusChatDrawer } from './SyllabusChatDrawer';
import { GenerateSyllabusPlanModal } from './GenerateSyllabusPlanModal';

interface SyllabusExplainerViewProps {
  userId: string;
  syllabi: SyllabusDocument[];
  onSaveSyllabus: (syllabus: SyllabusDocument) => void;
  onDeleteSyllabus: (syllabusId: string) => void;
  curriculumProgress: StudentCurriculumProgress | null;
  onSaveProgress: (progress: StudentCurriculumProgress) => void;
  onSavePlan: (plan: StudyPlan) => void;
  onSaveTasksBatch: (tasks: StudyTask[]) => void;
  onNavigateToPlanner: () => void;
}

export const SyllabusExplainerView: React.FC<SyllabusExplainerViewProps> = ({
  userId,
  syllabi,
  onSaveSyllabus,
  onDeleteSyllabus,
  curriculumProgress,
  onSaveProgress,
  onSavePlan,
  onSaveTasksBatch,
  onNavigateToPlanner,
}) => {
  // Active syllabus selection
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>(() => {
    return syllabi.length > 0 ? syllabi[0].id : '';
  });

  const activeSyllabus = useMemo(() => {
    return syllabi.find((s) => s.id === selectedSyllabusId) || syllabi[0] || null;
  }, [syllabi, selectedSyllabusId]);

  // Tab & Language Controls
  const [activeTab, setActiveTab] = useState<
    'overview' | 'theory' | 'practicals' | 'term_work' | 'micro_projects' | 'assessment'
  >('theory');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Expandable sections state
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({});

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedTopicForModal, setSelectedTopicForModal] = useState<{
    topic: SyllabusTopic;
    subjectName: string;
    unitTitle: string;
  } | null>(null);

  // Upload & Analysis Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [universityInput, setUniversityInput] = useState('SBTE Bihar');
  const [courseInput, setCourseInput] = useState('Diploma in Computer Science & Engineering');
  const [branchInput, setBranchInput] = useState('Computer Science & Engineering');
  const [semesterInput, setSemesterInput] = useState('5th Semester');
  const [academicYearInput, setAcademicYearInput] = useState('2024-2025');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Micro-Project Ideas generator state
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // Toggle subject accordion
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjectIds((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  // Toggle unit accordion
  const toggleUnit = (unitId: string) => {
    setExpandedUnitIds((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  // Progress helpers
  const completedTopicIds = useMemo(() => {
    return new Set(curriculumProgress?.completedTopicIds || []);
  }, [curriculumProgress]);

  const inProgressTopicIds = useMemo(() => {
    return new Set(curriculumProgress?.inProgressTopicIds || []);
  }, [curriculumProgress]);

  const completedPracticalIds = useMemo(() => {
    return new Set(curriculumProgress?.completedPracticalIds || []);
  }, [curriculumProgress]);

  const recordSubmittedIds = useMemo(() => {
    return new Set(curriculumProgress?.recordSubmittedPracticalIds || []);
  }, [curriculumProgress]);

  const completedTermWorkIds = useMemo(() => {
    return new Set(curriculumProgress?.completedTermWorkIds || []);
  }, [curriculumProgress]);

  const handleToggleTopicStatus = (
    topicId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ) => {
    if (!activeSyllabus) return;
    const progressId = `prog_${activeSyllabus.id}`;
    let newCompleted = new Set(completedTopicIds);
    let newInProgress = new Set(inProgressTopicIds);

    if (status === 'completed') {
      newCompleted.add(topicId);
      newInProgress.delete(topicId);
    } else if (status === 'in_progress') {
      newInProgress.add(topicId);
      newCompleted.delete(topicId);
    } else {
      newCompleted.delete(topicId);
      newInProgress.delete(topicId);
    }

    const updatedProgress: StudentCurriculumProgress = {
      id: progressId,
      userId,
      syllabusId: activeSyllabus.id,
      completedTopicIds: Array.from(newCompleted),
      inProgressTopicIds: Array.from(newInProgress),
      completedPracticalIds: Array.from(completedPracticalIds),
      recordSubmittedPracticalIds: Array.from(recordSubmittedIds),
      completedTermWorkIds: Array.from(completedTermWorkIds),
      customTermWorkDeadlines: curriculumProgress?.customTermWorkDeadlines || {},
      microProjectStagesCompleted: curriculumProgress?.microProjectStagesCompleted || {},
      updatedAt: new Date().toISOString(),
    };
    onSaveProgress(updatedProgress);
  };

  const handleTogglePractical = (practicalId: string) => {
    if (!activeSyllabus) return;
    const progressId = `prog_${activeSyllabus.id}`;
    const newCompleted = new Set(completedPracticalIds);
    if (newCompleted.has(practicalId)) {
      newCompleted.delete(practicalId);
    } else {
      newCompleted.add(practicalId);
    }

    onSaveProgress({
      id: progressId,
      userId,
      syllabusId: activeSyllabus.id,
      completedTopicIds: Array.from(completedTopicIds),
      inProgressTopicIds: Array.from(inProgressTopicIds),
      completedPracticalIds: Array.from(newCompleted),
      recordSubmittedPracticalIds: Array.from(recordSubmittedIds),
      completedTermWorkIds: Array.from(completedTermWorkIds),
      customTermWorkDeadlines: curriculumProgress?.customTermWorkDeadlines || {},
      microProjectStagesCompleted: curriculumProgress?.microProjectStagesCompleted || {},
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTogglePracticalRecord = (practicalId: string) => {
    if (!activeSyllabus) return;
    const progressId = `prog_${activeSyllabus.id}`;
    const newRecords = new Set(recordSubmittedIds);
    if (newRecords.has(practicalId)) {
      newRecords.delete(practicalId);
    } else {
      newRecords.add(practicalId);
    }

    onSaveProgress({
      id: progressId,
      userId,
      syllabusId: activeSyllabus.id,
      completedTopicIds: Array.from(completedTopicIds),
      inProgressTopicIds: Array.from(inProgressTopicIds),
      completedPracticalIds: Array.from(completedPracticalIds),
      recordSubmittedPracticalIds: Array.from(newRecords),
      completedTermWorkIds: Array.from(completedTermWorkIds),
      customTermWorkDeadlines: curriculumProgress?.customTermWorkDeadlines || {},
      microProjectStagesCompleted: curriculumProgress?.microProjectStagesCompleted || {},
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleTermWork = (termWorkId: string) => {
    if (!activeSyllabus) return;
    const progressId = `prog_${activeSyllabus.id}`;
    const newCompleted = new Set(completedTermWorkIds);
    if (newCompleted.has(termWorkId)) {
      newCompleted.delete(termWorkId);
    } else {
      newCompleted.add(termWorkId);
    }

    onSaveProgress({
      id: progressId,
      userId,
      syllabusId: activeSyllabus.id,
      completedTopicIds: Array.from(completedTopicIds),
      inProgressTopicIds: Array.from(inProgressTopicIds),
      completedPracticalIds: Array.from(completedPracticalIds),
      recordSubmittedPracticalIds: Array.from(recordSubmittedIds),
      completedTermWorkIds: Array.from(newCompleted),
      customTermWorkDeadlines: curriculumProgress?.customTermWorkDeadlines || {},
      microProjectStagesCompleted: curriculumProgress?.microProjectStagesCompleted || {},
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSetTermWorkDeadline = (termWorkId: string, deadline: string) => {
    if (!activeSyllabus) return;
    const progressId = `prog_${activeSyllabus.id}`;
    const customDeadlines = {
      ...(curriculumProgress?.customTermWorkDeadlines || {}),
      [termWorkId]: deadline,
    };

    onSaveProgress({
      id: progressId,
      userId,
      syllabusId: activeSyllabus.id,
      completedTopicIds: Array.from(completedTopicIds),
      inProgressTopicIds: Array.from(inProgressTopicIds),
      completedPracticalIds: Array.from(completedPracticalIds),
      recordSubmittedPracticalIds: Array.from(recordSubmittedIds),
      completedTermWorkIds: Array.from(completedTermWorkIds),
      customTermWorkDeadlines: customDeadlines,
      microProjectStagesCompleted: curriculumProgress?.microProjectStagesCompleted || {},
      updatedAt: new Date().toISOString(),
    });
  };

  // Perform Analysis workflow
  const handleAnalyzeDocument = async (textToAnalyze: string, docMeta: any) => {
    setIsAnalyzing(true);
    setUploadError(null);
    setAnalysisStep('1. Reading document & verifying curriculum layout...');

    try {
      setAnalysisStep('2. Parsing courses, units, and learning outcomes with Gemini...');
      const response = await fetch('/api/gemini/analyze-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedText: textToAnalyze,
          metadata: docMeta,
        }),
      });

      if (!response.ok) {
        throw new Error('Syllabus analysis request failed');
      }

      setAnalysisStep('3. Generating student-friendly topic explanations & real-world examples...');
      const data = await response.json();
      const analysis = data.analysis;

      setAnalysisStep('4. Organizing theory, labs, term work & micro-project milestones...');
      const newSyllabus: SyllabusDocument = {
        id: generateId('syl'),
        userId,
        title: `${docMeta.university || 'Board'} ${docMeta.branch || 'CSE'} (${docMeta.semester || 'Syllabus'})`,
        fileName: docMeta.fileName || 'Official_Syllabus.pdf',
        fileSize: docMeta.fileSize || textToAnalyze.length,
        pageCount: docMeta.pageCount || 1,
        university: docMeta.university,
        course: docMeta.course,
        branch: docMeta.branch,
        semester: docMeta.semester,
        academicYear: docMeta.academicYear,
        extractedText: textToAnalyze,
        analysis,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveSyllabus(newSyllabus);
      setSelectedSyllabusId(newSyllabus.id);
      setIsUploadModalOpen(false);
      setUploadFile(null);
    } catch (e: any) {
      console.error('Analysis error:', e);
      setUploadError(e.message || 'Failed to analyze syllabus document. Please ensure the document is clear.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleFileUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a syllabus document (PDF or text) to upload.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisStep('Extracting text content from uploaded file...');
      let extractedText = '';
      let pageCount = 1;

      if (uploadFile.name.endsWith('.pdf')) {
        const result = await extractTextFromPdf(uploadFile);
        extractedText = result.text;
        pageCount = result.pageCount;
      } else {
        extractedText = await uploadFile.text();
      }

      if (!extractedText.trim()) {
        throw new Error('Could not extract readable text from the document. Please verify the file.');
      }

      await handleAnalyzeDocument(extractedText, {
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        pageCount,
        university: universityInput,
        course: courseInput,
        branch: branchInput,
        semester: semesterInput,
        academicYear: academicYearInput,
      });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'File extraction failed');
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleSyllabus = async () => {
    await handleAnalyzeDocument(SAMPLE_SBTE_5TH_SEM_SYLLABUS, {
      fileName: 'SBTE_Bihar_5th_Sem_CSE_Syllabus.pdf',
      fileSize: SAMPLE_SBTE_5TH_SEM_SYLLABUS.length,
      pageCount: 6,
      university: 'SBTE Bihar',
      course: 'Diploma in Computer Science & Engineering',
      branch: 'Computer Science & Engineering',
      semester: '5th Semester',
      academicYear: '2024-2025',
    });
  };

  // Generate micro-project ideas
  const handleGenerateProjectIdeas = async (subjectName: string, topics: string[]) => {
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/gemini/micro-project-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          branch: activeSyllabus?.branch || 'Computer Science & Engineering',
          semester: activeSyllabus?.semester || '5th Semester',
          unitTopics: topics,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedIdeas(data.ideas || []);
      }
    } catch (e) {
      console.error('Project ideas generation error:', e);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Filtered subjects and units for Explorer
  const filteredSubjects = useMemo(() => {
    if (!activeSyllabus?.analysis?.subjects) return [];
    return activeSyllabus.analysis.subjects.filter((sub) => {
      if (selectedSubjectFilter !== 'all' && sub.name !== selectedSubjectFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSub = sub.name.toLowerCase().includes(q) || (sub.code && sub.code.toLowerCase().includes(q));
        const matchesUnit = sub.units.some(
          (u) =>
            u.title.toLowerCase().includes(q) ||
            u.topics.some((t) => t.name.toLowerCase().includes(q) || t.simpleExplanationEn.toLowerCase().includes(q))
        );
        return matchesSub || matchesUnit;
      }
      return true;
    });
  }, [activeSyllabus, selectedSubjectFilter, searchQuery]);

  // Overall stats
  const totalTopicsCount = useMemo(() => {
    if (!activeSyllabus?.analysis?.subjects) return 0;
    return activeSyllabus.analysis.subjects.reduce(
      (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.topics.length, 0),
      0
    );
  }, [activeSyllabus]);

  const topicsCompletedCount = completedTopicIds.size;
  const progressPercent = totalTopicsCount > 0 ? Math.round((topicsCompletedCount / totalTopicsCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* 1. Header & Navigation Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              AI Syllabus Explainer & Curriculum Hub
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">1st Year & College Students</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Understand My Syllabus
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Demystifies technical course outcomes, unit-wise concepts, practical requirements, term work, and micro-projects into an actionable roadmap.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/80">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                language === 'hi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Ask Syllabus AI */}
          {activeSyllabus && (
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask Syllabus AI</span>
            </button>
          )}

          {/* Generate Study Plan Button */}
          {activeSyllabus && (
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Generate My Study Plan</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Syllabus</span>
          </button>
        </div>
      </div>

      {/* 2. Syllabus Selector Bar (if syllabi exist) */}
      {syllabi.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Active Syllabus:</span>
            <select
              value={selectedSyllabusId}
              onChange={(e) => setSelectedSyllabusId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-hidden focus:border-indigo-500"
            >
              {syllabi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.fileName})
                </option>
              ))}
            </select>
          </div>

          {activeSyllabus && (
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Curriculum Mastery:</span>
                <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-200">{progressPercent}%</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this syllabus?')) {
                    onDeleteSyllabus(activeSyllabus.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Delete syllabus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Empty State (When no syllabus is uploaded yet) */}
      {!activeSyllabus && !isAnalyzing && (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-white">No Syllabus Document Uploaded Yet</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload your official university, college, or state technical board syllabus (PDF or text). StudySprint will analyze course outcomes, units, practicals, and create an easy learning roadmap.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload My Official Syllabus</span>
            </button>
            <button
              onClick={handleLoadSampleSyllabus}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition"
            >
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <span>Explore Sample SBTE Bihar 5th Sem CSE Syllabus</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Analysis In-Progress Indicator */}
      {isAnalyzing && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">AI Syllabus Analysis in Progress</h3>
            <p className="text-xs sm:text-sm text-indigo-300 font-medium">{analysisStep}</p>
          </div>
          <div className="max-w-md mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 w-3/4 animate-pulse rounded-full" />
          </div>
          <p className="text-xs text-slate-500">
            Extracting unit-wise topics, lab experiments, term work rules, and generating bilingual student-friendly explanations...
          </p>
        </div>
      )}

      {/* 5. Main Content: Active Syllabus Explorer */}
      {activeSyllabus && (
        <div className="space-y-6">
          {/* Document Summary Header Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  <span>{activeSyllabus.university || 'State Technical Board'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSyllabus.course || 'Curriculum'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSyllabus.semester || 'Semester'}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {activeSyllabus.branch ? `${activeSyllabus.branch} Curriculum Roadmap` : activeSyllabus.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  {activeSyllabus.analysis?.subjects?.length || 0} Subjects
                </span>
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  {activeSyllabus.analysis?.practicals?.length || 0} Practicals
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  {activeSyllabus.analysis?.termWork?.length || 0} Term Works
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              {activeSyllabus.analysis?.overview ||
                'This curriculum provides foundational and advanced engineering knowledge, balanced with rigorous lab practicals and continuous project work.'}
            </p>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
            {[
              { id: 'theory', label: 'Theory Subjects', icon: BookOpen },
              { id: 'practicals', label: 'Practical & Lab Work', icon: FlaskConical },
              { id: 'term_work', label: 'Term Work & Submissions', icon: FileCheck },
              { id: 'micro_projects', label: 'Academic Micro-Projects', icon: FolderGit2 },
              { id: 'overview', label: 'Preparation Strategy', icon: Target },
              { id: 'assessment', label: 'Exam & Evaluation Rules', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 max-w-md gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, units, lab experiments, terms..."
                className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-hidden w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium focus:outline-hidden"
              >
                <option value="all">All Subjects</option>
                {activeSyllabus.analysis?.subjects?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB 1: THEORY SUBJECTS EXPLORER */}
          {activeTab === 'theory' && (
            <div className="space-y-4">
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  No subjects or topics match your current search.
                </div>
              ) : (
                filteredSubjects.map((sub) => {
                  const isSubExpanded = expandedSubjectIds[sub.id] !== false; // expanded by default
                  const subTopics = sub.units.flatMap((u) => u.topics);
                  const subCompleted = subTopics.filter((t) => completedTopicIds.has(t.id)).length;
                  const subProgress = subTopics.length > 0 ? Math.round((subCompleted / subTopics.length) * 100) : 0;

                  return (
                    <div
                      key={sub.id}
                      className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg transition"
                    >
                      {/* Subject Header Card */}
                      <div
                        onClick={() => toggleSubject(sub.id)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 transition"
                      >
                        <div className="flex items-start gap-3">
                          <button className="p-1 rounded-lg text-slate-400 hover:text-white mt-0.5">
                            {isSubExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              {sub.code && <span className="font-mono text-indigo-400 font-semibold">{sub.code}</span>}
                              {sub.code && <span aria-hidden="true">·</span>}
                              <span>{sub.units.length} Units</span>
                              <span aria-hidden="true">·</span>
                              <span>{subTopics.length} Topics</span>
                              {sub.credits && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{sub.credits} Credits</span>
                                </>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{sub.name}</h3>
                          </div>
                        </div>

                        {/* Subject Progress */}
                        <div className="flex items-center gap-4 text-xs text-slate-400 self-end sm:self-center">
                          <div className="flex items-center gap-2">
                            <span>Mastery:</span>
                            <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-400 h-1.5 rounded-full transition-all"
                                style={{ width: `${subProgress}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-300">
                              {subCompleted}/{subTopics.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Expanded Units */}
                      {isSubExpanded && (
                        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                          {/* Subject Purpose & Importance */}
                          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
                            <div className="text-slate-300 leading-relaxed">
                              <strong className="text-indigo-300">What is this subject about: </strong>
                              {language === 'hi' && sub.overviewHi ? sub.overviewHi : sub.overview}
                            </div>
                            {sub.importance && (
                              <div className="text-slate-400">
                                <strong className="text-emerald-300">Why it matters: </strong>
                                {sub.importance}
                              </div>
                            )}
                          </div>

                          {/* Unit Cards List */}
                          <div className="space-y-3">
                            {sub.units.map((unit) => {
                              const isUnitExpanded = expandedUnitIds[unit.id] !== false; // expanded by default
                              const unitCompleted = unit.topics.filter((t) => completedTopicIds.has(t.id)).length;

                              return (
                                <div
                                  key={unit.id}
                                  className="rounded-2xl bg-slate-950/60 border border-slate-800/90 overflow-hidden"
                                >
                                  {/* Unit Header */}
                                  <div
                                    onClick={() => toggleUnit(unit.id)}
                                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 transition"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      {isUnitExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                      <span className="text-xs font-bold text-indigo-400">
                                        Unit {unit.unitNumber}:
                                      </span>
                                      <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                        {unit.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                      <span>
                                        {unitCompleted}/{unit.topics.length} Done
                                      </span>
                                    </div>
                                  </div>

                                  {/* Unit Topics Table */}
                                  {isUnitExpanded && (
                                    <div className="p-3.5 border-t border-slate-800/60 space-y-2.5">
                                      {unit.overview && (
                                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                                          💡 {language === 'hi' && unit.overviewHi ? unit.overviewHi : unit.overview}
                                        </p>
                                      )}

                                      <div className="space-y-1.5">
                                        {unit.topics.map((topic) => {
                                          const isCompleted = completedTopicIds.has(topic.id);
                                          const isInProgress = inProgressTopicIds.has(topic.id);

                                          return (
                                            <div
                                              key={topic.id}
                                              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                                            >
                                              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                                                <button
                                                  onClick={() =>
                                                    handleToggleTopicStatus(
                                                      topic.id,
                                                      isCompleted ? 'not_started' : 'completed'
                                                    )
                                                  }
                                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                                                    isCompleted
                                                      ? 'bg-emerald-500 text-white'
                                                      : isInProgress
                                                      ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                                                      : 'border border-slate-700 hover:border-slate-500 text-transparent'
                                                  }`}
                                                  title="Toggle completed"
                                                >
                                                  <Check className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="min-w-0">
                                                  <span
                                                    onClick={() =>
                                                      setSelectedTopicForModal({
                                                        topic,
                                                        subjectName: sub.name,
                                                        unitTitle: `Unit ${unit.unitNumber}: ${unit.title}`,
                                                      })
                                                    }
                                                    className={`text-xs font-medium cursor-pointer hover:text-indigo-400 transition truncate block ${
                                                      isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'
                                                    }`}
                                                  >
                                                    {topic.name}
                                                  </span>
                                                  {topic.realWorldExample && (
                                                    <span className="text-[11px] text-slate-500 truncate block">
                                                      e.g. {topic.realWorldExample}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                  onClick={() =>
                                                    setSelectedTopicForModal({
                                                      topic,
                                                      subjectName: sub.name,
                                                      unitTitle: `Unit ${unit.unitNumber}: ${unit.title}`,
                                                    })
                                                  }
                                                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
                                                >
                                                  <span>Explain</span>
                                                  <ArrowRight className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: PRACTICAL AND LAB WORK */}
          {activeTab === 'practicals' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Laboratory Practical Experiments</h3>
                  <p className="text-xs text-slate-400">
                    Experiments extracted directly from your official curriculum with pre-lab prep instructions
                  </p>
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {completedPracticalIds.size} / {activeSyllabus.analysis?.practicals?.length || 0} Performed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeSyllabus.analysis?.practicals?.map((prac) => {
                  const isDone = completedPracticalIds.has(prac.id);
                  const isRecordDone = recordSubmittedIds.has(prac.id);

                  return (
                    <div
                      key={prac.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-indigo-400">
                            Practical #{prac.experimentNumber} · {prac.subjectName}
                          </span>
                          {prac.isCompulsory && (
                            <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                              Compulsory
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white">{prac.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong>Objective: </strong>
                          {prac.objective}
                        </p>

                        {prac.prerequisites && prac.prerequisites.length > 0 && (
                          <div className="text-[11px] text-slate-400">
                            <strong>Pre-lab Concepts: </strong>
                            {prac.prerequisites.join(', ')}
                          </div>
                        )}

                        {prac.requiredTools && prac.requiredTools.length > 0 && (
                          <div className="text-[11px] text-slate-400">
                            <strong>Software / Tools: </strong>
                            {prac.requiredTools.join(', ')}
                          </div>
                        )}

                        {prac.preparationChecklist && prac.preparationChecklist.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                            <span className="font-semibold text-emerald-300 block">Pre-Lab Checklist:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {prac.preparationChecklist.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Practical Checkboxes */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleTogglePractical(prac.id)}
                            className="rounded-sm accent-indigo-500"
                          />
                          <span>Lab Executed</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={isRecordDone}
                            onChange={() => handleTogglePracticalRecord(prac.id)}
                            className="rounded-sm accent-emerald-500"
                          />
                          <span>Journal Certified</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TERM WORK & SUBMISSIONS */}
          {activeTab === 'term_work' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-sm font-bold text-white">Term Work & Continuous Assessment Submissions</h3>
                <p className="text-xs text-slate-400">
                  Track journals, laboratory assignments, teacher signatures, and set your submission deadlines
                </p>
              </div>

              <div className="space-y-3">
                {activeSyllabus.analysis?.termWork?.map((tw) => {
                  const isDone = completedTermWorkIds.has(tw.id);
                  const currentDeadline = curriculumProgress?.customTermWorkDeadlines?.[tw.id] || tw.defaultDeadline || '';

                  return (
                    <div
                      key={tw.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                          <span>{tw.subjectName}</span>
                          {tw.marks && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-400 font-bold">{tw.marks} Marks</span>
                            </>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{tw.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{tw.description}</p>
                        {tw.submissionRequirements && (
                          <p className="text-[11px] text-slate-400">
                            <strong>Submission Guidelines: </strong>
                            {tw.submissionRequirements}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Target Date:</span>
                          <input
                            type="date"
                            value={currentDeadline}
                            onChange={(e) => handleSetTermWorkDeadline(tw.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>

                        <button
                          onClick={() => handleToggleTermWork(tw.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Submitted & Signed' : 'Mark as Submitted'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC MICRO-PROJECTS */}
          {activeTab === 'micro_projects' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-sm font-bold text-white">Academic Micro-Projects Guidance</h3>
                <p className="text-xs text-slate-400">
                  Manage the 5 official lifecycle milestones from topic approval to external viva voce
                </p>
              </div>

              {activeSyllabus.analysis?.microProjects?.map((mp) => (
                <div key={mp.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">{mp.subjectName}</span>
                      <h4 className="text-base font-bold text-white">Official Project Requirements</h4>
                    </div>
                    {mp.evaluationCriteria && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {mp.evaluationCriteria}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{mp.officialRequirements}</p>

                  {/* 5 Milestone Stages */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      5-Stage Milestone Progression
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {mp.stages?.map((stage, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                            <span>Stage {sIdx + 1}</span>
                          </div>
                          <span className="text-xs font-semibold text-white block">{stage.stageName}</span>
                          <p className="text-[11px] text-slate-400 leading-snug">{stage.description}</p>
                          <span className="text-[10px] text-emerald-400 block pt-1">
                            Deliverable: {stage.deliverables}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Project Ideas Generator Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Need high-yield project ideas?</span>
                      <span className="text-[11px] text-slate-400">
                        Generate tailored project concepts using concepts from this syllabus.
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleGenerateProjectIdeas(
                          mp.subjectName,
                          activeSyllabus.analysis?.subjects?.flatMap((s) => s.units.map((u) => u.title)) || []
                        )
                      }
                      disabled={isGeneratingIdeas}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition"
                    >
                      {isGeneratingIdeas ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Brainstorming...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Project Ideas</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Generated Ideas Display */}
                  {generatedIdeas.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {generatedIdeas.map((idea, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between text-indigo-300 font-bold">
                            <span>Idea #{iIdx + 1}: {idea.title}</span>
                            <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 border border-indigo-500/30">
                              {idea.techStack}
                            </span>
                          </div>
                          <p className="text-slate-300">{idea.description}</p>
                          <p className="text-[11px] text-slate-400">
                            <strong>Relevance: </strong>
                            {idea.realWorldRelevance}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: PREPARATION STRATEGY */}
          {activeTab === 'overview' && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Semester Study Strategy & Time Allocation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Based on your official curriculum breakdown, here is the recommended plan for excelling in both theory exams and external practical vivas:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Phase 1: Foundation (Weeks 1-4)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Focus on Unit 1 and Unit 2 across all subjects. Ensure prerequisite clarity (OOP logic, basic data communications, and syntax basics). Complete first 3 lab exercises.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Phase 2: High-Yield Units (Weeks 5-10)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tackle heavily weighted topics: Multithreading & JDBC in Java, Testing in Software Engineering, and Subnetting in Networks. Approve micro-project topic and begin implementation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Phase 3: Sprint & Viva Prep (Weeks 11-14)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Solve past 3 years Board exam questions (4-mark and 6-mark questions). Certify all lab journals with faculty and conduct mock viva demonstrations.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Convert this Strategy into Daily Schedule</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: EVALUATION RULES & COURSE OUTCOMES */}
          {activeTab === 'assessment' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Examination & Passing Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-indigo-400 font-bold block">Internal Assessments (IA/CT)</span>
                    <p className="text-slate-300">
                      {activeSyllabus.analysis?.evaluationCriteria?.internalAssessment ||
                        'Consists of Class Tests (20 marks) + Teacher Assessment/Assignments (10 marks). Minimum 40% aggregate required.'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">End Semester Examination (ESE)</span>
                    <p className="text-slate-300">
                      {activeSyllabus.analysis?.evaluationCriteria?.externalExam ||
                        '70 Marks Board Exam (Duration 3 Hours) with objective, short (4-mark), and detailed (6-mark) question patterns.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Outcomes Mapping */}
              {activeSyllabus.analysis?.courseOutcomes && activeSyllabus.analysis.courseOutcomes.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">Course Outcomes (CO) Mapping</h3>
                  <div className="space-y-2">
                    {activeSyllabus.analysis.courseOutcomes.map((co, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs"
                      >
                        <span className="font-mono text-indigo-400 font-bold shrink-0">{co.code}</span>
                        <p className="text-slate-300">{co.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Upload Syllabus Document</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUploadAndAnalyze} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-2 cursor-pointer transition ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : uploadFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
                onClick={() => {
                  const input = document.getElementById('syllabus-file-input');
                  if (input) input.click();
                }}
              >
                <input
                  id="syllabus-file-input"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                />
                <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
                {uploadFile ? (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">{uploadFile.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(uploadFile.size / 1024).toFixed(1)} KB · Ready to analyze
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      Drop syllabus PDF here, or click to browse
                    </p>
                    <p className="text-[11px] text-slate-400">Supported: PDF, TXT files</p>
                  </div>
                )}
              </div>

              {/* Optional Metadata Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">University / Board</label>
                  <input
                    type="text"
                    value={universityInput}
                    onChange={(e) => setUniversityInput(e.target.value)}
                    placeholder="e.g. SBTE Bihar, AICTE, MSBTE"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Branch / Course</label>
                  <input
                    type="text"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    placeholder="e.g. Computer Science & Engg"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Semester / Year</label>
                  <input
                    type="text"
                    value={semesterInput}
                    onChange={(e) => setSemesterInput(e.target.value)}
                    placeholder="e.g. 5th Semester / 1st Year"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYearInput}
                    onChange={(e) => setAcademicYearInput(e.target.value)}
                    placeholder="e.g. 2024-2025"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleLoadSampleSyllabus}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Load Sample SBTE Bihar 5th Sem
                </button>

                <button
                  type="submit"
                  disabled={!uploadFile || isAnalyzing}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Topic Deep Dive Explanation Modal */}
      {selectedTopicForModal && (
        <TopicExplanationModal
          isOpen={true}
          onClose={() => setSelectedTopicForModal(null)}
          topic={selectedTopicForModal.topic}
          subjectName={selectedTopicForModal.subjectName}
          unitTitle={selectedTopicForModal.unitTitle}
          language={language}
          onToggleStatus={handleToggleTopicStatus}
          currentStatus={
            completedTopicIds.has(selectedTopicForModal.topic.id)
              ? 'completed'
              : inProgressTopicIds.has(selectedTopicForModal.topic.id)
              ? 'in_progress'
              : 'not_started'
          }
        />
      )}

      {/* 8. Dedicated Syllabus Chat Drawer */}
      <SyllabusChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        syllabus={activeSyllabus}
      />

      {/* 9. Curriculum-Based Smart Study Planner Generator Modal */}
      <GenerateSyllabusPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        syllabus={activeSyllabus}
        userId={userId}
        onSavePlan={onSavePlan}
        onSaveTasksBatch={onSaveTasksBatch}
        onNavigateToPlanner={onNavigateToPlanner}
      />
    </div>
  );
};

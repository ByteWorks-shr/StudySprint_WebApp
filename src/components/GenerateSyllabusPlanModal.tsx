import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Target,
  CheckSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { SyllabusDocument, StudyPlan, StudyTask } from '../types';
import { generateId } from '../services/studyService';

interface GenerateSyllabusPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  syllabus: SyllabusDocument | null;
  userId: string;
  onSavePlan: (plan: StudyPlan) => void;
  onSaveTasksBatch: (tasks: StudyTask[]) => void;
  onNavigateToPlanner: () => void;
}

export const GenerateSyllabusPlanModal: React.FC<GenerateSyllabusPlanModalProps> = ({
  isOpen,
  onClose,
  syllabus,
  userId,
  onSavePlan,
  onSaveTasksBatch,
  onNavigateToPlanner,
}) => {
  const [examDate, setExamDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 30);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState(3.5);
  const [knowledgeLevel, setKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    return syllabus?.analysis?.subjects?.map((s) => s.name) || [];
  });
  const [includePracticals, setIncludePracticals] = useState(true);
  const [includeTermWork, setIncludeTermWork] = useState(true);
  const [includeMicroProjects, setIncludeMicroProjects] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<StudyTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !syllabus) return null;

  const subjectsList = syllabus.analysis?.subjects || [];

  const handleToggleSubject = (subName: string) => {
    if (selectedSubjects.includes(subName)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subName));
    } else {
      setSelectedSubjects([...selectedSubjects, subName]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject to include in your plan.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsSaved(false);

    try {
      const activeSubjectsPayload = subjectsList
        .filter((s) => selectedSubjects.includes(s.name))
        .map((s) => ({
          name: s.name,
          units: s.units.map((u) => ({
            title: `Unit ${u.unitNumber}: ${u.title}`,
            topics: u.topics.map((t) => t.name),
          })),
        }));

      const practicalsPayload = includePracticals
        ? syllabus.analysis?.practicals?.map((p) => ({
            title: `Exp ${p.experimentNumber}: ${p.title}`,
            subjectName: p.subjectName,
          }))
        : [];

      const termWorkPayload = includeTermWork
        ? syllabus.analysis?.termWork?.map((t) => ({
            title: t.title,
            subjectName: t.subjectName,
            deadline: t.customDeadline || t.defaultDeadline,
          }))
        : [];

      const microProjectsPayload = includeMicroProjects
        ? syllabus.analysis?.microProjects?.map((m) => ({
            subjectName: m.subjectName,
            stages: m.stages.map((st) => st.stageName),
          }))
        : [];

      const res = await fetch('/api/gemini/curriculum-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusTitle: syllabus.title,
          subjects: activeSubjectsPayload,
          practicals: practicalsPayload,
          termWork: termWorkPayload,
          microProjects: microProjectsPayload,
          examDate,
          dailyHours: Number(dailyHours),
          knowledgeLevel,
          prioritySubjects: selectedSubjects,
          includePracticals,
          includeTermWork,
          includeMicroProjects,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate smart curriculum plan');
      }

      const data = await res.json();
      const planData = data.plan;

      const newPlan: StudyPlan = {
        id: generateId('plan'),
        userId,
        title: `${syllabus.branch || syllabus.title} - Smart Board Exam Sprint`,
        examDate,
        dailyStudyHours: Number(dailyHours),
        subjects: selectedSubjects,
        schedule: (planData.sessions || []).map((s: any, idx: number) => ({
          dayNumber: s.dayNumber || idx + 1,
          dateOffsetDays: s.dateOffsetDays !== undefined ? s.dateOffsetDays : idx,
          subject: s.subject || 'General Study',
          topic: s.topic || 'Review',
          durationMinutes: s.durationMinutes || 60,
          priority: s.priority || 'medium',
          objectives: s.objectives || [],
          studyTechnique: s.studyTechnique || 'Active Recall',
          completed: false,
        })),
        summary: planData.summary || '',
        strategyTips: planData.strategyTips || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create matching StudyTasks from sessions so they appear in task system
      const baseDate = new Date();
      const tasksCreated: StudyTask[] = (planData.sessions || []).slice(0, 15).map((s: any, idx: number) => {
        const taskDue = new Date(baseDate.getTime() + (s.dateOffsetDays || idx) * 86400000);
        return {
          id: generateId('task'),
          userId,
          title: `[${s.subject}] ${s.topic}`,
          subject: s.subject || 'Curriculum',
          topic: s.topic || 'Syllabus Session',
          dueDate: taskDue.toISOString().split('T')[0],
          priority: s.priority === 'high' ? 'high' : s.priority === 'low' ? 'low' : 'medium',
          status: 'pending',
          estimatedMinutes: s.durationMinutes || 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setGeneratedPlan(newPlan);
      setGeneratedTasks(tasksCreated);
    } catch (e: any) {
      console.error('Plan generation failed:', e);
      setError(e.message || 'Could not generate plan from syllabus. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPlan = () => {
    if (!generatedPlan) return;
    onSavePlan(generatedPlan);
    if (generatedTasks.length > 0) {
      onSaveTasksBatch(generatedTasks);
    }
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Curriculum-Based Smart Plan</h2>
              <p className="text-xs text-slate-400">
                Maps your official syllabus topics, labs, and deadlines into a personalized daily roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Exam Date & Daily Study Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Target Exam / Board Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Available Study Time (Hours/Day): {dailyHours}h
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1h (Light)</span>
                    <span>3.5h (Standard)</span>
                    <span>8h (Intense Sprint)</span>
                  </div>
                </div>
              </div>

              {/* Student Knowledge Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Current Preparation Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setKnowledgeLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition ${
                        knowledgeLevel === lvl
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-xs'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Subjects to Include ({selectedSubjects.length} of {subjectsList.length} selected)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  {subjectsList.map((sub) => {
                    const isChecked = selectedSubjects.includes(sub.name);
                    return (
                      <label
                        key={sub.id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(sub.name)}
                          className="rounded-sm accent-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs text-white font-medium">{sub.name}</span>
                        {sub.code && <span className="text-[10px] text-slate-400">({sub.code})</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Curriculum Inclusions */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">Include Practical & Submission Milestones</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePracticals}
                      onChange={(e) => setIncludePracticals(e.target.checked)}
                      className="rounded-sm accent-indigo-500"
                    />
                    <span>Lab Practicals</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTermWork}
                      onChange={(e) => setIncludeTermWork(e.target.checked)}
                      className="rounded-sm accent-indigo-500"
                    />
                    <span>Term Work / Journals</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMicroProjects}
                      onChange={(e) => setIncludeMicroProjects(e.target.checked)}
                      className="rounded-sm accent-indigo-500"
                    />
                    <span>Micro-Project Stages</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing syllabus units & synthesizing optimal schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Personalized Study Plan</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Plan Generated Preview */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">{generatedPlan.title}</h4>
                  <p className="text-xs text-emerald-200/90 mt-0.5">{generatedPlan.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>{generatedPlan.schedule.length} Focused Sessions</span>
                    <span>·</span>
                    <span>{generatedPlan.dailyStudyHours}h Daily Target</span>
                    <span>·</span>
                    <span>Target Date: {generatedPlan.examDate}</span>
                  </div>
                </div>
              </div>

              {/* Strategy Tips */}
              {generatedPlan.strategyTips && generatedPlan.strategyTips.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <span className="text-xs font-semibold text-indigo-300 block">Preparation Strategy:</span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    {generatedPlan.strategyTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Sessions Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  First 5 Scheduled Sessions & Reasoning:
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {generatedPlan.schedule.slice(0, 5).map((session, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            Day {session.dayNumber}
                          </span>
                          <span className="text-xs font-semibold text-white">{session.subject}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-medium">{session.topic}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{session.durationMinutes}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                >
                  Adjust Parameters
                </button>

                {!isSaved ? (
                  <button
                    type="button"
                    onClick={handleApplyPlan}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Save to Planner & Create Tasks</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPlanner();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <span>View in Study Planner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

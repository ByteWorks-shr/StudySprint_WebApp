import React, { useState } from 'react';
import {
  Brain,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Save,
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronRight,
  Target,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { StudyPlan, StudyPlanSession } from '../types';
import { generateId } from '../services/studyService';

interface SmartPlanViewProps {
  currentPlan: StudyPlan | null;
  onSavePlan: (plan: StudyPlan) => void;
  userId: string;
  onStartSessionWithTopic: (subject: string, topic: string, durationMinutes: number) => void;
  onNavigateToSyllabus?: () => void;
}

export const SmartPlanView: React.FC<SmartPlanViewProps> = ({
  currentPlan,
  onSavePlan,
  userId,
  onStartSessionWithTopic,
  onNavigateToSyllabus,
}) => {
  const [title, setTitle] = useState('SBTE Bihar 5th Sem CSE Board Exam Sprint (30-Day Plan)');
  const [subjectsText, setSubjectsText] = useState('Java Programming, Software Engineering, Computer Networks, Python Programming, Cloud Computing');
  const [topicsText, setTopicsText] = useState('Multithreading & Synchronization, JDBC Connectivity, SDLC Models, Black-Box & White-Box Testing, OSI 7 Layers, IPv4 Subnetting, Cryptography RSA, Python OOP, Cloud SPI Model');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 25);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState(4.0);
  const [goal, setGoal] = useState('Score 80%+ in SBTE Bihar 5th Semester CSE Board Examination and clear all papers with distinction');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(currentPlan);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const subjects = subjectsText.split(',').map((s) => s.trim()).filter(Boolean);
      const topics = topicsText.split(',').map((t) => t.trim()).filter(Boolean);

      const response = await fetch('/api/gemini/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          topics,
          examDate,
          dailyHours: Number(dailyHours),
          goal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      const planData = data.plan;

      const newPlan: StudyPlan = {
        id: generateId('plan'),
        userId,
        title: planData.title || title,
        examDate,
        dailyStudyHours: Number(dailyHours),
        subjects,
        schedule: (planData.sessions || []).map((s: any, idx: number) => ({
          dayNumber: s.dayNumber || idx + 1,
          dateOffsetDays: s.dateOffsetDays || idx,
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

      setGeneratedPlan(newPlan);
      onSavePlan(newPlan);
      setSavedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error formulating study plan. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPlan = () => {
    if (!generatedPlan) return;
    onSavePlan(generatedPlan);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-400" />
          Smart Study Plan Generator
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Personalized daily schedules based on subjects, topics, exam deadlines, and available time
        </p>
      </div>

      {/* Syllabus Shortcut Banner */}
      {onNavigateToSyllabus && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Have your official college syllabus?</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Auto-extract your curriculum units, lab practicals, and term work milestones directly from your syllabus PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToSyllabus}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold whitespace-nowrap transition shrink-0"
          >
            Go to Syllabus Explainer
          </button>
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Exam / Deadline Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subjects (comma separated)
              </label>
              <input
                type="text"
                required
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                placeholder="e.g. Calculus, Physics, Organic Chemistry"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Available Daily Study Time (Hours/Day): {dailyHours}h
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Priority Topics & Weak Areas (comma separated)
            </label>
            <textarea
              rows={2}
              required
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder="e.g. Integration by Parts, Rotational Dynamics, Thermodynamics, Electromagnetism"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Goal / Target Outcome
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Score 90%+ on final exam and eliminate knowledge gaps"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Gemini algorithms optimize spaced repetition and cognitive load.
            </p>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Formulating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Study Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Plan Display */}
      {generatedPlan && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Study Plan
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {generatedPlan.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exam Deadline: {generatedPlan.examDate} • {generatedPlan.dailyStudyHours} hours/day
                </p>
              </div>

              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Plan Saved & Active
                  </span>
                )}
                <button
                  onClick={handleApplyPlan}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save / Set Active
                </button>
              </div>
            </div>

            {/* Plan Summary & Strategy tips */}
            {generatedPlan.summary && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-4 italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                "{generatedPlan.summary}"
              </p>
            )}

            {generatedPlan.strategyTips && generatedPlan.strategyTips.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Cognitive Strategy Tips
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {generatedPlan.strategyTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300"
                    >
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day by Day Session Timeline */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-white mb-3">Daily Study Schedule Sessions</h4>
              <div className="space-y-3">
                {generatedPlan.schedule.map((session, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                          Day {session.dayNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {session.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {session.durationMinutes} mins
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            session.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {session.priority.toUpperCase()}
                        </span>
                        {session.studyTechnique && (
                          <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {session.studyTechnique}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">{session.topic}</h4>

                      {session.objectives && session.objectives.length > 0 && (
                        <div className="text-xs text-slate-400 flex flex-wrap gap-2 pt-0.5">
                          {session.objectives.map((obj, oIdx) => (
                            <span key={oIdx} className="text-slate-400">
                              ✓ {obj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        onStartSessionWithTopic(
                          session.subject,
                          session.topic,
                          session.durationMinutes
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition self-start md:self-auto shrink-0 flex items-center gap-1.5"
                    >
                      <span>Study in Timer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

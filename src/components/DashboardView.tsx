import React from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  FileText,
  Brain,
  AlertCircle,
  TrendingUp,
  Layers,
  GraduationCap,
} from 'lucide-react';
import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  StudyPlan,
  UserStats,
  ViewTab,
} from '../types';

interface DashboardViewProps {
  materials: StudyMaterial[];
  pdfs: PdfDocument[];
  tasks: StudyTask[];
  activePlan: StudyPlan | null;
  stats: UserStats | null;
  onNavigate: (tab: ViewTab) => void;
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onStartSessionWithTopic: (subject: string, topic: string, durationMinutes?: number) => void;
  onOpenNewNoteModal: () => void;
  onOpenMic: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  materials,
  pdfs,
  tasks,
  activePlan,
  stats,
  onNavigate,
  onToggleTask,
  onStartSessionWithTopic,
  onOpenNewNoteModal,
  onOpenMic,
}) => {
  // Compute metrics
  const totalHours = Math.round(((stats?.totalStudyMinutes || 0) / 60) * 10) / 10;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Next upcoming sessions from active study plan
  const upcomingPlanSessions = (activePlan?.schedule || []).filter((s) => !s.completed).slice(0, 3);

  // Exam countdown
  let daysUntilExam: number | null = null;
  if (activePlan?.examDate) {
    const examTime = new Date(activePlan.examDate).getTime();
    const nowTime = new Date().setHours(0, 0, 0, 0);
    const diff = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
    daysUntilExam = diff > 0 ? diff : 0;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SBTE Bihar • Diploma 5th Sem CSE Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Ace Your 5th Sem Board Exams?
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              You are on a <span className="text-amber-400 font-bold">{stats?.currentStreak || 1}-day streak</span>! Master Java, Software Engineering, Networks, and Python with previous year questions and high-yield notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('timer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Focus Session
            </button>
            <button
              onClick={onOpenNewNoteModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Study Streak</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats?.currentStreak || 1}</span>
            <span className="text-xs text-amber-400 font-semibold">days active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Personal best: {stats?.longestStreak || 1} days
          </p>
        </div>

        {/* Total Time Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Studied</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalHours}</span>
            <span className="text-xs text-indigo-400 font-semibold">hours logged</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {stats?.totalStudyMinutes || 0} minutes of focused work
          </p>
        </div>

        {/* Task Completion Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Task Progress</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{taskCompletionRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">
              {completedTasks}/{tasks.length} done
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Materials & PDFs Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Knowledge Base</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{materials.length + pdfs.length}</span>
            <span className="text-xs text-purple-400 font-semibold">items indexed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {materials.length} notes • {pdfs.length} PDF books
          </p>
        </div>
      </div>

      {/* Main Content 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule & Smart Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Syllabus Explainer Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Module</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Curriculum Understanding</span>
                </div>
                <h3 className="text-base font-bold text-white">Understand My Syllabus</h3>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Upload your official university or diploma syllabus to break down unit topics, laboratory practicals, term work, and micro-projects with simple English and Hindi explanations.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('syllabus')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              <span>Explore My Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Plan / Today's Sessions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Smart Study Schedule</h2>
                  <p className="text-xs text-slate-400">
                    {activePlan ? activePlan.title : 'No active study plan generated yet'}
                  </p>
                </div>
              </div>

              {daysUntilExam !== null && (
                <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Exam in {daysUntilExam} days</span>
                </div>
              )}
            </div>

            {upcomingPlanSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingPlanSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
                      </div>
                      <h4 className="text-sm font-semibold text-white">{session.topic}</h4>
                      {session.studyTechnique && (
                        <p className="text-xs text-slate-400">
                          Technique: <span className="text-slate-300 font-medium">{session.studyTechnique}</span>
                        </p>
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
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Study Topic
                    </button>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigate('planner')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                  >
                    View Full Planner Schedule <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                <Brain className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">Ready to create a personalized study roadmap?</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Gemini will formulate a balanced daily timetable tailored to your subjects, exam date, and available hours.
                </p>
                <button
                  onClick={() => onNavigate('smart-plan')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Smart Study Plan
                </button>
              </div>
            )}
          </div>

          {/* Recent Notes & Extracted PDFs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Recent Study Materials</h3>
              </div>
              <button
                onClick={() => onNavigate('materials')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
              >
                All Materials <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {materials.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('materials')}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {item.subject}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {item.content.replace(/[#*`$]/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Priority Tasks & Quick Launcher */}
        <div className="space-y-6">
          {/* Priority Study Tasks */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Pending Tasks</h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <button
                      onClick={() => onToggleTask(task.id, task.status)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center transition shrink-0"
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{task.subject}</span>
                        {task.dueDate && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Due {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                <p className="text-xs">All caught up! No pending tasks.</p>
              </div>
            )}
          </div>

          {/* AI Tutor Quick Access Card */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Gemini Study Tutor</h4>
                <p className="text-[11px] text-purple-300/80">Socratic tutoring & instant answers</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Need help understanding an equation, summarizing a paper, or quiz testing yourself before an exam?
            </p>
            <button
              onClick={() => onNavigate('chat')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition"
            >
              Open AI Tutor Chat <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

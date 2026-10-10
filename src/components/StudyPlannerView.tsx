import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Plus,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { StudyPlan, StudyPlanSession } from '../types';

interface StudyPlannerViewProps {
  activePlan: StudyPlan | null;
  onUpdatePlan: (plan: StudyPlan) => void;
  onStartSessionWithTopic: (subject: string, topic: string, durationMinutes: number) => void;
  onNavigateToSmartPlan: () => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  activePlan,
  onUpdatePlan,
  onStartSessionWithTopic,
  onNavigateToSmartPlan,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);

  // Form states for manual session
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTechnique, setNewTechnique] = useState('Pomodoro 25/5');

  if (!activePlan) {
    return (
      <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl animate-in fade-in">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Active Study Plan Found</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Create a personalized curriculum roadmap with Gemini to populate your planner sessions.
        </p>
        <button
          onClick={onNavigateToSmartPlan}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Sparkles className="w-4 h-4" />
          Generate Smart Study Plan
        </button>
      </div>
    );
  }

  const subjects = ['All', ...Array.from(new Set(activePlan.schedule.map((s) => s.subject)))];

  const handleToggleSession = (index: number) => {
    const updatedSchedule = [...activePlan.schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      completed: !updatedSchedule[index].completed,
    };
    onUpdatePlan({
      ...activePlan,
      schedule: updatedSchedule,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;

    const newSession: StudyPlanSession = {
      dayNumber: activePlan.schedule.length + 1,
      dateOffsetDays: activePlan.schedule.length,
      subject: newSubject.trim(),
      topic: newTopic.trim(),
      durationMinutes: Number(newDuration),
      priority: newPriority,
      studyTechnique: newTechnique,
      completed: false,
    };

    onUpdatePlan({
      ...activePlan,
      schedule: [...activePlan.schedule, newSession],
      updatedAt: new Date().toISOString(),
    });

    setIsAddSessionModalOpen(false);
    setNewSubject('');
    setNewTopic('');
  };

  const filteredSchedule = activePlan.schedule.filter((session) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !session.completed) ||
      (filterStatus === 'completed' && session.completed);

    const matchesSubject = filterSubject === 'All' || session.subject === filterSubject;
    return matchesStatus && matchesSubject;
  });

  const completedCount = activePlan.schedule.filter((s) => s.completed).length;
  const progressPercent =
    activePlan.schedule.length > 0
      ? Math.round((completedCount / activePlan.schedule.length) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Study Planner & Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {activePlan.title} • Target Exam: {activePlan.examDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSessionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
          <button
            onClick={onNavigateToSmartPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            Regenerate Plan
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Curriculum Completion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{progressPercent}%</span>
            <span className="text-xs text-slate-400">
              ({completedCount} of {activePlan.schedule.length} sessions completed)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Subject pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterSubject === sub
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSchedule.map((session, index) => {
          const originalIndex = activePlan.schedule.indexOf(session);
          return (
            <div
              key={originalIndex}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                session.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                  : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleSession(originalIndex)}
                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                    session.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-700 hover:border-indigo-400 bg-slate-950'
                  }`}
                  title={session.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {session.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                      Day {session.dayNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {session.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.durationMinutes}m
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

                  <h3
                    className={`text-sm sm:text-base font-bold text-white ${
                      session.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {session.topic}
                  </h3>

                  {session.studyTechnique && (
                    <p className="text-xs text-slate-400">
                      Focus Method: <span className="text-slate-300">{session.studyTechnique}</span>
                    </p>
                  )}
                </div>
              </div>

              {!session.completed && (
                <button
                  onClick={() =>
                    onStartSessionWithTopic(
                      session.subject,
                      session.topic,
                      session.durationMinutes
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition self-start md:self-auto shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Study in Timer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Add Session Modal */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Planner Session</h3>
              <button
                onClick={() => setIsAddSessionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSession} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetism & Gauss's Law"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    step="5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Study Technique
                </label>
                <input
                  type="text"
                  value={newTechnique}
                  onChange={(e) => setNewTechnique(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

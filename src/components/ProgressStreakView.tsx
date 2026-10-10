import React from 'react';
import {
  Flame,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UserStats, StudySession, StudyTask } from '../types';

interface ProgressStreakViewProps {
  stats: UserStats | null;
  sessions: StudySession[];
  tasks: StudyTask[];
}

export const ProgressStreakView: React.FC<ProgressStreakViewProps> = ({
  stats,
  sessions,
  tasks,
}) => {
  const currentStreak = stats?.currentStreak || 1;
  const longestStreak = stats?.longestStreak || 1;
  const totalMinutes = stats?.totalStudyMinutes || 0;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Aggregate time by subject
  const subjectTimeMap: Record<string, number> = {};
  for (const s of sessions) {
    const sub = s.subject || 'General Study';
    subjectTimeMap[sub] = (subjectTimeMap[sub] || 0) + s.durationMinutes;
  }
  const subjectEntries = Object.entries(subjectTimeMap).sort((a, b) => b[1] - a[1]);

  // Last 7 days activity dots
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const hasActivity =
      sessions.some((s) => s.sessionDate === dateStr) ||
      (i === 6 && stats?.lastStudyDate === dateStr);
    return { dateStr, dayName, hasActivity };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          Progress & Study Streak Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Track consistency, subject distribution, and milestone achievements
        </p>
      </div>

      {/* Streak Big Card */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-9 h-9 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{currentStreak}</span>
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Day Streak Active!
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                All-time longest streak: <span className="text-amber-400 font-bold">{longestStreak} days</span>. Studying every day locks knowledge into long-term memory.
              </p>
            </div>
          </div>

          {/* 7-Day Consistency Tracker */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Last 7 Days Consistency
            </span>
            <div className="flex items-center gap-2">
              {last7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                      day.hasActivity
                        ? 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
                    }`}
                  >
                    {day.hasActivity ? <Flame className="w-4 h-4 fill-slate-950" /> : '•'}
                  </div>
                  <span className="text-[10px] text-slate-400">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Subject Breakdown & Task Completion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Study Time Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Subject Time Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{totalHours} total hrs</span>
          </div>

          {subjectEntries.length > 0 ? (
            <div className="space-y-3">
              {subjectEntries.map(([subj, mins], idx) => {
                const percent = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium">{subj}</span>
                      <span className="text-slate-400 font-mono">
                        {Math.round((mins / 60) * 10) / 10}h ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Complete your first focus timer session to see subject breakdown.
            </p>
          )}
        </div>

        {/* Task Completion Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Task Completion Rate</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">{taskRate}% Done</span>
          </div>

          <div className="flex items-center gap-6 my-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Completed Tasks</span>
                <span className="font-bold text-emerald-400">{completedTasks}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Pending / In Progress</span>
                <span className="font-bold text-amber-400">{totalTasks - completedTasks}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Study Tasks</span>
                <span className="font-bold text-white">{totalTasks}</span>
              </div>
            </div>

            {/* Circular summary */}
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950">
              <span className="text-xl font-extrabold text-white">{completedTasks}</span>
              <span className="text-[10px] text-slate-400 uppercase">Done</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Badges & Achievements */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          Milestones & Consistency Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Daily Flame</h4>
              <p className="text-[11px] text-slate-400">Maintained active study streak</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Focus Pioneer</h4>
              <p className="text-[11px] text-slate-400">{totalHours}+ hours logged in timer</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Goal Crusher</h4>
              <p className="text-[11px] text-slate-400">{completedTasks} study tasks accomplished</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Calendar,
} from 'lucide-react';
import { StudyTask } from '../types';
import { generateId } from '../services/studyService';

interface TaskManagementViewProps {
  tasks: StudyTask[];
  onSaveTask: (task: StudyTask) => void;
  onUpdateStatus: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onDeleteTask: (taskId: string) => void;
  userId: string;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  onSaveTask,
  onUpdateStatus,
  onDeleteTask,
  userId,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDueDate, setFormDueDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(30);

  const openNewTaskModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormSubject('');
    setFormTopic('');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormPriority('medium');
    setFormEstimatedMinutes(30);
    setIsModalOpen(true);
  };

  const openEditModal = (task: StudyTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormSubject(task.subject);
    setFormTopic(task.topic);
    setFormDueDate(task.dueDate || '');
    setFormPriority(task.priority);
    setFormEstimatedMinutes(task.estimatedMinutes || 30);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject.trim()) return;

    const task: StudyTask = {
      id: editingTask ? editingTask.id : generateId('task'),
      userId,
      title: formTitle.trim(),
      subject: formSubject.trim(),
      topic: formTopic.trim() || formSubject.trim(),
      dueDate: formDueDate,
      priority: formPriority,
      status: editingTask ? editingTask.status : 'pending',
      estimatedMinutes: Number(formEstimatedMinutes),
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTask(task);
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && t.status === 'pending') ||
      (filterStatus === 'in_progress' && t.status === 'in_progress') ||
      (filterStatus === 'completed' && t.status === 'completed');

    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.topic.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, prioritize, schedule, and complete actionable study goals
          </p>
        </div>

        <button
          onClick={openNewTaskModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, subject, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 p-1 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted;
            const isDueToday = task.dueDate === todayStr && !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      onUpdateStatus(task.id, isCompleted ? 'pending' : 'completed')
                    }
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-emerald-400 bg-slate-950'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {task.subject}
                      </span>
                      {task.topic && (
                        <span className="text-[10px] text-slate-400">
                          {task.topic}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          task.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold text-white ${
                        isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 font-mono ${
                            isOverdue
                              ? 'text-rose-400 font-semibold'
                              : isDueToday
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {isOverdue ? 'Overdue: ' : isDueToday ? 'Today: ' : 'Due: '}
                          {task.dueDate}
                        </span>
                      )}

                      {task.estimatedMinutes && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes}m est.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        task.id,
                        task.status === 'in_progress' ? 'pending' : 'in_progress'
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      task.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {task.status === 'in_progress' ? 'In Progress' : 'Start Task'}
                  </button>

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your first study assignment, practice problem set, or reading milestone.
            </p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Study Task' : 'New Study Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve Practice Exam 2 Section B"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Integration"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={formEstimatedMinutes}
                    onChange={(e) => setFormEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e: any) => setFormPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

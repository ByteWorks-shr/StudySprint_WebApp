import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  BookOpen,
  CheckSquare,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Mic,
  GraduationCap,
} from 'lucide-react';
import { StudyMaterial, PdfDocument, StudyTask, StudyPlan, ViewTab, SyllabusDocument } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: StudyMaterial[];
  pdfs: PdfDocument[];
  tasks: StudyTask[];
  activePlan: StudyPlan | null;
  syllabi?: SyllabusDocument[];
  onNavigateToTab: (tab: ViewTab) => void;
  onOpenMic?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  materials,
  pdfs,
  tasks,
  activePlan,
  syllabi,
  onNavigateToTab,
  onOpenMic,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedMaterials = cleanQuery
    ? materials.filter(
        (m) =>
          m.title.toLowerCase().includes(cleanQuery) ||
          m.subject.toLowerCase().includes(cleanQuery) ||
          m.topic.toLowerCase().includes(cleanQuery) ||
          m.content.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedPdfs = cleanQuery
    ? pdfs.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.fileName.toLowerCase().includes(cleanQuery) ||
          p.subject.toLowerCase().includes(cleanQuery) ||
          p.extractedText.toLowerCase().includes(cleanQuery) ||
          p.topics.some((t) => t.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchedTasks = cleanQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) ||
          t.subject.toLowerCase().includes(cleanQuery) ||
          t.topic.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedSyllabusTopics = cleanQuery && syllabi
    ? syllabi.flatMap((s) =>
        (s.analysis?.subjects || []).flatMap((sub) =>
          sub.units.flatMap((u) =>
            u.topics
              .filter(
                (t) =>
                  t.name.toLowerCase().includes(cleanQuery) ||
                  sub.name.toLowerCase().includes(cleanQuery) ||
                  u.title.toLowerCase().includes(cleanQuery)
              )
              .map((t) => ({
                id: t.id,
                name: t.name,
                subject: sub.name,
                unit: u.title,
                syllabusTitle: s.title,
              }))
          )
        )
      ).slice(0, 5)
    : [];

  const totalResults = matchedMaterials.length + matchedPdfs.length + matchedTasks.length + matchedSyllabusTopics.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar with Back button and Cross symbol */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-2.5 bg-slate-900">
          <button
            onClick={onClose}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
            title="Back to previous view"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Back</span>
          </button>

          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search notes, PDFs, topics, tasks, formulas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-16 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {onOpenMic && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMic();
                  }}
                  className="p-1 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition"
                  title="Voice Search / Transcribe"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Cross / Clear symbol */}
              <button
                onClick={() => {
                  if (query) {
                    setQuery('');
                  } else {
                    onClose();
                  }
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title={query ? 'Clear search text' : 'Close search'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <kbd className="hidden sm:inline text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!cleanQuery ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Type to search across your notes, textbooks, and tasks.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Syllabus Curriculum Topics */}
              {matchedSyllabusTopics.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2">
                    Syllabus Topics ({matchedSyllabusTopics.length})
                  </span>
                  {matchedSyllabusTopics.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        onNavigateToTab('syllabus');
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-indigo-950/20 hover:bg-indigo-900/40 border border-indigo-900/40 cursor-pointer flex items-center justify-between gap-2 group transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {st.subject} · {st.unit}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Materials */}
              {matchedMaterials.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Study Notes ({matchedMaterials.length})
                  </span>
                  {matchedMaterials.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onNavigateToTab('materials');
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer flex items-center justify-between gap-2 group transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {m.subject} • {m.topic}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* PDFs */}
              {matchedPdfs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    PDF Library ({matchedPdfs.length})
                  </span>
                  {matchedPdfs.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onNavigateToTab('pdfs');
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer flex items-center justify-between gap-2 group transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.subject} • {p.pageCount} pages
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Tasks ({matchedTasks.length})
                  </span>
                  {matchedTasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onNavigateToTab('tasks');
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer flex items-center justify-between gap-2 group transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-300">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {t.subject} • Due {t.dueDate}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Edit3,
  Trash2,
  Copy,
  Check,
  Mic,
  BookOpen,
  X,
  Filter,
} from 'lucide-react';
import { StudyMaterial } from '../types';
import { generateId } from '../services/studyService';

interface StudyMaterialsViewProps {
  materials: StudyMaterial[];
  onSaveMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  userId: string;
  onOpenMicForText?: (onTranscribed: (text: string) => void) => void;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  materials,
  onSaveMaterial,
  onDeleteMaterial,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activeModalMaterial, setActiveModalMaterial] = useState<StudyMaterial | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [readerMaterial, setReaderMaterial] = useState<StudyMaterial | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');

  // Extract unique subjects
  const allSubjects = ['All', ...Array.from(new Set(materials.map((m) => m.subject).filter(Boolean)))];

  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = selectedSubject === 'All' || m.subject.toLowerCase() === selectedSubject.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      m.title.toLowerCase().includes(query) ||
      m.topic.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.content.toLowerCase().includes(query) ||
      m.tags.some((t) => t.toLowerCase().includes(query));
    return matchesSubject && matchesSearch;
  });

  const openNewNoteModal = () => {
    setFormTitle('');
    setFormSubject(selectedSubject !== 'All' ? selectedSubject : '');
    setFormTopic('');
    setFormContent('');
    setFormTags('');
    setActiveModalMaterial(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (material: StudyMaterial) => {
    setFormTitle(material.title);
    setFormSubject(material.subject);
    setFormTopic(material.topic);
    setFormContent(material.content);
    setFormTags(material.tags.join(', '));
    setActiveModalMaterial(material);
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: StudyMaterial = {
      id: activeModalMaterial ? activeModalMaterial.id : generateId('mat'),
      userId,
      title: formTitle.trim(),
      subject: formSubject.trim(),
      topic: formTopic.trim() || formSubject.trim(),
      content: formContent.trim(),
      tags: tagsArray,
      createdAt: activeModalMaterial ? activeModalMaterial.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveMaterial(updated);
    setIsEditorOpen(false);
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Study Materials & Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Organize lecture notes, formulas, concepts, and revision guides
          </p>
        </div>

        <button
          onClick={openNewNoteModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by keyword, topic, formula, or tag..."
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

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
          {allSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all group hover:-translate-y-0.5"
            >
              <div>
                {/* Meta info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                    {material.subject}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(material.updatedAt || material.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title & Topic */}
                <h3
                  onClick={() => setReaderMaterial(material)}
                  className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition cursor-pointer line-clamp-2"
                >
                  {material.title}
                </h3>
                <p className="text-xs text-indigo-400 font-medium mt-0.5 mb-2 line-clamp-1">
                  Topic: {material.topic}
                </p>

                {/* Excerpt */}
                <p
                  onClick={() => setReaderMaterial(material)}
                  className="text-xs text-slate-300 line-clamp-4 leading-relaxed cursor-pointer font-serif whitespace-pre-wrap"
                >
                  {material.content}
                </p>

                {/* Tags */}
                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {material.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setReaderMaterial(material)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read Full
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyContent(material.content, material.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copy to clipboard"
                  >
                    {copiedId === material.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(material)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMaterial(material.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">No study materials found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No notes match "${searchQuery}". Try a different keyword.`
              : 'Add your first lecture notes, formulas, or study summary.'}
          </p>
          <button
            onClick={openNewNoteModal}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Create New Note
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                {activeModalMaterial ? 'Edit Study Note' : 'Create New Study Note'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Theorem & Asymptotic Analysis"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Topic / Subtopic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Recurrence Relations"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Content & Notes (Markdown supported)
                  </label>
                </div>
                <textarea
                  rows={8}
                  placeholder="Type or paste your notes, key formulas, bullet points, and definitions..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Algorithms, Math, Exam Prep"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reader Modal */}
      {readerMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {readerMaterial.subject}
                </span>
                <span className="text-xs text-slate-400 font-medium">• {readerMaterial.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(readerMaterial.content, readerMaterial.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy content"
                >
                  {copiedId === readerMaterial.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setReaderMaterial(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {readerMaterial.title}
              </h1>

              {readerMaterial.tags && readerMaterial.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {readerMaterial.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="prose prose-invert prose-indigo max-w-none text-slate-200 leading-relaxed font-sans whitespace-pre-wrap pt-2">
                {readerMaterial.content}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setReaderMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

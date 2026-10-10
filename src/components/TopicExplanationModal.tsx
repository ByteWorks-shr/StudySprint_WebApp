import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Languages,
  Loader2,
  FileText,
} from 'lucide-react';
import { SyllabusTopic } from '../types';

interface TopicExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: SyllabusTopic | null;
  subjectName: string;
  unitTitle: string;
  language: 'en' | 'hi';
  onToggleStatus: (topicId: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  currentStatus: 'not_started' | 'in_progress' | 'completed';
}

export const TopicExplanationModal: React.FC<TopicExplanationModalProps> = ({
  isOpen,
  onClose,
  topic,
  subjectName,
  unitTitle,
  language: initialLanguage,
  onToggleStatus,
  currentStatus,
}) => {
  const [lang, setLang] = useState<'en' | 'hi'>(initialLanguage);
  const [deepExplanation, setDeepExplanation] = useState<string | null>(null);
  const [isLoadingDeep, setIsLoadingDeep] = useState(false);

  if (!isOpen || !topic) return null;

  const handleFetchDeepExplanation = async () => {
    setIsLoadingDeep(true);
    try {
      const res = await fetch('/api/gemini/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          unitTitle,
          topicName: topic.name,
          syllabusContext: topic.simpleExplanationEn,
          language: lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeepExplanation(data.explanation);
      }
    } catch (e) {
      console.error('Deep explain error:', e);
    } finally {
      setIsLoadingDeep(false);
    }
  };

  const simpleText = lang === 'hi' && topic.simpleExplanationHi ? topic.simpleExplanationHi : topic.simpleExplanationEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{subjectName}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{unitTitle}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">{topic.name}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                  lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                  lang === 'hi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick status bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">Study Completion Status:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleStatus(topic.id, 'not_started')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  currentStatus === 'not_started'
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => onToggleStatus(topic.id, 'in_progress')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  currentStatus === 'in_progress'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => onToggleStatus(topic.id, 'completed')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Simple Explanation Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <span>Student-Friendly Concept Explanation ({lang === 'hi' ? 'हिंदी / Hinglish' : 'English'})</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 leading-relaxed whitespace-pre-line">
              {simpleText}
            </div>
          </div>

          {/* Real World Analogy / Example */}
          {topic.realWorldExample && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>Real-World Engineering Analogy</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100/90 leading-relaxed text-xs sm:text-sm">
                {topic.realWorldExample}
              </div>
            </div>
          )}

          {/* Key Technical Terms Table */}
          {topic.keyTerms && topic.keyTerms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Key Technical Terms & What They Mean
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {topic.keyTerms.map((term, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-indigo-300 block">{term.term}</span>
                    <p className="text-xs text-slate-300 leading-snug">{term.definition}</p>
                    {term.simpleMeaning && (
                      <p className="text-[11px] text-slate-400 italic">In plain words: {term.simpleMeaning}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {topic.prerequisites && topic.prerequisites.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-sky-300">What to learn before this topic: </span>
                <span className="text-slate-300">{topic.prerequisites.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Practice Questions */}
          {topic.practiceQuestions && topic.practiceQuestions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Board Exam Practice Questions
              </h3>
              <div className="space-y-2">
                {topic.practiceQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-300 uppercase">Question {idx + 1} ({q.type})</span>
                      {q.hint && <span className="text-slate-400 text-[11px]">Hint available</span>}
                    </div>
                    <p className="text-xs sm:text-sm text-white font-medium">{q.question}</p>
                    {q.hint && (
                      <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        💡 Key tip: {q.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Demand In-Depth AI Master Lecture */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Need In-Depth Step-by-Step Lecture?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ask Gemini to generate detailed breakdown with formulas, code, derivations, and common exam pitfalls.
                </p>
              </div>
              <button
                onClick={handleFetchDeepExplanation}
                disabled={isLoadingDeep}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition"
              >
                {isLoadingDeep ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deep Explain</span>
                  </>
                )}
              </button>
            </div>

            {deepExplanation && (
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line animate-in fade-in">
                {deepExplanation}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
  FileQuestion,
  GraduationCap,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { SyllabusDocument } from '../types';

interface SyllabusChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  syllabus: SyllabusDocument | null;
}

interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

export const SyllabusChatDrawer: React.FC<SyllabusChatDrawerProps> = ({
  isOpen,
  onClose,
  syllabus,
}) => {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'model',
      content: `Hello! I am your Syllabus AI Mentor. I have access to your full uploaded syllabus document for "${syllabus?.title || 'your semester'}".\n\nAsk me anything: you can ask me to explain a unit in student-friendly language, check which practical experiments are listed, clarify term work rules, or plan your preparation order!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain Unit 1 in simple student language',
    'Which lab practicals are compulsory?',
    'What does Term Work mean in my syllabus?',
    'What are the micro-project requirements?',
    'What should I study before Java Multithreading?',
    'Create a 5-question practice quiz for Unit 2',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    const newMessages: ChatTurn[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/syllabus-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          syllabusContext: {
            title: syllabus?.title,
            university: syllabus?.university,
            branch: syllabus?.branch,
            semester: syllabus?.semester,
            subjectsSummary: syllabus?.analysis?.subjects?.map((s) => ({
              name: s.name,
              code: s.code,
              unitsCount: s.units?.length,
              topics: s.units?.flatMap((u) => u.topics.map((t) => t.name)),
            })),
            rawTextExcerpt: syllabus?.extractedText?.slice(0, 15000),
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Chat failed');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', content: data.reply || 'No response generated.' }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, I encountered an issue accessing the syllabus assistant. Please verify your connection and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Syllabus AI Assistant</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {syllabus?.title || 'Syllabus Understanding Mentor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setMessages([
                  {
                    role: 'model',
                    content: `Thread refreshed. What questions do you have about your curriculum?`,
                  },
                ])
              }
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-[11px] font-medium border border-slate-700/60 transition shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3.5 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs">Analyzing syllabus curriculum...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your syllabus, units, practicals, projects..."
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

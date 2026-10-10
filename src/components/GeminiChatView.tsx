import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Mic,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Brain,
  HelpCircle,
  FileCheck,
  Code,
  Zap,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { generateId } from '../services/studyService';

interface GeminiChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  userId: string;
  onOpenMicForChat: (onTranscribed: (text: string) => void) => void;
}

type ChatPersona = 'mentor' | 'quizmaster' | 'summarizer' | 'solver';

const PERSONA_CONFIGS: Record<
  ChatPersona,
  { name: string; icon: React.ComponentType<{ className?: string }>; prompt: string }
> = {
  mentor: {
    name: 'Socratic Study Mentor',
    icon: Brain,
    prompt:
      'You are a warm, highly encouraging Socratic Study Mentor. Do not simply blurt out final answers; guide the student through questions, hints, and step-by-step reasoning so they achieve real mastery. Use markdown, clear formatting, and vivid analogies.',
  },
  quizmaster: {
    name: 'Exam Quiz Master',
    icon: HelpCircle,
    prompt:
      'You are a rigorous Exam Quiz Master. Test the student with realistic, high-yield practice questions. Ask one question at a time, wait for their answer, evaluate it with detailed feedback, and suggest areas to review.',
  },
  summarizer: {
    name: 'Notes & Chapter Summarizer',
    icon: FileCheck,
    prompt:
      'You are an expert academic summarizer. Extract core principles, definitions, key formulas, and high-yield takeaway bullet points from any study material the student provides.',
  },
  solver: {
    name: 'STEM & Math Problem Solver',
    icon: Code,
    prompt:
      'You are a world-class STEM professor and math problem solver. Provide rigorous, clear mathematical derivations, proof structures, code implementations, and conceptual justifications.',
  },
};

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({
  messages,
  onSendMessage,
  userId,
  onOpenMicForChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<ChatPersona>('mentor');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isTyping) return;

    setInputText('');

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: generateId('chat_usr'),
      userId,
      role: 'user',
      text: cleanText,
      persona: selectedPersona,
      modelUsed: selectedModel,
      createdAt: new Date().toISOString(),
    };
    onSendMessage(userMsg);

    // 2. Prepare conversation history for server
    const history = messages
      .slice(-10) // last 10 messages for rich multi-turn context
      .concat(userMsg)
      .map((m) => ({
        role: m.role,
        content: m.text,
      }));

    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          systemInstruction: PERSONA_CONFIGS[selectedPersona].prompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: generateId('chat_mod'),
        userId,
        role: 'model',
        text: data.reply || 'I am thinking... Please ask your question again.',
        persona: selectedPersona,
        modelUsed: data.modelUsed || selectedModel,
        createdAt: new Date().toISOString(),
      };
      onSendMessage(aiMsg);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: generateId('chat_err'),
        userId,
        role: 'model',
        text: `Error communicating with Gemini: ${err.message || 'Please try again in a moment.'}`,
        persona: selectedPersona,
        modelUsed: selectedModel,
        createdAt: new Date().toISOString(),
      };
      onSendMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVoiceInput = () => {
    onOpenMicForChat((transcribedText) => {
      setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[500px] flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Chat Bar: Role & Model Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Personas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(Object.keys(PERSONA_CONFIGS) as ChatPersona[]).map((key) => {
            const cfg = PERSONA_CONFIGS[key];
            const Icon = cfg.icon;
            const isSelected = selectedPersona === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPersona(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Model selector per guidelines */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono text-indigo-300 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (General Mentor)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Recall)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
          </select>
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">StudySprint AI Tutor</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ask anything about your study materials, request practice quizzes, or have complex derivations explained step-by-step.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full text-left">
              <button
                onClick={() => setInputText('Explain Thread Lifecycle and Synchronization in Java with SBTE Bihar 6-mark exam format.')}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition"
              >
                ☕ "Explain Java Thread Lifecycle & Synchronization (SBTE 6-mark format)"
              </button>
              <button
                onClick={() => setInputText('Quiz me on 3 high-yield questions for SBTE Software Engineering (SDLC, Testing, DFD).')}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition"
              >
                🎯 "Quiz me on SBTE Software Engineering & SDLC"
              </button>
              <button
                onClick={() => setInputText('How to calculate Subnet Mask and Host IP range for 192.168.1.0/26 in Computer Networks?')}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition"
              >
                🌐 "Solve IPv4 Subnetting numerical step-by-step (/26 CIDR)"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs relative group ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {/* Model badge on assistant */}
                  {!isUser && msg.modelUsed && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 pb-1 border-b border-slate-800/80">
                      <span className="font-mono">{msg.modelUsed}</span>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isUser ? 'text-indigo-200/70 text-right' : 'text-slate-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>StudySprint is reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice Transcription Button */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={handleVoiceInput}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition shrink-0"
          title="Voice input with Gemini 3.5 Transcribe"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder={`Ask ${PERSONA_CONFIGS[selectedPersona].name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shrink-0 shadow-md shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

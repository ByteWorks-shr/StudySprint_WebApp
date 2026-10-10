import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Sparkles,
  Trash2,
  HelpCircle,
  CheckCircle,
  Loader2,
  Tag,
  X,
  Copy,
  Check,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { PdfDocument } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { generateId } from '../services/studyService';

interface PdfLibraryViewProps {
  pdfs: PdfDocument[];
  onSavePdf: (pdf: PdfDocument) => void;
  onDeletePdf: (id: string) => void;
  userId: string;
}

export const PdfLibraryView: React.FC<PdfLibraryViewProps> = ({
  pdfs,
  onSavePdf,
  onDeletePdf,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active PDF for AI Tools / Reader
  const [activePdf, setActivePdf] = useState<PdfDocument | null>(null);
  const [aiAction, setAiAction] = useState<'summary' | 'flashcards' | 'quiz' | 'custom'>('summary');
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle PDF file selection
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a valid PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Extract text content with pdfjs-dist
      const extracted = await extractTextFromPdf(file);

      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      // Detect subject from title or default
      let detectedSubject = 'General';
      const lower = title.toLowerCase();
      if (lower.includes('bio')) detectedSubject = 'Biology';
      else if (lower.includes('chem')) detectedSubject = 'Chemistry';
      else if (lower.includes('algo') || lower.includes('cs') || lower.includes('code') || lower.includes('compute')) detectedSubject = 'Computer Science';
      else if (lower.includes('math') || lower.includes('calc')) detectedSubject = 'Mathematics';
      else if (lower.includes('econ') || lower.includes('financ')) detectedSubject = 'Economics';
      else if (lower.includes('physic')) detectedSubject = 'Physics';

      const newPdf: PdfDocument = {
        id: generateId('pdf'),
        userId,
        title,
        fileName: file.name,
        fileSize: file.size,
        pageCount: extracted.pageCount,
        extractedText: extracted.text,
        topics: extracted.topics,
        subject: detectedSubject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSavePdf(newPdf);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to extract text from PDF. The file may be password protected.');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Run Gemini analysis on the PDF text
  const runAiAnalysis = async (action: 'summary' | 'flashcards' | 'quiz' | 'custom') => {
    if (!activePdf) return;
    setAiAction(action);
    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activePdf.title,
          textSnippet: activePdf.extractedText.slice(0, 15000), // First 15,000 characters
          action,
          query: aiCustomQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const data = await response.json();
      setAiResult(data.result);
    } catch (err: any) {
      console.error(err);
      setAiResult(`Error: ${err.message || 'Could not complete AI analysis'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const copyAiResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter PDFs
  const filteredPdfs = pdfs.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.fileName.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.topics.some((t) => t.toLowerCase().includes(q)) ||
      p.extractedText.toLowerCase().includes(q)
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            PDF Library & Topic Search
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload study textbooks, extract searchable content, and generate high-yield flashcards
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting PDF...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Study PDF</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search for any specific topic or phrase inside your uploaded PDFs..."
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

      {/* PDF Cards Grid */}
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                    {pdf.subject}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {pdf.pageCount} pages • {formatFileSize(pdf.fileSize)}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                  {pdf.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                  {pdf.fileName}
                </p>

                {/* Topics Tags */}
                {pdf.topics && pdf.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {pdf.topics.slice(0, 4).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Snippet preview */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {searchQuery && pdf.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                    <span className="text-amber-300 font-medium">
                      Found keyword matches inside document content.
                    </span>
                  ) : null}
                  {' ' + pdf.extractedText.slice(0, 200)}...
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActivePdf(pdf);
                    runAiAnalysis('summary');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  AI Study Tools
                </button>

                <button
                  onClick={() => onDeletePdf(pdf.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete PDF"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">No PDFs in your library yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload lecture slides, chapters, or practice exams. OmniStudy extracts their full text so you can search every topic instantly.
          </p>
        </div>
      )}

      {/* AI Assistant Drawer Modal for PDF */}
      {activePdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    AI Assistant: {activePdf.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activePdf.pageCount} pages • {activePdf.subject}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePdf(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Action Tabs */}
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => runAiAnalysis('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  aiAction === 'summary'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Executive Summary
              </button>
              <button
                onClick={() => runAiAnalysis('flashcards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  aiAction === 'flashcards'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                High-Yield Flashcards
              </button>
              <button
                onClick={() => runAiAnalysis('quiz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  aiAction === 'quiz'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Practice Quiz
              </button>
              <button
                onClick={() => setAiAction('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  aiAction === 'custom'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Ask Question
              </button>
            </div>

            {/* Custom Question input */}
            {aiAction === 'custom' && (
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any question about this document (e.g. How does the proof on page 2 work?)..."
                  value={aiCustomQuestion}
                  onChange={(e) => setAiCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runAiAnalysis('custom');
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  onClick={() => runAiAnalysis('custom')}
                  disabled={aiLoading || !aiCustomQuestion.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  Ask
                </button>
              </div>
            )}

            {/* Analysis Output View */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-indigo-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Analyzing document content with Gemini 3.5 Flash...
                  </p>
                </div>
              ) : aiResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Generated Result
                    </span>
                    <button
                      onClick={copyAiResult}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {aiResult}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select an AI action above to analyze this PDF.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setActivePdf(null)}
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

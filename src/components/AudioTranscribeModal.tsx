import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Loader2, Check, Copy, Plus, X, Sparkles, AlertCircle } from 'lucide-react';
import { AudioRecorder, transcribeAudioBlob } from '../utils/audioRecorder';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAsNote?: (text: string) => void;
  onUseAsTask?: (text: string) => void;
  onAskChat?: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onUseAsNote,
  onUseAsTask,
  onAskChat,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordDuration(0);
      setIsTranscribing(false);
      setTranscript('');
      setError(null);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Microphone access denied. Please allow microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!recorderRef.current) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);

    try {
      const { base64, mimeType } = await recorderRef.current.stop();
      const resultText = await transcribeAudioBlob(base64, mimeType);
      setTranscript(resultText || '(No speech detected. Please speak clearly and try again.)');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transcription failed. Please check network and retry.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Voice Dictation & Transcription</h3>
              <p className="text-xs text-slate-400">Powered by Gemini 3.5 Transcribe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-5 overflow-y-auto">
          {error && (
            <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Recording Circle Visualizer */}
          <div className="relative flex flex-col items-center justify-center my-2">
            {isRecording && (
              <span className="absolute w-28 h-28 rounded-full bg-rose-500/20 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopRecordingAndTranscribe : startRecording}
              disabled={isTranscribing}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isRecording
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/50'
                  : isTranscribing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 hover:scale-105'
              }`}
            >
              {isTranscribing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isRecording ? (
                <>
                  <Square className="w-7 h-7 fill-white" />
                  <span className="text-[10px] font-semibold mt-1">STOP</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[10px] font-semibold mt-1">SPEAK</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center justify-center gap-2 text-rose-400 font-mono font-medium text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Recording: {formatTime(recordDuration)}
              </div>
            ) : isTranscribing ? (
              <p className="text-sm text-indigo-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                Transcribing audio with Gemini 3.5 Transcribe...
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Tap the microphone to record your thoughts, notes, or lecture summary
              </p>
            )}
          </div>

          {/* Transcript Output Box */}
          {(transcript || isTranscribing) && (
            <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  Transcript
                </span>
                {transcript && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {transcript || (
                  <span className="text-slate-500 italic">Listening for speech...</span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {transcript && !isTranscribing && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              {onUseAsNote && (
                <button
                  onClick={() => {
                    onUseAsNote(transcript);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save as Note
                </button>
              )}
              {onUseAsTask && (
                <button
                  onClick={() => {
                    onUseAsTask(transcript);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Create Task
                </button>
              )}
              {onAskChat && (
                <button
                  onClick={() => {
                    onAskChat(transcript);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Tutor
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

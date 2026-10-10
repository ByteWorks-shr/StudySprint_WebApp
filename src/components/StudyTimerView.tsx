import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { StudySession, UserStats } from '../types';
import { ambientSound } from '../utils/soundEffects';
import { generateId } from '../services/studyService';

interface StudyTimerViewProps {
  initialSubject?: string;
  initialTopic?: string;
  initialDurationMinutes?: number;
  onSessionCompleted: (session: StudySession) => void;
  stats: UserStats | null;
  userId: string;
}

export const StudyTimerView: React.FC<StudyTimerViewProps> = ({
  initialSubject = 'General Study',
  initialTopic = 'Focus Block',
  initialDurationMinutes = 25,
  onSessionCompleted,
  stats,
  userId,
}) => {
  // Timer modes
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [focusLengthMinutes, setFocusLengthMinutes] = useState(initialDurationMinutes);
  const [breakLengthMinutes, setBreakLengthMinutes] = useState(5);

  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);

  const [secondsRemaining, setSecondsRemaining] = useState(focusLengthMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ambient sound
  const [ambientType, setAmbientType] = useState<'off' | 'brown' | 'pink'>('off');
  const [ambientVolume, setAmbientVolume] = useState(0.15);

  const [sessionCompletedCelebration, setSessionCompletedCelebration] = useState(false);

  const intervalRef = useRef<any>(null);

  // Sync if initial props change
  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialTopic) setTopic(initialTopic);
    if (initialDurationMinutes) {
      setFocusLengthMinutes(initialDurationMinutes);
      if (!isRunning && timerMode === 'focus') {
        setSecondsRemaining(initialDurationMinutes * 60);
      }
    }
  }, [initialSubject, initialTopic, initialDurationMinutes]);

  // Main countdown timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timerMode, focusLengthMinutes, breakLengthMinutes]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    ambientSound.playCompletionChime();
    ambientSound.stopFocusAmbience();
    setAmbientType('off');

    if (timerMode === 'focus') {
      // Record completed session
      const completedSession: StudySession = {
        id: generateId('session'),
        userId,
        subject: subject.trim() || 'General Study',
        topic: topic.trim() || 'Focus Session',
        durationMinutes: focusLengthMinutes,
        sessionDate: new Date().toISOString().split('T')[0],
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      onSessionCompleted(completedSession);
      setSessionCompletedCelebration(true);
      setTimeout(() => setSessionCompletedCelebration(false), 5000);

      // Switch to break
      setTimerMode('break');
      setSecondsRemaining(breakLengthMinutes * 60);
    } else {
      // Break is complete, switch back to focus
      setTimerMode('focus');
      setSecondsRemaining(focusLengthMinutes * 60);
    }
  };

  const startTimer = () => {
    ambientSound.playStartPing();
    setIsRunning(true);
    if (ambientType !== 'off') {
      ambientSound.startFocusAmbience(ambientType, ambientVolume);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    ambientSound.stopFocusAmbience();
  };

  const resetTimer = () => {
    setIsRunning(false);
    ambientSound.stopFocusAmbience();
    setSecondsRemaining(
      timerMode === 'focus' ? focusLengthMinutes * 60 : breakLengthMinutes * 60
    );
  };

  const handleSelectPreset = (focus: number, brk: number) => {
    setIsRunning(false);
    setTimerMode('focus');
    setFocusLengthMinutes(focus);
    setBreakLengthMinutes(brk);
    setSecondsRemaining(focus * 60);
  };

  const toggleAmbient = (type: 'brown' | 'pink') => {
    if (ambientType === type) {
      ambientSound.stopFocusAmbience();
      setAmbientType('off');
    } else {
      setAmbientType(type);
      if (isRunning) {
        ambientSound.startFocusAmbience(type, ambientVolume);
      }
    }
  };

  const totalSeconds = (timerMode === 'focus' ? focusLengthMinutes : breakLengthMinutes) * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div
      className={`space-y-6 pb-12 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-center items-center overflow-y-auto'
          : 'animate-in fade-in duration-200'
      }`}
    >
      {/* Top Header */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Focus Study Timer & Pomodoro
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Engage in distraction-free deep study sessions and auto-log your daily streak
            </p>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition self-start sm:self-auto"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Fullscreen Focus
          </button>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => handleSelectPreset(25, 5)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            focusLengthMinutes === 25
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Classic Pomodoro (25/5)
        </button>
        <button
          onClick={() => handleSelectPreset(50, 10)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            focusLengthMinutes === 50
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Deep Focus (50/10)
        </button>
        <button
          onClick={() => handleSelectPreset(90, 15)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            focusLengthMinutes === 90
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Ultradian Sprint (90/15)
        </button>
      </div>

      {/* Timer Display Card */}
      <div className="max-w-xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        {/* Celebration Banner */}
        {sessionCompletedCelebration && (
          <div className="mb-4 w-full p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Session complete! {focusLengthMinutes} minutes added to your streak!</span>
          </div>
        )}

        {/* Tagged Subject / Topic input */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          <input
            type="text"
            placeholder="Subject (e.g. Computer Science)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isRunning}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-center"
          />
          <input
            type="text"
            placeholder="Topic (e.g. Dynamic Programming)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isRunning}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-center"
          />
        </div>

        {/* Mode Tag */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              timerMode === 'focus'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {timerMode === 'focus' ? 'Deep Focus Session' : 'Rest & Refresh Break'}
          </span>
        </div>

        {/* Big Circular Clock Visual */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* SVG ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                timerMode === 'focus' ? 'text-indigo-500' : 'text-emerald-500'
              }`}
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-mono font-extrabold text-white tracking-tighter">
              {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {timerMode === 'focus' ? `${focusLengthMinutes}m Target` : `${breakLengthMinutes}m Break`}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
            }`}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleTimerComplete}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
            title="Complete & Log Session Now"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Synthesizer Controls */}
        <div className="mt-8 pt-6 border-t border-slate-800 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Ambient Sound:</span>
            <button
              onClick={() => toggleAmbient('brown')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                ambientType === 'brown'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Rain / Brown Noise
            </button>
            <button
              onClick={() => toggleAmbient('pink')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                ambientType === 'pink'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Pink Noise
            </button>
            {ambientType !== 'off' && (
              <button
                onClick={() => {
                  ambientSound.stopFocusAmbience();
                  setAmbientType('off');
                }}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Flame className="w-4 h-4" />
            <span>Active Streak: {stats?.currentStreak || 1} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

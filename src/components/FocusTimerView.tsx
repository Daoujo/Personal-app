import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Coffee, 
  Sliders, 
  Plus, 
  Minus, 
  X, 
  Check,
  Clock
} from 'lucide-react';
import { CategoryType } from '../types';
import { CATEGORIES } from '../utils/storage';
import { playTimerChime, playClickSound, playTaskCompleteSound } from '../utils/audio';

interface FocusTimerViewProps {
  initialTitle?: string;
  initialCategory?: CategoryType;
  initialMinutes?: number;
  onLogCompletedFocus: (title: string, category: CategoryType, minutes: number) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (val: boolean) => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  initialTitle = 'Deep Focus Session',
  initialCategory = 'work',
  initialMinutes = 25,
  onLogCompletedFocus,
  isTimerRunning,
  setIsTimerRunning,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [sessionTitle, setSessionTitle] = useState(initialTitle);
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Custom Time Dialog State
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customInputMinutes, setCustomInputMinutes] = useState(45);
  const [customCategory, setCustomCategory] = useState<CategoryType>('work');
  const [customMode, setCustomMode] = useState<'focus' | 'break'>('focus');

  // Update if props change
  useEffect(() => {
    if (initialTitle) setSessionTitle(initialTitle);
    if (initialCategory) setCategory(initialCategory);
    if (initialMinutes) {
      setTotalSeconds(initialMinutes * 60);
      setSecondsLeft(initialMinutes * 60);
      setIsTimerRunning(false);
      setCustomInputMinutes(initialMinutes);
    }
  }, [initialTitle, initialCategory, initialMinutes, setIsTimerRunning]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsTimerRunning(false);
            playTimerChime();
            const finishedMins = Math.round(totalSeconds / 60);
            onLogCompletedFocus(sessionTitle, category, finishedMins);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft, totalSeconds, sessionTitle, category, onLogCompletedFocus, setIsTimerRunning]);

  const toggleTimer = () => {
    playClickSound();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    playClickSound();
    setIsTimerRunning(false);
    setSecondsLeft(totalSeconds);
  };

  // Quick adjust +/- minutes
  const adjustMinutes = (deltaMinutes: number) => {
    playClickSound();
    const newSeconds = Math.max(60, secondsLeft + deltaMinutes * 60);
    setSecondsLeft(newSeconds);
    if (newSeconds > totalSeconds) {
      setTotalSeconds(newSeconds);
    }
  };

  const handlePresetSelect = (mins: number, presetMode: 'focus' | 'break', label: string) => {
    playClickSound();
    setIsTimerRunning(false);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setMode(presetMode);
    if (presetMode === 'break') {
      setCategory('break');
      setSessionTitle('Mindful Recharge');
    } else {
      setCategory('work');
      setSessionTitle(label);
    }
  };

  const applyCustomTime = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClickSound();
    const validMinutes = Math.min(240, Math.max(1, Number(customInputMinutes) || 25));
    setIsTimerRunning(false);
    setTotalSeconds(validMinutes * 60);
    setSecondsLeft(validMinutes * 60);
    setCategory(customCategory);
    setMode(customMode);
    setSessionTitle(customMode === 'break' ? 'Custom Break' : `Custom ${validMinutes}m Session`);
    setIsCustomDialogOpen(false);
  };

  const handleFinishEarly = () => {
    playTaskCompleteSound();
    setIsTimerRunning(false);
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    onLogCompletedFocus(sessionTitle, category, elapsedMinutes);
    setSecondsLeft(totalSeconds);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 110;

  const cat = CATEGORIES[category] || CATEGORIES.work;

  return (
    <div className="flex-1 p-4 pb-20 space-y-5 flex flex-col items-center justify-between animate-fade-in text-center relative">
      {/* Top Session Details */}
      <div className="w-full space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          {mode === 'focus' ? <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> : <Coffee className="w-3.5 h-3.5 text-teal-500" />}
          <span>{mode === 'focus' ? 'Deep Work Mode' : 'Rest Break'}</span>
        </div>

        <input
          type="text"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          className="text-lg font-bold text-center text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-2 py-0.5"
          placeholder="Session title..."
        />

        <div className="flex items-center justify-center gap-2">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${cat.bgLight} ${cat.textLight} border ${cat.borderLight}`}>
            {cat.label}
          </span>
          <span className="text-xs text-slate-400 font-mono-numbers">
            · Total: {Math.round(totalSeconds / 60)}m
          </span>
        </div>
      </div>

      {/* Large Radial Timer Dial */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progressRatio)}
            strokeLinecap="round"
            className={`${mode === 'focus' ? 'text-indigo-600' : 'text-teal-500'} transition-all duration-300`}
            fill="transparent"
          />
        </svg>

        {/* Center Digital Display & Quick Adjustments */}
        <div className="absolute flex flex-col items-center justify-center space-y-1">
          <button
            onClick={() => setIsCustomDialogOpen(true)}
            className="group flex flex-col items-center focus:outline-none"
            title="Click to set custom duration"
          >
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white font-mono-numbers tracking-tight group-hover:text-indigo-600 transition-colors">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-indigo-500 flex items-center gap-1 transition-colors mt-0.5">
              <Sliders className="w-3 h-3" />
              <span>Tap to edit time</span>
            </span>
          </button>
        </div>
      </div>

      {/* Quick +/- 5 Minutes on the fly */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjustMinutes(-5)}
          className="min-h-[36px] px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono-numbers flex items-center gap-1 active:scale-95 transition-all"
          title="Subtract 5 minutes"
        >
          <Minus className="w-3 h-3" />
          <span>5m</span>
        </button>

        <button
          onClick={() => setIsCustomDialogOpen(true)}
          className="min-h-[36px] px-3.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all border border-indigo-200/60 dark:border-indigo-800/60"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Time</span>
        </button>

        <button
          onClick={() => adjustMinutes(5)}
          className="min-h-[36px] px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono-numbers flex items-center gap-1 active:scale-95 transition-all"
          title="Add 5 minutes"
        >
          <Plus className="w-3 h-3" />
          <span>5m</span>
        </button>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          title="Reset Timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`min-h-[56px] px-8 rounded-3xl font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all text-white ${
            isTimerRunning
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
          }`}
        >
          {isTimerRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>Start Timer</span>
            </>
          )}
        </button>

        <button
          onClick={handleFinishEarly}
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 transition-all border border-emerald-200 dark:border-emerald-800/60"
          title="Log session as completed now"
          aria-label="Log session completed"
        >
          <CheckCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Presets Segmented Buttons & Custom Trigger */}
      <div className="w-full pt-2 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
            Duration Presets
          </span>
          <button
            onClick={() => setIsCustomDialogOpen(true)}
            className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline text-xs"
          >
            <span>Custom Option</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => handlePresetSelect(25, 'focus', 'Pomodoro 25m')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              totalSeconds === 25 * 60 && mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            25m
          </button>

          <button
            onClick={() => handlePresetSelect(45, 'focus', 'Sprint 45m')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              totalSeconds === 45 * 60 && mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            45m
          </button>

          <button
            onClick={() => handlePresetSelect(50, 'focus', 'Deep Flow 50m')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              totalSeconds === 50 * 60 && mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            50m
          </button>

          <button
            onClick={() => handlePresetSelect(5, 'break', 'Quick Break')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              totalSeconds === 5 * 60 && mode === 'break'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            5m Rest
          </button>

          <button
            onClick={() => setIsCustomDialogOpen(true)}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              totalSeconds !== 25 * 60 && totalSeconds !== 45 * 60 && totalSeconds !== 50 * 60 && totalSeconds !== 5 * 60
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
            }`}
            title="Set custom duration"
          >
            <Sliders className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Custom Time Modal Dialog */}
      {isCustomDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsCustomDialogOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 z-10 border border-slate-200 dark:border-slate-800 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Option Temps Personnalisé
                </h3>
              </div>
              <button
                onClick={() => setIsCustomDialogOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={applyCustomTime} className="space-y-4">
              {/* Duration Input & Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Durée en minutes
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={customInputMinutes}
                      onChange={(e) => setCustomInputMinutes(Math.max(1, Math.min(240, Number(e.target.value))))}
                      className="w-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold font-mono-numbers text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">min</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={customInputMinutes}
                  onChange={(e) => setCustomInputMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                {/* Fast Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[10, 15, 20, 30, 40, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomInputMinutes(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono-numbers transition-colors ${
                        customInputMinutes === m
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggle: Focus vs Break */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Type de session
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMode('focus');
                      setCustomCategory('work');
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      customMode === 'focus'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Focus (Travail)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomMode('break');
                      setCustomCategory('break');
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      customMode === 'break'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Pause (Rest)</span>
                  </button>
                </div>
              </div>

              {/* Category selector */}
              {customMode === 'focus' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Catégorie
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {Object.values(CATEGORIES).filter(c => c.id !== 'break').map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomDialogOpen(false)}
                  className="flex-1 min-h-[44px] rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Appliquer ({customInputMinutes}m)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

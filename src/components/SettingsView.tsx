import React, { useState } from 'react';
import { Settings, Sliders, Volume2, RotateCcw, Clock, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { DailyGoal } from '../types';
import { playClickSound } from '../utils/audio';

interface SettingsViewProps {
  goal: DailyGoal;
  onUpdateGoal: (goal: DailyGoal) => void;
  onResetData: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  goal,
  onUpdateGoal,
  onResetData,
  isDarkMode,
  onToggleTheme,
}) => {
  const [targetHours, setTargetHours] = useState(goal.targetFocusMinutes / 60);
  const [wakeUp, setWakeUp] = useState(goal.wakeUpTime);
  const [windDown, setWindDown] = useState(goal.windDownTime);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    playClickSound();
    onUpdateGoal({
      targetFocusMinutes: Math.round(targetHours * 60),
      wakeUpTime: wakeUp,
      windDownTime: windDown,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 p-4 pb-20 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Preferences & Targets
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure daily targets and time management routines
        </p>
      </div>

      {/* Target Focus Hours Slider */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Daily Focus Target
            </h3>
          </div>
          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono-numbers">
            {targetHours.toFixed(1)} Hours
          </span>
        </div>

        <input
          type="range"
          min="2"
          max="10"
          step="0.5"
          value={targetHours}
          onChange={(e) => setTargetHours(parseFloat(e.target.value))}
          className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
          <span>2.0h (Light)</span>
          <span>6.0h (Optimal)</span>
          <span>10.0h (Intense)</span>
        </div>
      </div>

      {/* Routine Boundaries */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Day Boundaries
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Wake Up Time</label>
            <input
              type="time"
              value={wakeUp}
              onChange={(e) => setWakeUp(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Wind Down Time</label>
            <input
              type="time"
              value={windDown}
              onChange={(e) => setWindDown(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-sm"
        >
          {savedSuccess ? '✓ Targets Saved!' : 'Update Targets'}
        </button>
      </div>

      {/* Appearance & Sound */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Appearance & Audio
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-600" />}
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme</p>
              <p className="text-[11px] text-slate-400">Reduce eye strain during evening planning</p>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                isDarkMode ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Synthesizer Sound Effects</p>
              <p className="text-[11px] text-slate-400">Web Audio API chime & completion cues</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Data & Reset
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reset all time blocks, tasks, and timer records to starter defaults.
        </p>

        <button
          onClick={() => {
            if (window.confirm('Reset all sample time blocks and tasks to initial defaults?')) {
              onResetData();
            }
          }}
          className="w-full py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </div>
  );
};

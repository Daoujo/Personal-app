import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Sparkles } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeScreenTitle: string;
  isDeviceMode: boolean;
  setIsDeviceMode: (val: boolean) => void;
  isTimerRunning?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDeviceMode,
  setIsDeviceMode,
  isTimerRunning,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 transition-colors duration-300">
      {/* Top Desktop Helper Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 px-4 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Chronos Android Edition</span>
          <span className="hidden sm:inline">· Material You Time Management</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceMode(!isDeviceMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700 active:scale-95"
            title="Toggle between phone mockup view and full responsive view"
          >
            {isDeviceMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Expand Fullscreen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phone Mockup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container / Phone Mockup Wrapper */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${
          isDeviceMode
            ? 'max-w-[420px] min-h-[850px] max-h-[920px] rounded-[48px] ring-12 ring-slate-800 shadow-2xl border-4 border-slate-700 overflow-hidden my-auto'
            : 'max-w-4xl min-h-[90vh] rounded-2xl shadow-xl border border-slate-800 overflow-hidden'
        }`}
      >
        {/* Android Status Bar */}
        <div className="sticky top-0 z-40 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none border-b border-slate-200/50 dark:border-slate-800/40">
          {/* Time & Active notifications */}
          <div className="flex items-center gap-2 font-mono-numbers font-medium text-slate-700 dark:text-slate-200">
            <span>{timeStr}</span>
            {isTimerRunning && (
              <span className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-sans">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span className="hidden xs:inline">Focusing</span>
              </span>
            )}
          </div>

          {/* Android Punch Hole camera for phone frame */}
          {isDeviceMode && (
            <div className="w-4 h-4 rounded-full bg-slate-950 dark:bg-black border border-slate-700 shadow-inner -mt-1" />
          )}

          {/* Android Status Icons */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5 text-[11px] font-mono-numbers">
              <span>88%</span>
              <Battery className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          {children}
        </div>

        {/* Android Gesture Navigation Bar at the bottom */}
        <div className="py-2.5 bg-slate-100/95 dark:bg-slate-950/95 flex items-center justify-center select-none border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="w-32 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 transition-colors hover:bg-slate-500" />
        </div>
      </div>
    </div>
  );
};

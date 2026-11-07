import React from 'react';
import { Home, Calendar, Clock, CheckSquare, Cpu } from 'lucide-react';
import { ScreenId } from '../types';

interface BottomNavProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  pendingTasksCount,
}) => {
  const tabs: { id: ScreenId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'frontpage', label: 'Today', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'automatisme', label: 'Automatisme', icon: Cpu },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeScreen === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectScreen(tab.id)}
            className="flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center relative group active:scale-95 transition-transform"
          >
            {/* Material You Active Pill Indicator */}
            <div
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>

            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                isActive
                  ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </span>

            {/* Notification Badge */}
            {tab.badge !== undefined && (
              <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center font-mono-numbers">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { BarChart3, Clock, Flame, CheckCircle, TrendingUp, Sparkles, Award } from 'lucide-react';
import { TimeBlock, Task, TimeLog, CategoryType } from '../types';
import { CATEGORIES } from '../utils/storage';

interface AnalyticsViewProps {
  blocks: TimeBlock[];
  tasks: Task[];
  logs: TimeLog[];
  completedMinutes: number;
  targetMinutes: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  blocks,
  tasks,
  logs,
  completedMinutes,
  targetMinutes,
}) => {
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;
  const focusGoalPercent = Math.min(100, Math.round((completedMinutes / Math.max(1, targetMinutes)) * 100));

  // Compute total time by category across blocks
  const categoryHours = blocks.reduce((acc, b) => {
    if (b.isCompleted) {
      acc[b.category] = (acc[b.category] || 0) + b.durationMinutes;
    }
    return acc;
  }, {} as Record<CategoryType, number>);

  const totalLoggedMins = Object.values(categoryHours).reduce((a, b) => a + b, 0) || 1;

  // Mock weekly trends
  const weekTrend = [
    { day: 'Mon', hours: 5.2, target: 6.0 },
    { day: 'Tue', hours: 6.5, target: 6.0 },
    { day: 'Wed', hours: completedMinutes / 60, target: 6.0, isToday: true },
    { day: 'Thu', hours: 4.8, target: 6.0 },
    { day: 'Fri', hours: 5.5, target: 6.0 },
    { day: 'Sat', hours: 3.0, target: 4.0 },
    { day: 'Sun', hours: 2.5, target: 3.0 },
  ];

  return (
    <div className="flex-1 p-4 pb-20 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Time Audit & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Insights on where your daily energy and attention went
        </p>
      </div>

      {/* Top 3 KPI Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Focused</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
            {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m
          </div>
          <p className="text-[10px] text-slate-400 font-mono-numbers">{focusGoalPercent}% of goal</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
            {taskCompletionRate}%
          </div>
          <p className="text-[10px] text-slate-400 font-mono-numbers">{completedTasks}/{tasks.length} done</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Streak</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
            5 Days
          </div>
          <p className="text-[10px] text-slate-400">Consistency</p>
        </div>
      </div>

      {/* Weekly Hours Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Weekly Focus Rhythm
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">Target: 6.0h / day</span>
        </div>

        <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
          {weekTrend.map((item) => {
            const heightPercent = Math.min(100, (item.hours / 8) * 100);
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono-numbers text-slate-500 dark:text-slate-400">
                  {item.hours.toFixed(1)}h
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-24 relative overflow-hidden flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.isToday ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>
                <span className={`text-[11px] font-medium ${item.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Completed Time by Category
        </h3>

        <div className="space-y-3">
          {(Object.keys(CATEGORIES) as CategoryType[]).map((catKey) => {
            const mins = categoryHours[catKey] || 0;
            if (mins === 0) return null;
            const pct = Math.round((mins / totalLoggedMins) * 100);
            const cat = CATEGORIES[catKey];

            return (
              <div key={catKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono-numbers">
                    {Math.floor(mins / 60)}h {mins % 60}m ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`${cat.color} h-full rounded-full transition-all`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Completed Sessions Log
          </h3>
        </div>

        <div className="space-y-2">
          {logs.map((log) => {
            const cat = CATEGORIES[log.category] || CATEGORIES.work;
            return (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {log.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono-numbers">
                    {log.timestamp} · {cat.label}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono-numbers">
                  +{log.minutes}m
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

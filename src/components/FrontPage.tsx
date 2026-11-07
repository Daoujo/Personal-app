import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Zap, 
  ArrowUpRight, 
  Sparkles,
  Plus,
  Flame,
  Check,
  Sliders,
  X
} from 'lucide-react';
import { TimeBlock, Task, ScreenId, CategoryType, EveningScheduleItem } from '../types';
import { CATEGORIES } from '../utils/storage';
import { playTaskCompleteSound, playClickSound } from '../utils/audio';
import { TodayEveningAIModal } from './TodayEveningAIModal';

interface FrontPageProps {
  blocks: TimeBlock[];
  tasks: Task[];
  completedMinutes: number;
  targetMinutes: number;
  onToggleTask: (taskId: string) => void;
  onToggleBlock: (blockId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onStartFocus: (title: string, category: CategoryType, minutes: number) => void;
  onOpenAddModal: () => void;
  onQuickAddTask: (title: string, minutes: number, category: CategoryType) => void;
  onApplyEveningSchedule: (items: EveningScheduleItem[]) => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({
  blocks,
  tasks,
  completedMinutes,
  targetMinutes,
  onToggleTask,
  onToggleBlock,
  onNavigate,
  onStartFocus,
  onOpenAddModal,
  onQuickAddTask,
  onApplyEveningSchedule,
}) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskDuration, setQuickTaskDuration] = useState(30);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [isCustomSprintOpen, setIsCustomSprintOpen] = useState(false);
  const [customSprintMinutes, setCustomSprintMinutes] = useState(40);
  const [isEveningModalOpen, setIsEveningModalOpen] = useState(false);

  // Time calculations
  const progressPercent = Math.min(100, Math.round((completedMinutes / Math.max(1, targetMinutes)) * 100));
  const remainingMinutes = Math.max(0, targetMinutes - completedMinutes);

  // Determine current active block or next block
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTotalMins = currentHour * 60 + currentMin;

  const parseTimeToMins = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Find active block
  const activeBlock = blocks.find((b) => {
    const startMins = parseTimeToMins(b.startTime);
    const endMins = parseTimeToMins(b.endTime);
    return currentTotalMins >= startMins && currentTotalMins < endMins;
  }) || blocks.find((b) => !b.isCompleted) || blocks[0];

  // Week days for top horizontal scroller starting with today 04 on the far left
  const weekDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const weekdayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      label: offset === 0 ? 'today' : weekdayLabel.toUpperCase(),
      day: offset === 0 ? String(date.getDate()).padStart(2, '0') : String(date.getDate()),
      offset,
      isToday: offset === 0,
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  const selectedDayInfo = weekDays.find((d) => d.offset === selectedDayOffset) || weekDays[0];

  const handleTaskCheck = (taskId: string) => {
    playTaskCompleteSound();
    onToggleTask(taskId);
  };

  const handleBlockCheck = (blockId: string) => {
    playTaskCompleteSound();
    onToggleBlock(blockId);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    playClickSound();
    onQuickAddTask(quickTaskTitle.trim(), quickTaskDuration, 'work');
    setQuickTaskTitle('');
  };

  // Category distribution
  const categoryMinutes = blocks.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + b.durationMinutes;
    return acc;
  }, {} as Record<CategoryType, number>);

  const totalPlannedMinutes = Object.values(categoryMinutes).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex-1 p-4 pb-20 space-y-5 animate-fade-in">
      {/* 1. Header Greeting & Week Scroller */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {selectedDayOffset === 0
                ? 'TIME DASHBOARD'
                : `TIME DASHBOARD · ${selectedDayInfo.fullDate.toUpperCase()}`}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Make Today Count
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono-numbers">5 Day Streak</span>
          </div>
        </div>

        {/* Horizontal Day Scroller + Anchored Liquid Glass Micro-Window */}
        <div className={isEveningModalOpen ? 'relative z-50' : 'relative'}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {weekDays.map((item) => {
              const isSelected = selectedDayOffset === item.offset;
              return (
                <button
                  key={item.offset}
                  onClick={() => {
                    playClickSound();
                    setSelectedDayOffset(item.offset);
                    if (item.offset === 0) {
                      setIsEveningModalOpen((prev) => !prev);
                    } else {
                      setIsEveningModalOpen(false);
                    }
                  }}
                  title={item.isToday ? "Cliquer pour ouvrir l'assistant IA de la soirée" : item.fullDate}
                  className={`shrink-0 min-w-[60px] min-h-[46px] flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                      item.isToday ? 'lowercase tracking-normal' : 'uppercase tracking-wide'
                    }`}
                  >
                    {item.label}
                    {item.isToday && (
                      <Sparkles
                        className={`w-2.5 h-2.5 ${
                          isSelected ? 'text-amber-300' : 'text-indigo-500'
                        }`}
                      />
                    )}
                  </span>
                  <span className="text-sm font-bold font-mono-numbers mt-0.5">{item.day}</span>
                </button>
              );
            })}
          </div>

          {/* Anchored Liquid Glass Micro-Window emerging directly beneath Today 04 */}
          <TodayEveningAIModal
            isOpen={isEveningModalOpen}
            onClose={() => setIsEveningModalOpen(false)}
            tasks={tasks}
            existingBlocks={blocks}
            onApplySchedule={onApplyEveningSchedule}
          />
        </div>
      </div>

      {/* 2. Today's Progress & Focus Target Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Focus Goal Progress
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono-numbers">
                {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono-numbers">
                / {Math.floor(targetMinutes / 60)}h goal
              </span>
            </div>
          </div>

          {/* Radial Progress Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={163.3}
                strokeDashoffset={163.3 - (163.3 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-700"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono-numbers text-slate-800 dark:text-slate-100">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar & Subtext */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{remainingMinutes > 0 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m to target` : '🎉 Daily goal achieved!'}</span>
            <button
              onClick={() => onNavigate('analytics')}
              className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
            >
              Analytics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. "Now Active / Current Time Block" Widget */}
      {activeBlock && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 shadow-lg border border-indigo-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                {activeBlock.isCompleted ? 'Recently Completed' : 'Current Focus Slot'}
              </span>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-100 font-mono-numbers border border-white/10">
              {activeBlock.startTime} – {activeBlock.endTime}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {activeBlock.title}
          </h3>

          <p className="text-xs text-indigo-200 mb-4 line-clamp-1">
            {activeBlock.notes || `${activeBlock.durationMinutes} minutes dedicated time block`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartFocus(activeBlock.title, activeBlock.category, activeBlock.durationMinutes)}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Timer</span>
            </button>

            <button
              onClick={() => handleBlockCheck(activeBlock.id)}
              className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border flex items-center justify-center transition-all ${
                activeBlock.isCompleted
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title={activeBlock.isCompleted ? 'Completed' : 'Mark as completed'}
            >
              {activeBlock.isCompleted ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 4. Quick Pomodoro Launchpad */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quick Focus Sprints
          </span>
          <button
            onClick={() => onNavigate('focus')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Open Timer <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
          <button
            onClick={() => onStartFocus('Deep Work Sprint', 'work', 25)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white font-mono-numbers">25m</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Pomodoro</div>
          </button>

          <button
            onClick={() => onStartFocus('Deep Flow Session', 'work', 50)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white font-mono-numbers">50m</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Deep Flow</div>
          </button>

          <button
            onClick={() => onStartFocus('Recharge Break', 'break', 10)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white font-mono-numbers">10m</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Reset Break</div>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsCustomSprintOpen(true);
            }}
            className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300 font-mono-numbers">Custom</div>
            <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400 truncate">Temps Choisi</div>
          </button>
        </div>

        {/* Custom Sprint Dialog on FrontPage */}
        {isCustomSprintOpen && (
          <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Session de Temps Custom
                </h4>
              </div>
              <button
                onClick={() => setIsCustomSprintOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={customSprintMinutes}
                  onChange={(e) => setCustomSprintMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
              <span className="text-sm font-bold font-mono-numbers text-indigo-600 dark:text-indigo-400 w-12 text-right">
                {customSprintMinutes}m
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1.5">
                {[15, 35, 45, 60, 90].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomSprintMinutes(m)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono-numbers ${
                      customSprintMinutes === m
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsCustomSprintOpen(false);
                  onStartFocus(`Custom ${customSprintMinutes}m Sprint`, 'work', customSprintMinutes);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
              >
                Lancer ({customSprintMinutes}m)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Today's Priority Action Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Priority Tasks
            </span>
            <span className="text-xs font-mono-numbers text-slate-400">
              ({tasks.filter(t => t.isCompleted).length}/{tasks.length})
            </span>
          </div>

          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Task Input Form */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            placeholder="Quick add today's task..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-2 py-2">
            <input
              type="number"
              min="1"
              max="240"
              value={quickTaskDuration}
              onChange={(e) => setQuickTaskDuration(Math.max(1, Math.min(240, Number(e.target.value))))}
              className="w-9 text-xs font-mono-numbers text-center font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              title="Durée en minutes"
            />
            <span className="text-[11px] text-slate-400 font-mono-numbers pr-1">m</span>
          </div>

          <button
            type="submit"
            className="min-h-[40px] px-3 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all"
            aria-label="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Task List Items */}
        <div className="space-y-2">
          {tasks.slice(0, 4).map((task) => {
            const cat = CATEGORIES[task.category] || CATEGORIES.work;
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-3 ${
                  task.isCompleted
                    ? 'border-slate-100 dark:border-slate-800/60 opacity-60'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleTaskCheck(task.id)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold text-slate-800 dark:text-slate-200 truncate ${
                        task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{cat.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-numbers">{task.estimatedMinutes}m estimate</span>
                    </div>
                  </div>
                </div>

                {!task.isCompleted && (
                  <button
                    onClick={() => onStartFocus(task.title, task.category, task.estimatedMinutes)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-indigo-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="Start focus timer on this task"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focus</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Today's Time Blocks Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Schedule Snapshot
          </span>
          <button
            onClick={() => onNavigate('schedule')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Full Planner <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {[...blocks]
            .sort((a, b) => {
              const aIsAI = a.tag === 'IA Soirée' ? 0 : 1;
              const bIsAI = b.tag === 'IA Soirée' ? 0 : 1;
              if (aIsAI !== bIsAI) return aIsAI - bIsAI;
              if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
              return a.startTime.localeCompare(b.startTime);
            })
            .slice(0, 5)
            .map((block) => {
              const cat = CATEGORIES[block.category] || CATEGORIES.work;
              return (
                <div
                  key={block.id}
                  onClick={() => handleBlockCheck(block.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    block.isCompleted
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-8 rounded-full ${cat.color} shrink-0`} />
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold text-slate-900 dark:text-white truncate ${block.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {block.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-numbers">
                        {block.startTime} – {block.endTime} ({block.durationMinutes}m)
                        {block.tag ? ` · ${block.tag}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 shrink-0 ml-2">
                    {block.isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Done</span>
                    ) : (
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 7. Daily Balance & Time Category Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Time Distribution Today
          </span>
          <span className="text-xs font-mono-numbers text-slate-500">
            {Math.floor(totalPlannedMinutes / 60)}h {totalPlannedMinutes % 60}m planned
          </span>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {(Object.keys(categoryMinutes) as CategoryType[]).map((catKey) => {
            const mins = categoryMinutes[catKey] || 0;
            if (mins === 0) return null;
            const pct = (mins / totalPlannedMinutes) * 100;
            const cat = CATEGORIES[catKey];
            return (
              <div
                key={catKey}
                style={{ width: `${pct}%` }}
                className={`${cat.color} h-full transition-all`}
                title={`${cat.label}: ${mins}m (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
          {(Object.keys(categoryMinutes) as CategoryType[]).map((catKey) => {
            const mins = categoryMinutes[catKey] || 0;
            if (mins === 0) return null;
            const cat = CATEGORIES[catKey];
            return (
              <div key={catKey} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`} />
                <span className="truncate">{cat.label}</span>
                <span className="font-mono-numbers text-slate-400 text-[11px] ml-auto">
                  {mins}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Android Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-6 sm:right-8 z-30">
        <button
          onClick={() => {
            playClickSound();
            onOpenAddModal();
          }}
          className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center active:scale-90 transition-transform focus:outline-none"
          title="Add Time Block or Task"
          aria-label="Add time block or task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

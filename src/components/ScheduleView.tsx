import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, Calendar, Check, Circle, RefreshCw } from 'lucide-react';
import { TimeBlock, CategoryType } from '../types';
import { CATEGORIES } from '../utils/storage';
import { playTaskCompleteSound, playClickSound } from '../utils/audio';

interface ScheduleViewProps {
  blocks: TimeBlock[];
  onToggleBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onOpenAddModal: () => void;
  onSyncGoogleCalendar?: () => void;
  isSyncingCalendar?: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  blocks,
  onToggleBlock,
  onDeleteBlock,
  onOpenAddModal,
  onSyncGoogleCalendar,
  isSyncingCalendar,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredBlocks = filterCategory === 'all'
    ? blocks
    : blocks.filter(b => b.category === filterCategory);

  // Sort chronologically by start time
  const sortedBlocks = [...filteredBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = sortedBlocks.filter(b => b.isCompleted).length;
  const totalMinutes = sortedBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);

  return (
    <div className="flex-1 p-4 pb-20 space-y-4 animate-fade-in">
      {/* Schedule Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Daily Time Blocks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-numbers">
            {completedCount}/{sortedBlocks.length} completed · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m scheduled
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSyncGoogleCalendar && (
            <button
              onClick={() => {
                playClickSound();
                onSyncGoogleCalendar();
              }}
              disabled={isSyncingCalendar}
              title="Synchroniser avec Google Agenda"
              className="min-h-[40px] px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Sync Google</span>
            </button>
          )}

          <button
            onClick={() => {
              playClickSound();
              onOpenAddModal();
            }}
            className="min-h-[40px] px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Block</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterCategory('all')}
          className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Categories
        </button>
        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline Blocks List */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
        {sortedBlocks.map((block) => {
          const cat = CATEGORIES[block.category] || CATEGORIES.work;

          return (
            <div
              key={block.id}
              className={`relative z-10 pl-9 transition-all ${
                block.isCompleted ? 'opacity-65' : ''
              }`}
            >
              {/* Timeline Dot Indicator */}
              <button
                onClick={() => {
                  playTaskCompleteSound();
                  onToggleBlock(block.id);
                }}
                className={`absolute left-2.5 top-3 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  block.isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-900 border-indigo-500'
                }`}
                title={block.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
              >
                {block.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>

              {/* Block Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition-all flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono-numbers">
                      {block.startTime} – {block.endTime}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-numbers">
                      ({block.durationMinutes}m)
                    </span>
                    {block.tag === 'Google Agenda' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium inline-flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        Google Agenda
                      </span>
                    ) : block.tag ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {block.tag}
                      </span>
                    ) : null}
                  </div>

                  <h3 className={`text-sm font-bold text-slate-900 dark:text-white ${block.isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {block.title}
                  </h3>

                  {block.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {block.notes}
                    </p>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cat.bgLight} ${cat.textLight} border ${cat.borderLight}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      playClickSound();
                      onDeleteBlock(block.id);
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                    title="Delete time block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedBlocks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-6 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              No time blocks found
            </h4>
            <p className="text-xs text-slate-500">
              Tap "New Block" above to plan out your day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckSquare, Clock } from 'lucide-react';
import { CategoryType } from '../types';
import { CATEGORIES } from '../utils/storage';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimeBlock: (
    title: string,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    category: CategoryType,
    notes?: string,
    tag?: string
  ) => void;
  onAddTask: (
    title: string,
    estimatedMinutes: number,
    category: CategoryType,
    priority: 'high' | 'medium' | 'low'
  ) => void;
}

export const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  onAddTimeBlock,
  onAddTask,
}) => {
  const [mode, setMode] = useState<'block' | 'task'>('block');

  // Block form state
  const [blockTitle, setBlockTitle] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [blockCategory, setBlockCategory] = useState<CategoryType>('work');
  const [blockTag, setBlockTag] = useState('');
  const [blockNotes, setBlockNotes] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMinutes, setTaskMinutes] = useState(30);
  const [taskCategory, setTaskCategory] = useState<CategoryType>('work');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  if (!isOpen) return null;

  const calculateDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const totalStart = (sh || 0) * 60 + (sm || 0);
    const totalEnd = (eh || 0) * 60 + (em || 0);
    return Math.max(15, totalEnd - totalStart);
  };

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    const dur = calculateDuration(startTime, endTime);
    playTaskCompleteSound();
    onAddTimeBlock(blockTitle.trim(), startTime, endTime, dur, blockCategory, blockNotes.trim(), blockTag.trim());
    setBlockTitle('');
    setBlockNotes('');
    setBlockTag('');
    onClose();
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    playTaskCompleteSound();
    onAddTask(taskTitle.trim(), taskMinutes, taskCategory, taskPriority);
    setTaskTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Bottom Sheet Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 z-10 border-t border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => {
                playClickSound();
                setMode('block');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                mode === 'block'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Time Block</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setMode('task');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                mode === 'task'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Priority Task</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'block' ? (
          <form onSubmit={handleBlockSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Time Block Title
              </label>
              <input
                type="text"
                required
                value={blockTitle}
                onChange={(e) => setBlockTitle(e.target.value)}
                placeholder="e.g. Deep Work: Refactor API client"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={blockCategory}
                  onChange={(e) => setBlockCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tag / Label
                </label>
                <input
                  type="text"
                  value={blockTag}
                  onChange={(e) => setBlockTag(e.target.value)}
                  placeholder="e.g. Sprint Goal"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notes & Objectives (Optional)
              </label>
              <textarea
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value)}
                placeholder="What will success look like when this block ends?"
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm active:scale-98 transition-transform shadow-md"
            >
              Add Time Block
            </button>
          </form>
        ) : (
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Task Description
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Prepare presentation slides"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Durée
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono-numbers">
                    {taskMinutes}m
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={taskMinutes}
                  onChange={(e) => setTaskMinutes(Math.max(1, Math.min(300, Number(e.target.value))))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono-numbers text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minutes"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm active:scale-98 transition-transform shadow-md"
            >
              Add Priority Task
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

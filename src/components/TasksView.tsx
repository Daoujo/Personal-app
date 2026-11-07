import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Play, Filter, Clock } from 'lucide-react';
import { Task, CategoryType } from '../types';
import { CATEGORIES } from '../utils/storage';
import { playTaskCompleteSound, playClickSound } from '../utils/audio';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (title: string, estimatedMinutes: number, category: CategoryType, priority: 'high' | 'medium' | 'low') => void;
  onStartFocus: (title: string, category: CategoryType, minutes: number) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onStartFocus,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(30);
  const [newCategory, setNewCategory] = useState<CategoryType>('work');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending' && t.isCompleted) return false;
    if (filter === 'completed' && !t.isCompleted) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const totalEstimatedMins = filteredTasks.reduce((acc, t) => acc + (t.isCompleted ? 0 : t.estimatedMinutes), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playClickSound();
    onAddTask(newTitle.trim(), newMinutes, newCategory, newPriority);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleTaskCheck = (taskId: string) => {
    playTaskCompleteSound();
    onToggleTask(taskId);
  };

  const getPriorityBadge = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900';
      case 'medium':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900';
      case 'low':
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex-1 p-4 pb-20 space-y-4 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Action Items & Tasks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-numbers">
            {tasks.filter(t => !t.isCompleted).length} remaining · ~{Math.floor(totalEstimatedMins / 60)}h {totalEstimatedMins % 60}m workload
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setIsAdding(!isAdding);
          }}
          className="min-h-[40px] px-3.5 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close' : 'Add Task'}</span>
        </button>
      </div>

      {/* New Task Inline Card Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-indigo-200 dark:border-indigo-900 shadow-md space-y-3">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task description..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-400 font-medium">Duration</label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono-numbers">{newMinutes}m</span>
              </div>
              <input
                type="number"
                min="1"
                max="300"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Math.max(1, Math.min(300, Number(e.target.value))))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono-numbers text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Minutes"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200"
              >
                {Object.values(CATEGORIES).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-xl transition-all ${
              filter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-xs font-medium rounded-xl transition-all ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="all">Any Priority</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const cat = CATEGORIES[task.category] || CATEGORIES.work;
          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-3 ${
                task.isCompleted
                  ? 'border-slate-100 dark:border-slate-800/60 opacity-60'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleTaskCheck(task.id)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-xs font-semibold text-slate-900 dark:text-white truncate ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono-numbers">{task.estimatedMinutes}m</span>
                    <span aria-hidden="true">·</span>
                    <span>{cat.label}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!task.isCompleted && (
                  <button
                    onClick={() => onStartFocus(task.title, task.category, task.estimatedMinutes)}
                    className="min-h-[36px] px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Focus on this task"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focus</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    playClickSound();
                    onDeleteTask(task.id);
                  }}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-6 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              All caught up!
            </h4>
            <p className="text-xs text-slate-500">
              No tasks match your current filter. Enjoy your focused time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

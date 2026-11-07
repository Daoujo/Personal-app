import { TimeBlock, Task, CategoryInfo, CategoryType, DailyGoal, TimeLog } from '../types';

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  work: {
    id: 'work',
    label: 'Deep Work',
    color: 'bg-indigo-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    textLight: 'text-indigo-700 dark:text-indigo-300',
    borderLight: 'border-indigo-200 dark:border-indigo-800/60',
  },
  study: {
    id: 'study',
    label: 'Learning',
    color: 'bg-emerald-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    textLight: 'text-emerald-700 dark:text-emerald-300',
    borderLight: 'border-emerald-200 dark:border-emerald-800/60',
  },
  health: {
    id: 'health',
    label: 'Fitness & Health',
    color: 'bg-rose-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    textLight: 'text-rose-700 dark:text-rose-300',
    borderLight: 'border-rose-200 dark:border-rose-800/60',
  },
  personal: {
    id: 'personal',
    label: 'Personal & Life',
    color: 'bg-amber-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textLight: 'text-amber-700 dark:text-amber-300',
    borderLight: 'border-amber-200 dark:border-amber-800/60',
  },
  admin: {
    id: 'admin',
    label: 'Admin & Email',
    color: 'bg-sky-600',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    textLight: 'text-sky-700 dark:text-sky-300',
    borderLight: 'border-sky-200 dark:border-sky-800/60',
  },
  break: {
    id: 'break',
    label: 'Rest & Recharge',
    color: 'bg-teal-600',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    textLight: 'text-teal-700 dark:text-teal-300',
    borderLight: 'border-teal-200 dark:border-teal-800/60',
  },
};

const DEFAULT_BLOCKS: TimeBlock[] = [
  {
    id: 'b1',
    title: 'Morning Routine & Hydration',
    startTime: '07:30',
    endTime: '08:15',
    durationMinutes: 45,
    category: 'health',
    isCompleted: true,
    tag: 'Daily Ritual',
    notes: 'Drink 500ml water, light mobility stretching',
  },
  {
    id: 'b2',
    title: 'Deep Focus: Architecture & Code',
    startTime: '08:30',
    endTime: '11:00',
    durationMinutes: 150,
    category: 'work',
    isCompleted: true,
    tag: 'Priority 1',
    notes: 'No distractions, airplane mode on phone',
  },
  {
    id: 'b3',
    title: 'Mindful Lunch & Quick Walk',
    startTime: '12:00',
    endTime: '13:00',
    durationMinutes: 60,
    category: 'break',
    isCompleted: true,
    tag: 'Recharge',
    notes: 'Step away from screens',
  },
  {
    id: 'b4',
    title: 'Team Sync & Project Review',
    startTime: '13:30',
    endTime: '14:30',
    durationMinutes: 60,
    category: 'admin',
    isCompleted: false,
    tag: 'Collaboration',
    notes: 'Present sprint roadmap and answer blockers',
  },
  {
    id: 'b5',
    title: 'Learning: Kotlin & Mobile Systems',
    startTime: '15:00',
    endTime: '16:15',
    durationMinutes: 75,
    category: 'study',
    isCompleted: false,
    tag: 'Skill Growth',
    notes: 'Read chapter 4 on Jetpack Compose state architecture',
  },
  {
    id: 'b6',
    title: 'Gym & Core Conditioning',
    startTime: '17:00',
    endTime: '18:00',
    durationMinutes: 60,
    category: 'health',
    isCompleted: false,
    tag: 'Wellness',
    notes: 'Cardio intervals and recovery stretching',
  },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Draft quarterly product timeline',
    estimatedMinutes: 45,
    category: 'work',
    priority: 'high',
    isCompleted: true,
  },
  {
    id: 't2',
    title: 'Review pull requests and unit test passes',
    estimatedMinutes: 30,
    category: 'work',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: 't3',
    title: 'Clear inbox to zero (triage 18 emails)',
    estimatedMinutes: 20,
    category: 'admin',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: 't4',
    title: 'Complete 25 min Spanish listening lesson',
    estimatedMinutes: 25,
    category: 'study',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: 't5',
    title: 'Meal prep dinner & grocery restocking',
    estimatedMinutes: 35,
    category: 'personal',
    priority: 'low',
    isCompleted: false,
  },
];

const DEFAULT_GOAL: DailyGoal = {
  targetFocusMinutes: 360, // 6 hours
  wakeUpTime: '07:00',
  windDownTime: '22:30',
};

const DEFAULT_LOGS: TimeLog[] = [
  {
    id: 'l1',
    title: 'Deep Focus Sprint 1',
    category: 'work',
    minutes: 90,
    timestamp: 'Today 09:30 AM',
  },
  {
    id: 'l2',
    title: 'Deep Focus Sprint 2',
    category: 'work',
    minutes: 60,
    timestamp: 'Today 11:00 AM',
  },
  {
    id: 'l3',
    title: 'Morning Yoga & Core',
    category: 'health',
    minutes: 45,
    timestamp: 'Today 07:45 AM',
  },
];

const STORAGE_KEYS = {
  BLOCKS: 'chronos_blocks_v1',
  TASKS: 'chronos_tasks_v1',
  GOAL: 'chronos_goal_v1',
  LOGS: 'chronos_logs_v1',
  THEME: 'chronos_theme_v1',
};

export const getStoredBlocks = (): TimeBlock[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!raw) return DEFAULT_BLOCKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BLOCKS;
  }
};

export const saveStoredBlocks = (blocks: TimeBlock[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  } catch {
    // Ignore
  }
};

export const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
};

export const saveStoredTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // Ignore
  }
};

export const getStoredGoal = (): DailyGoal => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (!raw) return DEFAULT_GOAL;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GOAL;
  }
};

export const saveStoredGoal = (goal: DailyGoal) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  } catch {
    // Ignore
  }
};

export const getStoredLogs = (): TimeLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return DEFAULT_LOGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOGS;
  }
};

export const saveStoredLogs = (logs: TimeLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch {
    // Ignore
  }
};

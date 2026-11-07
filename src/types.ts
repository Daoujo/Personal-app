export type CategoryType = 'work' | 'study' | 'health' | 'personal' | 'admin' | 'break';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  color: string; // Tailwind color class or hex
  bgLight: string;
  textLight: string;
  borderLight: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  durationMinutes: number;
  category: CategoryType;
  isCompleted: boolean;
  notes?: string;
  tag?: string;
}

export interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  category: CategoryType;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface DailyGoal {
  targetFocusMinutes: number;
  wakeUpTime: string;
  windDownTime: string;
}

export interface TimeLog {
  id: string;
  title: string;
  category: CategoryType;
  minutes: number;
  timestamp: string;
}

export type ScreenId = 'frontpage' | 'schedule' | 'focus' | 'tasks' | 'automatisme' | 'analytics' | 'settings';

export interface EveningQuestion {
  id: string;
  question: string;
  placeholder: string;
  suggestedOptions: string[];
}

export interface EveningScheduleItem {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: CategoryType;
  itemType: 'course' | 'task' | 'break';
  tip: string;
}

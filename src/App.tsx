/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ScreenId, 
  TimeBlock, 
  Task, 
  DailyGoal, 
  TimeLog, 
  CategoryType,
  EveningScheduleItem
} from './types';
import { 
  getStoredBlocks, 
  saveStoredBlocks, 
  getStoredTasks, 
  saveStoredTasks, 
  getStoredGoal, 
  saveStoredGoal, 
  getStoredLogs, 
  saveStoredLogs 
} from './utils/storage';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';
import { NavigationDrawer } from './components/NavigationDrawer';
import { FrontPage } from './components/FrontPage';
import { ScheduleView } from './components/ScheduleView';
import { FocusTimerView } from './components/FocusTimerView';
import { TasksView } from './components/TasksView';
import { AutomatismeView } from './components/AutomatismeView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AddModal } from './components/AddModal';
import { 
  StoredGoogleUser, 
  getStoredGoogleToken, 
  getStoredGoogleUser, 
  getLastSyncTime, 
  setLastSyncTime, 
  signInWithGoogle, 
  logoutFromGoogle, 
  subscribeToAuthChanges 
} from './utils/googleAuth';
import { fetchGoogleCalendarEvents } from './utils/googleCalendar';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('frontpage');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeviceMode, setIsDeviceMode] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Focus Timer params passing
  const [activeFocusParams, setActiveFocusParams] = useState<{
    title: string;
    category: CategoryType;
    minutes: number;
  }>({
    title: 'Deep Focus Session',
    category: 'work',
    minutes: 25,
  });

  // Data states
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goal, setGoal] = useState<DailyGoal>({
    targetFocusMinutes: 360,
    wakeUpTime: '07:00',
    windDownTime: '22:30',
  });
  const [logs, setLogs] = useState<TimeLog[]>([]);

  // Google Auth & Calendar Sync States
  const [googleUser, setGoogleUser] = useState<StoredGoogleUser | null>(getStoredGoogleUser());
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [lastSyncTime, setLastSyncTimeState] = useState<string | null>(getLastSyncTime());

  // Initialize storage & Google auth listener
  useEffect(() => {
    setBlocks(getStoredBlocks());
    setTasks(getStoredTasks());
    setGoal(getStoredGoal());
    setLogs(getStoredLogs());
    setGoogleUser(getStoredGoogleUser());
    setLastSyncTimeState(getLastSyncTime());

    // Listen to Firebase auth changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        const storedUser: StoredGoogleUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        setGoogleUser(storedUser);
      }
    });

    // Check system color scheme preference
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    return () => unsubscribe();
  }, []);

  // Google Calendar Synchronization logic
  const handleSyncGoogleCalendar = async (tokenOverride?: string): Promise<number> => {
    const token = tokenOverride || getStoredGoogleToken();
    if (!token) {
      throw new Error("Veuillez d'abord vous connecter à votre compte Google.");
    }

    setIsSyncingCalendar(true);
    try {
      const gcalBlocks = await fetchGoogleCalendarEvents(token);
      setBlocks((prev) => {
        // Keep non-google blocks, replace google blocks
        const nonGoogleBlocks = prev.filter(
          (b) => b.tag !== 'Google Agenda' && !b.id.startsWith('gcal_')
        );
        const updated = [...nonGoogleBlocks, ...gcalBlocks].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        saveStoredBlocks(updated);
        return updated;
      });

      const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowTime);
      setLastSyncTimeState(nowTime);
      return gcalBlocks.length;
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleLoginGoogle = async () => {
    const { user, accessToken } = await signInWithGoogle();
    const storedUser: StoredGoogleUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    setGoogleUser(storedUser);
    // Directly sync calendar items upon connecting
    await handleSyncGoogleCalendar(accessToken);
  };

  const handleLogoutGoogle = async () => {
    await logoutFromGoogle();
    setGoogleUser(null);
    setLastSyncTimeState(null);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Block handlers
  const handleToggleBlock = (blockId: string) => {
    setBlocks((prev) => {
      const updated = prev.map((b) =>
        b.id === blockId ? { ...b, isCompleted: !b.isCompleted } : b
      );
      saveStoredBlocks(updated);
      return updated;
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== blockId);
      saveStoredBlocks(updated);
      return updated;
    });
  };

  const handleAddTimeBlock = (
    title: string,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    category: CategoryType,
    notes?: string,
    tag?: string
  ) => {
    const newBlock: TimeBlock = {
      id: 'b_' + Date.now(),
      title,
      startTime,
      endTime,
      durationMinutes,
      category,
      isCompleted: false,
      notes,
      tag,
    };
    setBlocks((prev) => {
      const updated = [...prev, newBlock];
      saveStoredBlocks(updated);
      return updated;
    });
  };

  const handleApplyEveningSchedule = (items: EveningScheduleItem[]) => {
    const newEveningBlocks: TimeBlock[] = items.map((item) => ({
      id: item.id,
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      durationMinutes: item.durationMinutes,
      category: item.category,
      isCompleted: false,
      notes: item.tip,
      tag: 'IA Soirée',
    }));

    setBlocks((prev) => {
      const nonEveningBlocks = prev.filter((b) => b.tag !== 'IA Soirée');
      const updated = [...nonEveningBlocks, ...newEveningBlocks].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      saveStoredBlocks(updated);
      return updated;
    });
  };

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
            }
          : t
      );
      saveStoredTasks(updated);
      return updated;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveStoredTasks(updated);
      return updated;
    });
  };

  const handleAddTask = (
    title: string,
    estimatedMinutes: number,
    category: CategoryType,
    priority: 'high' | 'medium' | 'low'
  ) => {
    const newTask: Task = {
      id: 't_' + Date.now(),
      title,
      estimatedMinutes,
      category,
      priority,
      isCompleted: false,
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveStoredTasks(updated);
      return updated;
    });
  };

  const handleQuickAddTask = (title: string, minutes: number, category: CategoryType) => {
    handleAddTask(title, minutes, category, 'medium');
  };

  // Focus Handlers
  const handleStartFocus = (title: string, category: CategoryType, minutes: number) => {
    setActiveFocusParams({ title, category, minutes });
    setActiveScreen('focus');
  };

  const handleLogCompletedFocus = (title: string, category: CategoryType, minutes: number) => {
    const newLog: TimeLog = {
      id: 'l_' + Date.now(),
      title,
      category,
      minutes,
      timestamp: 'Just now',
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev];
      saveStoredLogs(updated);
      return updated;
    });
  };

  // Goal & Reset handlers
  const handleUpdateGoal = (newGoal: DailyGoal) => {
    setGoal(newGoal);
    saveStoredGoal(newGoal);
  };

  const handleResetData = () => {
    localStorage.clear();
    setBlocks(getStoredBlocks());
    setTasks(getStoredTasks());
    setGoal(getStoredGoal());
    setLogs(getStoredLogs());
  };

  // Calculate completed minutes today from completed blocks + logs
  const completedMinutesFromBlocks = blocks
    .filter((b) => b.isCompleted)
    .reduce((acc, b) => acc + b.durationMinutes, 0);

  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <AndroidFrame
      activeScreenTitle="Chronos"
      isDeviceMode={isDeviceMode}
      setIsDeviceMode={setIsDeviceMode}
      isTimerRunning={isTimerRunning}
    >
      {/* Material 3 Slide-out Navigation Drawer (Sidebar Option) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeScreen={activeScreen}
        onSelectScreen={(screen) => setActiveScreen(screen)}
        pendingTasksCount={pendingTasksCount}
        completedMinutesToday={completedMinutesFromBlocks}
        targetMinutesToday={goal.targetFocusMinutes}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        googleUser={googleUser}
        onLoginGoogle={handleLoginGoogle}
        onLogoutGoogle={handleLogoutGoogle}
        onSyncGoogleCalendar={() => handleSyncGoogleCalendar()}
        isSyncingCalendar={isSyncingCalendar}
        lastSyncTime={lastSyncTime}
      />

      {/* Top App Bar with hamburger drawer trigger */}
      <TopAppBar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeScreen={activeScreen}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        googleUser={googleUser}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col">
        {activeScreen === 'frontpage' && (
          <FrontPage
            blocks={blocks}
            tasks={tasks}
            completedMinutes={completedMinutesFromBlocks}
            targetMinutes={goal.targetFocusMinutes}
            onToggleTask={handleToggleTask}
            onToggleBlock={handleToggleBlock}
            onNavigate={(screen) => setActiveScreen(screen)}
            onStartFocus={handleStartFocus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onQuickAddTask={handleQuickAddTask}
            onApplyEveningSchedule={handleApplyEveningSchedule}
          />
        )}

        {activeScreen === 'schedule' && (
          <ScheduleView
            blocks={blocks}
            onToggleBlock={handleToggleBlock}
            onDeleteBlock={handleDeleteBlock}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSyncGoogleCalendar={() => handleSyncGoogleCalendar()}
            isSyncingCalendar={isSyncingCalendar}
          />
        )}

        {activeScreen === 'focus' && (
          <FocusTimerView
            initialTitle={activeFocusParams.title}
            initialCategory={activeFocusParams.category}
            initialMinutes={activeFocusParams.minutes}
            onLogCompletedFocus={handleLogCompletedFocus}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
          />
        )}

        {activeScreen === 'tasks' && (
          <TasksView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onStartFocus={handleStartFocus}
          />
        )}

        {activeScreen === 'automatisme' && (
          <AutomatismeView />
        )}

        {activeScreen === 'analytics' && (
          <AnalyticsView
            blocks={blocks}
            tasks={tasks}
            logs={logs}
            completedMinutes={completedMinutesFromBlocks}
            targetMinutes={goal.targetFocusMinutes}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsView
            goal={goal}
            onUpdateGoal={handleUpdateGoal}
            onResetData={handleResetData}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>

      {/* Android Bottom Navigation */}
      <BottomNav
        activeScreen={activeScreen}
        onSelectScreen={(screen) => setActiveScreen(screen)}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Add Modal / Bottom Sheet */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTimeBlock={handleAddTimeBlock}
        onAddTask={handleAddTask}
      />
    </AndroidFrame>
  );
}

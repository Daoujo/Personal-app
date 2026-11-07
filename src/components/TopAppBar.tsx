import React, { useState } from 'react';
import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { ScreenId } from '../types';
import { StoredGoogleUser } from '../utils/googleAuth';

interface TopAppBarProps {
  onOpenDrawer: () => void;
  activeScreen: ScreenId;
  onOpenAddModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  googleUser?: StoredGoogleUser | null;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenDrawer,
  activeScreen,
  onOpenAddModal,
  isDarkMode,
  onToggleTheme,
  googleUser,
}) => {
  const [imgError, setImgError] = useState(false);
  const getScreenTitle = (screen: ScreenId) => {
    switch (screen) {
      case 'frontpage':
        return 'Chronos Time';
      case 'schedule':
        return 'Daily Schedule';
      case 'focus':
        return 'Focus Session';
      case 'tasks':
        return 'Action Tasks';
      case 'automatisme':
        return 'Automatisme & Systèmes';
      case 'analytics':
        return 'Time Analytics';
      case 'settings':
        return 'Preferences';
      default:
        return 'Chronos';
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
      {/* Left: Android Drawer Hamburger Menu Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDrawer}
          className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
          aria-label="Open sidebar menu"
          title="Open Side Bar Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
            {getScreenTitle(activeScreen)}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {getTodayFormatted()}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          aria-label="Toggle theme"
          title="Toggle light/dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onOpenAddModal}
          className="min-h-[44px] px-3 rounded-full flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
          title="Add block or task"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add</span>
        </button>

        {googleUser && (
          <button
            onClick={onOpenDrawer}
            title={`Compte: ${googleUser.displayName || googleUser.email}`}
            className="min-h-[44px] min-w-[44px] p-1 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-90 ml-0.5"
            aria-label="Voir le profil dans le menu latéral"
          >
            {googleUser.photoURL && !imgError ? (
              <img
                src={googleUser.photoURL}
                alt={googleUser.displayName || 'Google User'}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
                className="w-7 h-7 rounded-full object-cover border border-indigo-500 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
                {(googleUser.displayName || googleUser.email || 'G').charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

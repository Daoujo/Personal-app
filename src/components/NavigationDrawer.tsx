import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Clock, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  X, 
  Flame, 
  Moon, 
  Sun,
  ShieldCheck,
  Cpu,
  RefreshCw,
  LogOut,
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import { ScreenId } from '../types';
import { StoredGoogleUser } from '../utils/googleAuth';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  pendingTasksCount: number;
  completedMinutesToday: number;
  targetMinutesToday: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  // Google Auth & Calendar Sync Props
  googleUser: StoredGoogleUser | null;
  onLoginGoogle: () => Promise<void>;
  onLogoutGoogle: () => Promise<void>;
  onSyncGoogleCalendar: () => Promise<number>;
  isSyncingCalendar: boolean;
  lastSyncTime: string | null;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onSelectScreen,
  pendingTasksCount,
  completedMinutesToday,
  targetMinutesToday,
  isDarkMode,
  onToggleTheme,
  googleUser,
  onLoginGoogle,
  onLogoutGoogle,
  onSyncGoogleCalendar,
  isSyncingCalendar,
  lastSyncTime,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Compute displayed name from Google user or fallback
  const userDisplayName = googleUser?.displayName?.trim() || (googleUser?.email ? googleUser.email.split('@')[0] : 'Alex Morgan');
  const userInitials = userDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'AM';

  const navItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'frontpage', label: 'Front Page Overview', icon: Home },
    { id: 'schedule', label: 'Schedule & Time Blocks', icon: Calendar },
    { id: 'focus', label: 'Focus & Pomodoro Timer', icon: Clock },
    { id: 'tasks', label: 'Priority Action Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'automatisme', label: 'Automatisme (Math & Trading)', icon: Cpu },
    { id: 'analytics', label: 'Statistiques & Time Audit', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Daily Budgets', icon: Settings },
  ];

  const progressPercent = Math.min(100, Math.round((completedMinutesToday / Math.max(1, targetMinutesToday)) * 100));

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setSyncFeedback(null);
      await onLoginGoogle();
      setSyncFeedback({
        type: 'success',
        text: 'Compte Google connecté et agenda synchronisé !'
      });
      setTimeout(() => setSyncFeedback(null), 4500);
    } catch (err: any) {
      console.error('Google auth error:', err);
      setSyncFeedback({
        type: 'error',
        text: err?.message || 'Erreur lors de la connexion Google.'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncFeedback(null);
      const count = await onSyncGoogleCalendar();
      setSyncFeedback({
        type: 'success',
        text: `${count} événement${count > 1 ? 's' : ''} synchronisé${count > 1 ? 's' : ''} avec succès !`
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncFeedback({
        type: 'error',
        text: err?.message || 'Échec de la synchronisation.'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await onLogoutGoogle();
      setSyncFeedback({
        type: 'success',
        text: 'Compte Google déconnecté.'
      });
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-84 max-w-[88%] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800"
          >
            {/* Drawer Header (Material You Android Style with Google Account) */}
            <div className="p-5 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Google Profile Photo or Fallback Avatar */}
                  <div className="relative shrink-0">
                    {googleUser?.photoURL && !avatarError ? (
                      <img
                        src={googleUser.photoURL}
                        alt={userDisplayName}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setAvatarError(true)}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
                        {userInitials}
                      </div>
                    )}

                    {googleUser && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-700">
                        <GoogleIcon />
                      </div>
                    )}
                  </div>

                  {/* Connected Person Name and Google Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 dark:text-white leading-tight truncate text-base" title={userDisplayName}>
                      {userDisplayName}
                    </h2>

                    {googleUser?.email ? (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={googleUser.email}>
                        {googleUser.email}
                      </p>
                    ) : (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Pro Time Master
                      </p>
                    )}

                    {googleUser && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Compte Google connecté</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Google Account & Calendar Integration Card */}
              <div className="bg-white/90 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GoogleIcon />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Google Agenda
                    </span>
                  </div>

                  {googleUser ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synchronisé
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Non connecté
                    </span>
                  )}
                </div>

                {googleUser ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lastSyncTime ? `Dernière synchro : ${lastSyncTime}` : "Agenda lié, prêt à synchroniser."}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleManualSync}
                        disabled={isSyncingCalendar}
                        className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                        <span>{isSyncingCalendar ? 'Synchronisation...' : 'Synchroniser l’agenda'}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        title="Déconnecter le compte Google"
                        className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Connectez votre compte Google pour importer automatiquement vos rendez-vous et cours dans l’emploi du temps.
                    </p>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-98 disabled:opacity-60 transition-all"
                    >
                      <GoogleIcon />
                      <span>{authLoading ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
                    </button>
                  </div>
                )}

                {/* Status toast */}
                {syncFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-2 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                      syncFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    {syncFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="leading-tight">{syncFeedback.text}</span>
                  </motion.div>
                )}
              </div>

              {/* Daily Progress Gauge */}
              <div className="bg-white/70 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Objectif Focus Quotidien</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono-numbers font-semibold">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-numbers">
                  <span>{Math.floor(completedMinutesToday / 60)}h {completedMinutesToday % 60}m complétés</span>
                  <span>{Math.floor(targetMinutesToday / 60)}h prévu</span>
                </div>
              </div>
            </div>

            {/* Navigation Destinations */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider">
                NAVIGATION
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectScreen(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-600 text-white font-mono-numbers">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              {/* Daily Streak Card */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold">5 jours de régularité</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">Continuez vos sessions de travail</p>
                </div>
              </div>

              {/* Theme Switch & Quick Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
                </button>

                <div className="text-[11px] text-slate-400 font-mono-numbers">
                  v2.5 Android
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

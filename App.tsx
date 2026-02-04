
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, UserStats, AppSettings } from './types';
import { getStats, saveStats, getSettings, saveSettings } from './utils/storage';
import { playNotification, startAmbientSound, stopAmbientSound } from './utils/audio';

// --- Components ---

const Header: React.FC<{
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}> = ({ settings, setSettings }) => {
  const toggleDark = () => {
    const newSettings = { ...settings, darkMode: !settings.darkMode };
    setSettings(newSettings);
    document.documentElement.classList.toggle('dark', newSettings.darkMode);
  };

  const toggleSound = () => {
    const newSettings = { ...settings, ambientSound: !settings.ambientSound };
    setSettings(newSettings);
    if (newSettings.ambientSound) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
  };

  return (
    <header className="w-full max-w-2xl flex justify-between items-center py-6 px-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <span className="bg-rose-500 w-3 h-3 rounded-full"></span>
        FocusForge
      </h1>
      <div className="flex gap-4">
        <button
          onClick={toggleSound}
          title="Toggle Ambient Rain"
          className={`p-2 rounded-full transition-all hover:scale-110 ${
            settings.ambientSound ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}
        >
          {settings.ambientSound ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19x"/><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 14l-4 4-4-4"/></svg>
          )}
        </button>
        <button
          onClick={toggleDark}
          title="Toggle Dark Mode"
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 transition-all hover:scale-110"
        >
          {settings.darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>
    </header>
  );
};

const Timer: React.FC<{
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (m: TimerMode) => void;
}> = ({ mode, timeLeft, isActive, onToggle, onReset, onSwitchMode }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-full">
        <button
          onClick={() => onSwitchMode('focus')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === 'focus' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => onSwitchMode('break')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === 'break' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Break
        </button>
      </div>

      <div className="relative flex items-center justify-center w-72 h-72">
        <svg className="w-full h-full transform rotate-[-90deg]">
          <circle
            cx="50%" cy="50%" r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="12" fill="none"
          />
          <circle
            cx="50%" cy="50%" r={radius}
            className={`progress-ring transition-all duration-1000 ease-linear ${
              mode === 'focus' ? 'stroke-rose-500' : 'stroke-teal-500'
            }`}
            strokeWidth="12" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          <span className="timer-digit text-7xl font-bold tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm font-medium uppercase tracking-widest text-slate-400 mt-2">
            {mode}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onReset}
          className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          title="Reset Timer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <button
          onClick={onToggle}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 ${
            isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-rose-500 text-white'
          }`}
        >
          {isActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg className="ml-1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        <div className="w-[56px]" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
};

const StatsBoard: React.FC<{
  stats: UserStats;
  setStats: (s: UserStats) => void;
}> = ({ stats, setStats }) => {
  const goalProgress = Math.min((stats.todaySessions / stats.dailyGoal) * 100, 100);
  const isGoalReached = stats.todaySessions >= stats.dailyGoal;

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = parseInt(e.target.value) || 1;
    const newStats = { ...stats, dailyGoal: newGoal };
    setStats(newStats);
    saveStats(newStats);
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Today</span>
          <span className="text-3xl font-bold">{stats.todaySessions} <span className="text-sm text-slate-400 font-normal">sessions</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">This Week</span>
          <span className="text-3xl font-bold">{stats.weekSessions} <span className="text-sm text-slate-400 font-normal">sessions</span></span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Goal</span>
            {isGoalReached && (
              <span className="text-xs text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Goal Achieved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="99"
              value={stats.dailyGoal}
              onChange={handleGoalChange}
              className="w-12 bg-slate-50 dark:bg-slate-800 border-none rounded p-1 text-center font-bold focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Sessions</span>
          </div>
        </div>
        
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isGoalReached ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-rose-500'
            }`}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<UserStats>(getStats());
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const timerRef = useRef<number | null>(null);

  // Initialize UI
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSwitchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  }, []);

  const completeSession = useCallback(() => {
    playNotification();
    if (mode === 'focus') {
      const newStats = {
        ...stats,
        todaySessions: stats.todaySessions + 1,
        weekSessions: stats.weekSessions + 1,
      };
      setStats(newStats);
      saveStats(newStats);
      handleSwitchMode('break');
    } else {
      handleSwitchMode('focus');
    }
  }, [mode, stats, handleSwitchMode]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, completeSession]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const handleSetSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pb-20">
      <Header settings={settings} setSettings={handleSetSettings} />
      
      <main className="w-full flex flex-col items-center gap-12 max-w-2xl mt-8">
        <Timer
          mode={mode}
          timeLeft={timeLeft}
          isActive={isActive}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSwitchMode={handleSwitchMode}
        />
        
        <StatsBoard stats={stats} setStats={setStats} />
      </main>

      <footer className="mt-auto pt-16 text-slate-400 text-xs font-medium uppercase tracking-widest text-center opacity-50">
        Crafted for Clarity &bull; FocusForge &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;


import { UserStats, AppSettings } from '../types';

const STATS_KEY = 'focusforge_stats';
const SETTINGS_KEY = 'focusforge_settings';

const DEFAULT_STATS: UserStats = {
  todaySessions: 0,
  weekSessions: 0,
  dailyGoal: 4,
  lastUpdate: new Date().toISOString(),
  weekStartDate: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  ambientSound: false,
  ambientSoundType: 'rain',
  ambientVolume: 0.5,
  focusDuration: 25,
  breakDuration: 5,
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) return DEFAULT_STATS;
  
  const stats: UserStats = JSON.parse(stored);
  const now = new Date();
  const lastUpdate = new Date(stats.lastUpdate);
  const weekStart = new Date(stats.weekStartDate);

  // Daily Reset
  if (now.toDateString() !== lastUpdate.toDateString()) {
    stats.todaySessions = 0;
    stats.lastUpdate = now.toISOString();
  }

  // Weekly Reset (Every 7 Days)
  const diffDays = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 7) {
    stats.weekSessions = 0;
    stats.weekStartDate = now.toISOString();
  }

  saveStats(stats);
  return stats;
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify({
    ...stats,
    lastUpdate: new Date().toISOString()
  }));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

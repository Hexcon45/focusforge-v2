
import { UserStats, AppSettings } from '../types';

const STATS_KEY = 'focusforge_stats';
const SETTINGS_KEY = 'focusforge_settings';

const DEFAULT_STATS: UserStats = {
  todaySessions: 0,
  weekSessions: 0,
  dailyGoal: 4,
  lastUpdate: new Date().toISOString(),
  weekStartDate: new Date().toISOString(),
  totalMinutesToday: 0,
  totalMinutesWeek: 0,
  longestStreak: 0,
  currentStreak: 0,
  history: {},
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
  const todayStr = now.toISOString().split('T')[0];
  const lastUpdateDate = new Date(stats.lastUpdate);
  const lastUpdateStr = lastUpdateDate.toISOString().split('T')[0];

  // Daily Reset and Streak Logic
  if (todayStr !== lastUpdateStr) {
    // Archive yesterday's sessions
    stats.history[lastUpdateStr] = stats.todaySessions;

    // Check Streak
    const diffTime = Math.abs(now.getTime() - lastUpdateDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      // Streak continues if they did something yesterday
      if (stats.todaySessions > 0) {
        stats.currentStreak += 1;
      }
    } else {
      // Streak broken
      stats.currentStreak = 0;
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.todaySessions = 0;
    stats.totalMinutesToday = 0;
    stats.lastUpdate = now.toISOString();
  }

  // Weekly Reset
  const weekStart = new Date(stats.weekStartDate);
  const diffWeekDays = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  if (diffWeekDays >= 7) {
    stats.weekSessions = 0;
    stats.totalMinutesWeek = 0;
    stats.weekStartDate = now.toISOString();
  }

  saveStats(stats);
  return stats;
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};


export type TimerMode = 'focus' | 'break';

export interface UserStats {
  todaySessions: number;
  weekSessions: number;
  dailyGoal: number;
  lastUpdate: string; // ISO Date
  weekStartDate: string; // ISO Date
}

export interface AppSettings {
  darkMode: boolean;
  ambientSound: boolean;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
}

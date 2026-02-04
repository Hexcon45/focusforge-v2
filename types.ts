
export type TimerMode = 'focus' | 'break';
export type AmbientSoundType = 'rain' | 'cafe' | 'white';

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
  ambientSoundType: AmbientSoundType;
  ambientVolume: number; // 0 to 1
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
}

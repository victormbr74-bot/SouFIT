import { addDaysToDateString, getLocalDateString } from './dates';

export interface StreakState {
  lastActiveDate: string | null;
  currentStreak: number;
  lastCheckedDate: string | null;
  dailyPenaltyAppliedDate: string | null;
}

export function registerDailyActivity(state: StreakState, dateStr = getLocalDateString()): StreakState {
  if (state.lastActiveDate === dateStr) return state;

  const yesterday = addDaysToDateString(dateStr, -1);
  const currentStreak = state.lastActiveDate === yesterday ? state.currentStreak + 1 : 1;
  return {
    ...state,
    currentStreak,
    lastActiveDate: dateStr
  };
}

export function resetStreakIfStale(state: StreakState, today = getLocalDateString()): StreakState {
  const yesterday = addDaysToDateString(today, -1);
  if (state.lastActiveDate !== yesterday && state.lastActiveDate !== today) {
    return {
      ...state,
      currentStreak: 0
    };
  }
  return state;
}

export function isDateInStreak(dateStr: string, hunter: StreakState) {
  if (!hunter.lastActiveDate || hunter.currentStreak <= 0) return false;
  const start = addDaysToDateString(hunter.lastActiveDate, -(hunter.currentStreak - 1));
  return dateStr >= start && dateStr <= hunter.lastActiveDate;
}

export function getLongestConsecutiveStreak(dateStrings: string[]) {
  const sorted = Array.from(new Set(dateStrings))
    .filter(Boolean)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  let best = 0;
  let current = 0;
  let previous: string | null = null;

  sorted.forEach(date => {
    if (!previous) {
      current = 1;
    } else {
      const expected = addDaysToDateString(previous, 1);
      current = date === expected ? current + 1 : 1;
    }
    previous = date;
    best = Math.max(best, current);
  });

  return best;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDate(input: string | Date = new Date()) {
  if (input instanceof Date) return new Date(input);
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function startOfDayLocal(date = new Date()) {
  const normalized = toDate(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getLocalDateString(date = new Date()) {
  const normalized = startOfDayLocal(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toISODateLocal(date = new Date()) {
  return getLocalDateString(startOfDayLocal(date));
}

export function diffDays(dateA: string | Date, dateB: string | Date = new Date()) {
  const normalizedA = startOfDayLocal(toDate(dateA));
  const normalizedB = startOfDayLocal(toDate(dateB));
  return Math.round((normalizedA.getTime() - normalizedB.getTime()) / MS_PER_DAY);
}

export function isYesterday(date: string | Date, referenceDate: string | Date = new Date()) {
  return diffDays(referenceDate, date) === 1;
}

export function getWeekKey(date: string | Date = new Date()) {
  const normalized = startOfDayLocal(toDate(date));
  const day = normalized.getDay() || 7;
  const adjusted = new Date(normalized);
  adjusted.setDate(adjusted.getDate() + (4 - day));
  const yearStart = new Date(adjusted.getFullYear(), 0, 1);
  const weekNumber = Math.floor(((adjusted.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7) + 1;
  const week = String(weekNumber).padStart(2, '0');
  return `${adjusted.getFullYear()}-W${week}`;
}

export function getMonthKey(date: string | Date = new Date()) {
  const normalized = startOfDayLocal(toDate(date));
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function addDaysToDateString(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);
  baseDate.setDate(baseDate.getDate() + days);
  return getLocalDateString(baseDate);
}

export function compareDateStrings(a?: string, b?: string) {
  if (!a || !b) return 0;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function parsePtBrDate(dateStr?: string) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

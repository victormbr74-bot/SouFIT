import { getLocalDateString } from './dates';
import { RunEntry, RunFilters, RunStoragePayload } from './types';

export const RUNS_STORAGE_KEY = 'soufit_runs_v1';
export const RUNS_STORAGE_VERSION = 1;

interface NormalizeInput extends Partial<RunEntry> {
  date?: string;
  dateISO?: string;
  dateTimeISO?: string;
}

export function normalizeRun(run: NormalizeInput): RunEntry | null {
  if (!run) return null;
  const dateISO = run.dateTimeISO || run.dateISO || run.date;
  if (!dateISO) return null;
  const dateObj = new Date(dateISO);
  if (Number.isNaN(dateObj.getTime())) return null;
  const distanceKm = Number(run.distanceKm) || 0;
  const timeSeconds = Number(run.timeSeconds) || 0;
  if (!distanceKm || !timeSeconds) return null;

  return {
    id: run.id || `run-${Date.now()}`,
    dateTimeISO: dateObj.toISOString(),
    dateKey: run.dateKey || getLocalDateString(dateObj),
    distanceKm,
    timeSeconds,
    avgPaceSecPerKm: Number(run.avgPaceSecPerKm) || Math.round(timeSeconds / distanceKm),
    avgSpeedKmh: Number(run.avgSpeedKmh) || Number((distanceKm / (timeSeconds / 3600)).toFixed(2)),
    notes: run.notes || '',
    pointsEarned: run.pointsEarned || 0,
    runType: run.runType,
    dataQuality: run.dataQuality
  };
}

export function filterRuns(runs: RunEntry[], filters: RunFilters): RunEntry[] {
  let filtered = [...runs];
  if (filters.rangeDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filters.rangeDays);
    filtered = filtered.filter(run => new Date(run.dateTimeISO) >= cutoff);
  }
  if (filters.minDistance > 0) {
    filtered = filtered.filter(run => run.distanceKm >= filters.minDistance);
  }

  switch (filters.sortBy) {
    case 'date_asc':
      filtered.sort((a, b) => new Date(a.dateTimeISO).getTime() - new Date(b.dateTimeISO).getTime());
      break;
    case 'pace_asc':
      filtered.sort((a, b) => a.avgPaceSecPerKm - b.avgPaceSecPerKm);
      break;
    case 'speed_desc':
      filtered.sort((a, b) => b.avgSpeedKmh - a.avgSpeedKmh);
      break;
    case 'distance_desc':
      filtered.sort((a, b) => b.distanceKm - a.distanceKm);
      break;
    default:
      filtered.sort((a, b) => new Date(b.dateTimeISO).getTime() - new Date(a.dateTimeISO).getTime());
      break;
  }

  return filtered;
}

export function getRunPointsForDate(runs: RunEntry[], dateKey: string) {
  return runs
    .filter(run => run.dateKey === dateKey)
    .reduce((sum, run) => sum + (run.pointsEarned || 0), 0);
}

export function summarizeRuns(runs: RunEntry[]) {
  const totalKm = runs.reduce((sum, run) => sum + run.distanceKm, 0);
  const bestPace = runs.length ? Math.min(...runs.map(run => run.avgPaceSecPerKm)) : null;
  const bestSpeed = runs.length ? Math.max(...runs.map(run => run.avgSpeedKmh)) : null;
  return {
    totalKm,
    bestPace,
    bestSpeed
  };
}

export function exportRunsPayload(runs: RunEntry[]): RunStoragePayload {
  return {
    version: RUNS_STORAGE_VERSION,
    runs
  };
}

export function importRunsPayload(payload: unknown): RunEntry[] {
  const normalizeEntries = (items: unknown[]) =>
    items.map(entry => normalizeRun(entry as NormalizeInput)).filter((item): item is RunEntry => Boolean(item));

  if (!payload) return [];
  if (Array.isArray(payload)) {
    return normalizeEntries(payload);
  }
  if (typeof payload === 'object' && payload !== null && 'runs' in payload) {
    const candidate = (payload as RunStoragePayload).runs;
    if (Array.isArray(candidate)) {
      return normalizeEntries(candidate);
    }
  }
  return [];
}

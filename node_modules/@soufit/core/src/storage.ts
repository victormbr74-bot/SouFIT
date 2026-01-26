export const STORAGE_VERSION_KEY = 'soufit_storage_version';
export const STORAGE_VERSION = 'soufit_v2';

export const LEGACY_KEYS = [
  'fitTrackUsers',
  'fitTrackCurrentUser',
  'fitTrackProfilePics',
  'fitTrackHunterLevels',
  'fitTrackAchievements',
  'fitTrackDailyQuests',
  STORAGE_VERSION_KEY,
  'soufit_runs_v1'
];

export const LEGACY_PREFIXES = [
  'fitTrackWorkouts_',
  'fitTrackResults_',
  'fitTrackDiets_',
  'fitTrackFoodLogs_',
  'fitTrackActivityFeed_'
];

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  listKeys?(): Promise<string[]>;
}

export async function exportSnapshot(
  adapter: StorageAdapter,
  keys: string[]
): Promise<Record<string, unknown>> {
  const snapshot: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = await adapter.getItem(key);
    if (!raw) continue;
    try {
      snapshot[key] = JSON.parse(raw);
    } catch {
      snapshot[key] = raw;
    }
  }
  return snapshot;
}

export async function importSnapshot(adapter: StorageAdapter, snapshot: Record<string, unknown>) {
  const entries = Object.entries(snapshot);
  for (const [key, value] of entries) {
    const storedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await adapter.setItem(key, storedValue);
  }
}

export function shouldMigrateKey(key: string) {
  return (
    LEGACY_KEYS.includes(key) || LEGACY_PREFIXES.some(prefix => key.startsWith(prefix))
  );
}

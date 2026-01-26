export function parseTimeToSeconds(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) return null;
  const hours = match[3] ? Number(match[1]) : 0;
  const minutes = match[3] ? Number(match[2]) : Number(match[1]);
  const seconds = match[3] ? Number(match[3]) : Number(match[2]);
  if (minutes > 59 || seconds > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatSecondsToTime(totalSeconds?: number) {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return '--:--:--';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calcPaceSecondsPerKm(distanceKm: number, timeSeconds: number) {
  if (!distanceKm || !timeSeconds) return null;
  return Math.round(timeSeconds / distanceKm);
}

export function calcSpeedKmh(distanceKm: number, timeSeconds: number) {
  if (!distanceKm || !timeSeconds) return null;
  return distanceKm / (timeSeconds / 3600);
}

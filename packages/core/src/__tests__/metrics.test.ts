import { calcPaceSecondsPerKm, calcSpeedKmh, formatSecondsToTime, parseTimeToSeconds } from '../metrics';

describe('metrics helpers', () => {
  it('parses time strings to seconds', () => {
    expect(parseTimeToSeconds('01:02:03')).toBe(3723);
    expect(parseTimeToSeconds('45:30')).toBe(2730);
    expect(parseTimeToSeconds('invalid')).toBeNull();
  });

  it('formats seconds into hh:mm:ss', () => {
    expect(formatSecondsToTime(3723)).toBe('01:02:03');
    expect(formatSecondsToTime(0)).toBe('--:--:--');
  });

  it('calculates pace per km', () => {
    expect(calcPaceSecondsPerKm(5, 1500)).toBe(300);
    expect(calcPaceSecondsPerKm(0, 120)).toBeNull();
  });

  it('calculates speed km/h', () => {
    expect(calcSpeedKmh(5, 1800)).toBeCloseTo(10, 3);
  });
});

import { addDaysToDateString, compareDateStrings, getLocalDateString, parsePtBrDate } from '../dates';

describe('dates utils', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getLocalDateString(new Date('2025-03-05T12:00:00Z'));
    expect(result).toBe('2025-03-05');
  });

  it('adds days correctly to date string', () => {
    const base = '2025-03-05';
    expect(addDaysToDateString(base, 2)).toBe('2025-03-07');
    expect(addDaysToDateString(base, -5)).toBe('2025-02-28');
  });

  it('compares date strings', () => {
    expect(compareDateStrings('2025-03-01', '2025-03-02')).toBe(-1);
    expect(compareDateStrings('2025-03-02', '2025-03-01')).toBe(1);
    expect(compareDateStrings('2025-03-05', '2025-03-05')).toBe(0);
  });

  it('parses pt-BR date strings', () => {
    const parsed = parsePtBrDate('10/04/2025');
    expect(parsed.toISOString().startsWith('2025-04-10')).toBe(true);
    const iso = parsePtBrDate('2025-04-10');
    expect(iso.toISOString().startsWith('2025-04-10')).toBe(true);
  });
});

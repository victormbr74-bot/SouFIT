import { calculateRunPoints, POINTS_CONFIG } from '../points';

describe('points calculation', () => {
  it('applies a daily cap to run points', () => {
    const result = calculateRunPoints(20, 0, POINTS_CONFIG);
    expect(result.earned).toBe(120);
    expect(result.capped).toBe(true);
  });

  it('uses remaining quota when already earned some', () => {
    const result = calculateRunPoints(2, 110, POINTS_CONFIG);
    expect(result.earned).toBe(10);
    expect(result.capped).toBe(false);
  });

  it('does not give points when cap already reached', () => {
    const result = calculateRunPoints(1, 150, POINTS_CONFIG);
    expect(result.earned).toBe(0);
    expect(result.capped).toBe(true);
  });
});

import { getRankFromPoints } from '../ranks';

describe('rank calculations', () => {
  it('starts at E1 for zero points', () => {
    const info = getRankFromPoints(0);
    expect(info.rankLetter).toBe('E');
    expect(info.subLevel).toBe(1);
  });

  it('advances sublevels correctly', () => {
    const info = getRankFromPoints(530);
    expect(info.rankLetter).toBe('E');
    expect(info.subLevel).toBe(2);
  });

  it('moves to next rank after threshold', () => {
    const info = getRankFromPoints(2600);
    expect(info.rankLetter).toBe('D');
    expect(info.subLevel).toBe(1);
  });

  it('marks max rank when at S5', () => {
    const info = getRankFromPoints(15000);
    expect(info.rankLetter).toBe('S');
    expect(info.subLevel).toBe(5);
    expect(info.isMaxRank).toBe(true);
    expect(info.nextThreshold).toBeNull();
  });
});

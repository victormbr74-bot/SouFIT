export interface RankInfo {
  rankLetter: string;
  subLevel: number;
  progressInSubLevel: number;
  nextThreshold: number | null;
  isMaxRank: boolean;
}

const rankLetters = ['E', 'D', 'C', 'B', 'A', 'S'];
const RANK_SIZE = 2500;
const SUB_LEVEL_SIZE = 500;

export function getRankFromPoints(points: number): RankInfo {
  const normalized = Math.max(0, Math.floor(points || 0));
  const rankIndex = Math.min(rankLetters.length - 1, Math.floor(normalized / RANK_SIZE));
  const rankStart = rankIndex * RANK_SIZE;
  const pointsInRank = normalized - rankStart;
  const subLevel = Math.min(5, Math.floor(pointsInRank / SUB_LEVEL_SIZE) + 1);
  const subLevelStart = rankStart + (subLevel - 1) * SUB_LEVEL_SIZE;
  const progressInSubLevel = normalized - subLevelStart;
  const isMaxRank = rankIndex === rankLetters.length - 1 && subLevel === 5;
  const nextThreshold = isMaxRank ? null : subLevelStart + SUB_LEVEL_SIZE;

  return {
    rankLetter: rankLetters[rankIndex],
    subLevel,
    progressInSubLevel,
    nextThreshold,
    isMaxRank
  };
}

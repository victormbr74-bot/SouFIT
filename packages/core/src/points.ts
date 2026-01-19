import { PointsConfig } from './types';

export const POINTS_CONFIG: PointsConfig = {
  dailyQuest: 25,
  workout: 50,
  runPerKm: 10,
  runDailyCap: 120,
  weightLog: 5
};

export function calculateRunPoints(
  distanceKm: number,
  alreadyEarned = 0,
  config: PointsConfig = POINTS_CONFIG
) {
  const runBasePoints = Math.round(distanceKm * config.runPerKm);
  const availablePoints = Math.max(config.runDailyCap - alreadyEarned, 0);
  const earned = Math.min(runBasePoints, availablePoints);
  const hasReachedCap =
    alreadyEarned >= config.runDailyCap ||
    runBasePoints >= config.runDailyCap ||
    availablePoints <= 0;
  return {
    earned,
    availablePoints,
    capped: hasReachedCap
  };
}

export function missionPoints(config: PointsConfig = POINTS_CONFIG) {
  return config.dailyQuest;
}

export function workoutPoints(config: PointsConfig = POINTS_CONFIG) {
  return config.workout;
}

export function weightPoints(config: PointsConfig = POINTS_CONFIG) {
  return config.weightLog;
}

export function dailyPenalty(penalty = -10) {
  return penalty;
}

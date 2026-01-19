import { getLocalDateString } from './dates';
import { Achievement, DietPlan, FoodLogEntry, RunEntry, WeightEntry, WorkoutEntry } from './types';
import { getLongestConsecutiveStreak } from './streak';

export interface AchievementProgressContext {
  achievements: Achievement[];
  runs: RunEntry[];
  workouts: WorkoutEntry[];
  diets: DietPlan[];
  foodLogs: FoodLogEntry[];
  results: WeightEntry[];
  todayISO?: string;
}

export interface AchievementProgressResult {
  achievements: Achievement[];
  unlocked: Achievement[];
}

export function normalizeAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.map(achievement => ({
    ...achievement,
    progressCurrent: achievement.progressCurrent || 0,
    unlockedAt: achievement.unlockedAt || null,
    unlocked: achievement.unlocked || false
  }));
}

export function computeAchievementProgress(context: AchievementProgressContext): AchievementProgressResult {
  const {
    achievements,
    runs,
    workouts,
    diets,
    foodLogs,
    results,
    todayISO
  } = context;

  const today = todayISO || getLocalDateString();
  const runsCount = runs.length;
  const maxRunDistance = runsCount ? Math.max(...runs.map(run => run.distanceKm || 0)) : 0;
  const bestPace = runsCount ? Math.min(...runs.map(run => run.avgPaceSecPerKm || Infinity)) : Infinity;

  const [year, month] = today.split('-');
  const monthKey = `${year}-${month}`;
  const runsMonthKm = runs.reduce((sum, run) => {
    if (!run.dateKey) return sum;
    return run.dateKey.slice(0, 7) === monthKey ? sum + (run.distanceKm || 0) : sum;
  }, 0);

  const completedWorkouts = workouts.filter(workout => workout.completed);
  const workoutDateSet = new Set<string>();
  completedWorkouts.forEach(workout => {
    const raw = workout.completedAt || workout.created || null;
    if (!raw) return;
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      workoutDateSet.add(getLocalDateString(parsed));
    }
  });

  const workoutDates = Array.from(workoutDateSet);
  const workoutStreak = getLongestConsecutiveStreak(workoutDates);
  const workoutsThisMonth = completedWorkouts.filter(workout => {
    const dateKey = workout.completedAt
      ? getLocalDateString(new Date(workout.completedAt))
      : workout.created
      ? getLocalDateString(new Date(workout.created))
      : today;
    return dateKey.slice(0, 7) === monthKey;
  }).length;

  const foodLogsByDate: Record<string, FoodLogEntry[]> = {};
  foodLogs.forEach(log => {
    if (!log.date) return;
    if (!foodLogsByDate[log.date]) {
      foodLogsByDate[log.date] = [];
    }
    foodLogsByDate[log.date].push(log);
  });
  const dietDays = Object.keys(foodLogsByDate).length;

  const currentDiet = diets.length ? diets[0] : null;
  let deficitDays = 0;
  if (currentDiet) {
    Object.values(foodLogsByDate).forEach(logs => {
      const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
      if (totalCalories <= currentDiet.dailyCalories) {
        deficitDays += 1;
      }
    });
  }

  const sortedResults = [...results].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );
  let weightLoss = 0;
  if (sortedResults.length > 1) {
    const startWeight = sortedResults[0].weight;
    const lastWeight = sortedResults[sortedResults.length - 1].weight;
    if (startWeight && lastWeight) {
      weightLoss = Math.max(0, startWeight - lastWeight);
    }
  }

  const conditionMap: Record<string, number> = {
    run_count: runsCount,
    run_distance: maxRunDistance,
    run_pace: bestPace <= 330 ? 1 : 0,
    run_month_km: runsMonthKm,
    workout_streak: workoutStreak,
    workout_month: workoutsThisMonth,
    diet_days: dietDays,
    diet_deficit: deficitDays,
    weight_loss: weightLoss
  };

  const unlocked: Achievement[] = [];

  const updated = achievements.map(achievement => {
    const progress = conditionMap[achievement.condition] ?? 0;
    const cappedProgress = Math.min(progress, achievement.goal);
    const alreadyUnlocked = Boolean(achievement.unlockedAt);

    const nextAchievement: Achievement = {
      ...achievement,
      progressCurrent: cappedProgress,
      unlocked: alreadyUnlocked
    };

    if (!alreadyUnlocked && progress >= achievement.goal) {
      const now = new Date().toISOString();
      nextAchievement.unlocked = true;
      nextAchievement.unlockedAt = now;
      unlocked.push(nextAchievement);
    }

    return nextAchievement;
  });

  return {
    achievements: updated,
    unlocked
  };
}

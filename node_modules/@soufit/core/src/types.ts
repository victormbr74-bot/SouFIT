export interface PointsConfig {
  dailyQuest: number;
  workout: number;
  runPerKm: number;
  runDailyCap: number;
  weightLog: number;
}

export interface DailyQuest {
  id: number;
  name: string;
  description: string;
  rewardPoints: number;
  type: 'workout' | 'diet' | 'measurement' | 'generic';
  completed: boolean;
  dateAssigned: string;
  completedAt?: string;
}

export type AchievementCondition =
  | 'run_count'
  | 'run_distance'
  | 'run_pace'
  | 'run_month_km'
  | 'workout_streak'
  | 'workout_month'
  | 'diet_days'
  | 'diet_deficit'
  | 'weight_loss';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon?: string;
  condition: AchievementCondition;
  progressCurrent: number;
  goal: number;
  rewardPoints?: number;
  unlockedAt?: string | null;
  unlocked?: boolean;
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  description: string;
  deltaPoints: number;
  metaInfo?: Record<string, unknown> | null;
  dateTimeISO: string;
}

export type RunType = 'outdoor' | 'treadmill' | 'manual';
export type RunDataQuality = 'raw' | 'estimated';

export interface RunEntry {
  id: string;
  dateTimeISO: string;
  dateKey: string;
  distanceKm: number;
  timeSeconds: number;
  avgPaceSecPerKm: number;
  avgSpeedKmh: number;
  notes?: string;
  pointsEarned: number;
  runType?: RunType;
  dataQuality?: RunDataQuality;
}

export interface RunFilters {
  rangeDays: number;
  minDistance: number;
  sortBy: 'date_desc' | 'date_asc' | 'pace_asc' | 'speed_desc' | 'distance_desc';
}

export interface RunStoragePayload {
  version: number;
  runs: RunEntry[];
}

export interface WorkoutEntry {
  id: string | number;
  name: string;
  day?: string;
  duration?: string;
  completed?: boolean;
  created?: string;
  completedAt?: string;
}

export interface WeightEntry {
  id: string | number;
  date: string;
  dateISO: string;
  dateKey: string;
  weight: number;
  bmi?: number;
}

export interface FoodLogEntry {
  id: string;
  date: string;
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal?: string;
  time?: string;
}

export interface MealFood {
  id: number;
  name: string;
  quantity: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface Meal {
  id: number;
  name: string;
  time: string;
  foods: MealFood[];
}

export interface DietPlan {
  id: string | number;
  name: string;
  description: string;
  meals: Meal[];
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export interface HunterLevelState {
  points: number;
  totalPoints: number;
  rank: string;
  achievements: number[];
  currentStreak: number;
  lastActiveDate: string | null;
  lastCheckedDate: string | null;
  dailyPenaltyAppliedDate: string | null;
  totalWorkouts: number;
  totalFoodLogged: number;
  totalCalories: number;
}

import {
  addDaysToDateString,
  generateDefaultDailyQuests,
  reconcileDailyQuests,
  registerDailyActivity,
  StreakState,
  HunterLevelState
} from '@soufit/core';

const [,, countArg, startArg] = process.argv;
const totalDays = Math.max(1, Number(countArg) || 7);
const startDate = startArg || new Date().toISOString().slice(0, 10);

let streakState: StreakState = {
  currentStreak: 0,
  lastActiveDate: null,
  lastCheckedDate: null,
  dailyPenaltyAppliedDate: null
};

let hunterState: HunterLevelState = {
  points: 0,
  totalPoints: 0,
  rank: 'E1',
  achievements: [],
  currentStreak: 0,
  lastActiveDate: null,
  lastCheckedDate: null,
  dailyPenaltyAppliedDate: null,
  totalWorkouts: 0,
  totalFoodLogged: 0,
  totalCalories: 0
};

let dailyQuests = generateDefaultDailyQuests(startDate);

console.log(`Simulando ${totalDays} dias a partir de ${startDate}`);

for (let day = 0; day < totalDays; day += 1) {
  const currentDate = addDaysToDateString(startDate, day);
  streakState = registerDailyActivity(streakState, currentDate);
  hunterState = {
    ...hunterState,
    currentStreak: streakState.currentStreak,
    lastActiveDate: streakState.lastActiveDate
  };

  const result = reconcileDailyQuests({
    dailyQuests,
    hunter: hunterState,
    today: currentDate
  });

  hunterState = result.hunter;
  dailyQuests = result.dailyQuests;

  const completed = dailyQuests.filter(quest => quest.completed).length;
  console.log(
    `[${currentDate}] Streak: ${hunterState.currentStreak} | Penalidade: ${
      result.penaltyApplied ? 'sim' : 'não'
    } | Missões concluídas: ${completed}`
  );
}

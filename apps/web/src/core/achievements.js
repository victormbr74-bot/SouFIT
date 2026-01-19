(function() {
    const core = window.SoufitCore = window.SoufitCore || {};
    const dates = core.dates;

    function normalizeAchievements(list) {
        if (!Array.isArray(list)) return [];
        return list.map(item => ({
            ...item,
            progressCurrent: Number.isFinite(item.progressCurrent) ? item.progressCurrent : 0,
            unlockedAt: item.unlockedAt || null
        }));
    }

    function getLongestConsecutiveStreak(dateList) {
        if (!dateList.length) return 0;
        let longest = 1;
        let current = 1;

        for (let i = 1; i < dateList.length; i += 1) {
            const diff = dates.diffDays(dateList[i - 1], dateList[i]);
            if (diff === 1) {
                current += 1;
            } else if (diff > 1) {
                longest = Math.max(longest, current);
                current = 1;
            }
        }
        return Math.max(longest, current);
    }

    function resolveDateKey(input) {
        if (!input) return null;
        if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
            return input;
        }
        const dateObj = input instanceof Date ? input : new Date(input);
        if (Number.isNaN(dateObj.getTime())) return null;
        return dates.toISODateLocal(dateObj);
    }

    function computeAchievementProgress(params) {
        const {
            achievements,
            runs = [],
            workouts = [],
            foodLogs = [],
            diets = [],
            results = [],
            todayISO = dates.toISODateLocal()
        } = params;

        const normalized = normalizeAchievements(achievements);
        const nowISO = new Date().toISOString();

        const runsCount = runs.length;
        const maxRunDistance = runsCount ? Math.max(...runs.map(run => run.distanceKm || 0)) : 0;
        const bestPace = runsCount ? Math.min(...runs.map(run => run.avgPaceSecPerKm || Infinity)) : Infinity;

        const monthKey = todayISO.slice(0, 7);
        const runsMonthKm = runs.reduce((sum, run) => {
            const runDateKey = resolveDateKey(run.dateTimeISO || run.dateKey || run.dateISO);
            if (!runDateKey) return sum;
            return runDateKey.slice(0, 7) === monthKey ? sum + (run.distanceKm || 0) : sum;
        }, 0);

        const completedWorkouts = workouts.filter(workout => workout.completed);
        const workoutDates = Array.from(new Set(completedWorkouts.map(workout => {
            if (workout.completedAt) return resolveDateKey(workout.completedAt);
            if (workout.created) return resolveDateKey(workout.created);
            return resolveDateKey(new Date());
        }).filter(Boolean))).sort();
        const workoutStreak = getLongestConsecutiveStreak(workoutDates);
        const workoutsThisMonth = completedWorkouts.filter(workout => {
            const workoutDateKey = workout.completedAt ? resolveDateKey(workout.completedAt) : resolveDateKey(workout.created);
            return workoutDateKey && workoutDateKey.slice(0, 7) === monthKey;
        }).length;

        const foodLogsByDate = {};
        foodLogs.forEach(log => {
            const dateKey = resolveDateKey(log.date);
            if (!dateKey) return;
            if (!foodLogsByDate[dateKey]) foodLogsByDate[dateKey] = [];
            foodLogsByDate[dateKey].push(log);
        });
        const dietDays = Object.keys(foodLogsByDate).length;

        let deficitDays = 0;
        const currentDiet = diets.length ? diets[0] : null;
        if (currentDiet) {
            Object.values(foodLogsByDate).forEach(logs => {
                const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
                if (totalCalories <= currentDiet.dailyCalories) deficitDays += 1;
            });
        }

        const parsedResults = results.map(result => {
            const dateKey = result.dateKey || resolveDateKey(result.dateISO || result.date);
            return {
                dateKey,
                weight: Number(result.weight)
            };
        }).filter(entry => entry.dateKey && Number.isFinite(entry.weight));
        parsedResults.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
        let weightLoss = 0;
        if (parsedResults.length > 1) {
            const startWeight = parsedResults[0].weight;
            const lastWeight = parsedResults[parsedResults.length - 1].weight;
            if (startWeight && lastWeight) {
                weightLoss = Math.max(0, startWeight - lastWeight);
            }
        }

        const conditionMap = {
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

        const unlockedNow = [];

        normalized.forEach(achievement => {
            const progress = conditionMap[achievement.condition] !== undefined ? conditionMap[achievement.condition] : 0;
            achievement.progressCurrent = Math.min(progress, achievement.goal);
            achievement.unlocked = Boolean(achievement.unlockedAt);

            if (!achievement.unlocked && progress >= achievement.goal) {
                achievement.unlockedAt = nowISO;
                achievement.unlocked = true;
                unlockedNow.push(achievement);
            }
        });

        return {
            achievements: normalized,
            unlocked: unlockedNow
        };
    }

    core.achievements = {
        normalizeAchievements,
        computeAchievementProgress
    };
})();

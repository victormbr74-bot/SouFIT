(function() {
    const core = window.SoufitCore = window.SoufitCore || {};
    const dates = core.dates;

    function generateDefaultDailyQuests(dateAssigned) {
        const dateISO = dateAssigned || dates.toISODateLocal();
        const pointsConfig = core.points?.getPointsConfig ? core.points.getPointsConfig() : null;
        const rewardPoints = pointsConfig ? pointsConfig.dailyQuest : 25;
        return [
            { id: 1, name: 'Treino Diario', description: 'Complete 1 treino', rewardPoints: rewardPoints, completed: false, type: 'workout', dateAssigned: dateISO },
            { id: 2, name: 'Nutricao Perfeita', description: 'Registre 3 refeicoes', rewardPoints: rewardPoints, completed: false, type: 'diet', dateAssigned: dateISO },
            { id: 3, name: 'Meta de Calorias', description: 'Atinga 80% da meta calorica', rewardPoints: rewardPoints, completed: false, type: 'diet', dateAssigned: dateISO },
            { id: 4, name: 'Medicao', description: 'Registre seu peso atual', rewardPoints: rewardPoints, completed: false, type: 'measurement', dateAssigned: dateISO }
        ];
    }

    function reconcileDailyState(params) {
        const {
            todayISO,
            dailyQuests,
            hunter,
            generateMissions,
            penaltyPoints = -10
        } = params;

        if (!todayISO || !hunter) {
            return {
                dailyQuests: dailyQuests || [],
                hunter,
                penaltyApplied: false,
                penaltyPoints: 0
            };
        }

        const lastChecked = hunter.lastCheckedDate || todayISO;
        const needsReset = !dailyQuests?.length || dailyQuests.some(quest => quest.dateAssigned !== todayISO);
        if (lastChecked === todayISO && !needsReset) {
            return {
                dailyQuests,
                hunter,
                penaltyApplied: false,
                penaltyPoints: 0
            };
        }

        const lastAssigned = dailyQuests?.length ? dailyQuests[0].dateAssigned : null;
        const hasPendingLastAssigned = dailyQuests?.some(quest => !quest.completed) || false;

        let penaltyApplied = false;
        let updatedHunter = { ...hunter };

        if (lastAssigned && lastAssigned !== todayISO && hasPendingLastAssigned) {
            if (hunter.dailyPenaltyAppliedDate !== todayISO) {
                penaltyApplied = true;
                updatedHunter.dailyPenaltyAppliedDate = todayISO;
            }
        }

        updatedHunter.lastCheckedDate = todayISO;
        updatedHunter = core.streak.reconcileStreak(updatedHunter, todayISO);

        const nextMissions = needsReset && typeof generateMissions === 'function'
            ? generateMissions(todayISO)
            : dailyQuests;

        return {
            dailyQuests: nextMissions,
            hunter: updatedHunter,
            penaltyApplied,
            penaltyPoints: penaltyApplied ? penaltyPoints : 0
        };
    }

    core.missions = {
        generateDefaultDailyQuests,
        reconcileDailyState
    };
})();

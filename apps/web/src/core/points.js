(function() {
    const core = window.SoufitCore = window.SoufitCore || {};
    const DEFAULT_CONFIG = {
        dailyQuest: 25,
        workout: 50,
        runPerKm: 10,
        runDailyCap: 120,
        weightLog: 5
    };

    function getPointsConfig() {
        return { ...DEFAULT_CONFIG };
    }

    function applyPoints(hunter, amount) {
        if (!hunter || !Number.isFinite(amount) || amount === 0) return hunter;
        const points = Math.max(0, (hunter.points || 0) + amount);
        const totalPoints = Math.max(0, (hunter.totalPoints || 0) + amount);
        return {
            ...hunter,
            points,
            totalPoints
        };
    }

    function computeRunPoints(distanceKm, alreadyEarned, perKm, dailyCap) {
        const base = Math.max(0, Math.round((distanceKm || 0) * (perKm || 0)));
        const earnedSoFar = Math.max(0, Number(alreadyEarned) || 0);
        const cap = Math.max(0, Number(dailyCap) || 0);
        const available = Math.max(cap - earnedSoFar, 0);
        return {
            base,
            available,
            earned: Math.min(base, available)
        };
    }

    core.points = {
        getPointsConfig,
        applyPoints,
        computeRunPoints
    };
})();

(function() {
    const core = window.SoufitCore = window.SoufitCore || {};
    const dates = core.dates;

    function registerDailyActivity(hunter, dateISO) {
        if (!hunter) return hunter;
        if (!dateISO) return hunter;
        if (hunter.lastActiveDate === dateISO) return hunter;

        const yesterday = dates.addDays(dateISO, -1);
        const nextStreak = hunter.lastActiveDate === yesterday ? (hunter.currentStreak || 0) + 1 : 1;

        return {
            ...hunter,
            currentStreak: nextStreak,
            lastActiveDate: dateISO
        };
    }

    function reconcileStreak(hunter, todayISO) {
        if (!hunter) return hunter;
        if (!hunter.lastActiveDate) return hunter;

        const yesterday = dates.addDays(todayISO, -1);
        if (hunter.lastActiveDate !== yesterday) {
            return {
                ...hunter,
                currentStreak: 0
            };
        }
        return hunter;
    }

    function isDateInStreak(dateISO, hunter) {
        if (!hunter || !hunter.lastActiveDate || !hunter.currentStreak) return false;
        const start = dates.addDays(hunter.lastActiveDate, -(hunter.currentStreak - 1));
        return dateISO >= start && dateISO <= hunter.lastActiveDate;
    }

    function getLongestConsecutiveStreak(dateList) {
        if (!dateList || !dateList.length) return 0;
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

    core.streak = {
        registerDailyActivity,
        reconcileStreak,
        isDateInStreak,
        getLongestConsecutiveStreak
    };
})();

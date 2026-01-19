(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function getRankFromPoints(points) {
        const normalized = Math.max(0, Math.floor(points || 0));
        const rankLetters = ['E', 'D', 'C', 'B', 'A', 'S'];
        const rankSize = 2500;
        const subLevelSize = 500;
        const rankIndex = Math.min(rankLetters.length - 1, Math.floor(normalized / rankSize));
        const rankStart = rankIndex * rankSize;
        const pointsInRank = normalized - rankStart;
        const subLevel = Math.min(5, Math.floor(pointsInRank / subLevelSize) + 1);
        const currentSubMin = rankStart + (subLevel - 1) * subLevelSize;
        const currentSubMax = currentSubMin + subLevelSize - 1;
        const progressInSub = normalized - currentSubMin;
        const isMaxRank = rankIndex === rankLetters.length - 1 && subLevel === 5;
        const nextThreshold = isMaxRank ? null : currentSubMin + subLevelSize;

        return {
            rankLetter: rankLetters[rankIndex],
            subLevel,
            currentSubMin,
            currentSubMax,
            progressInSub,
            nextThreshold
        };
    }

    core.ranks = {
        getRankFromPoints
    };
})();

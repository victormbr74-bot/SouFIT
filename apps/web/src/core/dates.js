(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function toISODateLocal(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function addDays(dateStr, days) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + days);
        return toISODateLocal(date);
    }

    function compareDateStrings(a, b) {
        if (!a || !b) return 0;
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }

    function diffDays(a, b) {
        if (!a || !b) return 0;
        const [ay, am, ad] = a.split('-').map(Number);
        const [by, bm, bd] = b.split('-').map(Number);
        const dateA = new Date(ay, am - 1, ad);
        const dateB = new Date(by, bm - 1, bd);
        const diffMs = dateB.getTime() - dateA.getTime();
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    }

    function isYesterday(candidate, reference) {
        return diffDays(candidate, reference) === 1;
    }

    core.dates = {
        toISODateLocal,
        addDays,
        compareDateStrings,
        diffDays,
        isYesterday
    };
})();

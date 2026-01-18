(function() {
    const core = window.SoufitCore = window.SoufitCore || {};
    const dates = core.dates;

    function validateRunInput(data) {
        if (!data || !data.dateValue) {
            return { valid: false, message: 'Informe a data e hora da corrida.' };
        }
        if (!data.distanceValue || data.distanceValue <= 0) {
            return { valid: false, message: 'Distancia invalida.' };
        }
        if (!data.timeSeconds || data.timeSeconds <= 0) {
            return { valid: false, message: 'Tempo invalido.' };
        }
        return { valid: true };
    }

    function normalizeRun(run) {
        if (!run) return null;
        const dateISO = run.dateTimeISO || run.dateISO || run.date;
        if (!dateISO) return null;
        const dateObj = new Date(dateISO);
        if (Number.isNaN(dateObj.getTime())) return null;

        const distanceKm = Number(run.distanceKm);
        const timeSeconds = Number(run.timeSeconds);
        if (!Number.isFinite(distanceKm) || distanceKm <= 0) return null;
        if (!Number.isFinite(timeSeconds) || timeSeconds <= 0) return null;

        return {
            id: run.id || `run-${Date.now()}`,
            dateTimeISO: dateObj.toISOString(),
            dateKey: run.dateKey || dates.toISODateLocal(dateObj),
            distanceKm: distanceKm,
            timeSeconds: timeSeconds,
            avgPaceSecPerKm: Number(run.avgPaceSecPerKm),
            avgSpeedKmh: Number(run.avgSpeedKmh),
            notes: run.notes || '',
            pointsEarned: Number(run.pointsEarned) || 0
        };
    }

    core.runs = {
        validateRunInput,
        normalizeRun
    };
})();

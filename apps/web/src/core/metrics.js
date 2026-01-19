(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function parseTimeToSeconds(input) {
        if (!input) return 0;
        const parts = String(input).trim().split(':').map(Number);
        if (parts.some(Number.isNaN)) return 0;
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        if (parts.length === 1) {
            return parts[0];
        }
        return 0;
    }

    function formatSecondsToTime(seconds) {
        const total = Math.max(0, Math.floor(seconds || 0));
        const hrs = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        if (hrs > 0) {
            return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    function calcPaceSecondsPerKm(timeSeconds, distanceKm) {
        if (!distanceKm || distanceKm <= 0) return 0;
        return Math.round((timeSeconds || 0) / distanceKm);
    }

    function calcSpeedKmh(timeSeconds, distanceKm) {
        if (!distanceKm || distanceKm <= 0 || !timeSeconds || timeSeconds <= 0) return 0;
        return (distanceKm / (timeSeconds / 3600));
    }

    core.metrics = {
        parseTimeToSeconds,
        formatSecondsToTime,
        calcPaceSecondsPerKm,
        calcSpeedKmh
    };
})();

(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function createActivityItem(data) {
        if (!data) return null;
        return {
            id: data.id || `activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type: data.type || 'generic',
            description: data.description || '',
            deltaPoints: Number.isFinite(data.deltaPoints) ? data.deltaPoints : 0,
            metaInfo: data.metaInfo || null,
            dateTimeISO: data.dateTimeISO || new Date().toISOString()
        };
    }

    core.activityFeed = {
        createActivityItem
    };
})();

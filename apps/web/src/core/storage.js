(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function getStorageVersion(key) {
        return localStorage.getItem(key);
    }

    function setStorageVersion(key, version) {
        localStorage.setItem(key, version);
    }

    function migrateStorage({ versionKey, targetVersion, migrate }) {
        const current = getStorageVersion(versionKey);
        if (current === targetVersion) return false;
        if (typeof migrate === 'function') {
            migrate(current, targetVersion);
        }
        setStorageVersion(versionKey, targetVersion);
        return true;
    }

    core.storage = {
        getStorageVersion,
        setStorageVersion,
        migrateStorage
    };
})();

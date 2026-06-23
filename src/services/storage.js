import { LOCALSTORAGE_KEYS } from '../constants';

// ─── Safe LocalStorage Service ───────────────────────────────────────────────
// All operations are wrapped in try/catch so the app never crashes on
// corrupted, missing, or quota-exceeded storage.

const storageService = {
    /**
     * Safely get a parsed value from localStorage.
     * @param {string} key
     * @param {*} defaultValue - fallback if key missing or parse fails
     */
    get(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (err) {
            console.warn(`[storageService] Failed to read key "${key}":`, err);
            return defaultValue;
        }
    },

    /**
     * Safely set a JSON-serialised value in localStorage.
     * Returns true on success, false on failure (e.g. quota exceeded).
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.warn(`[storageService] Failed to write key "${key}":`, err);
            return false;
        }
    },

    /**
     * Safely remove a key.
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.warn(`[storageService] Failed to remove key "${key}":`, err);
            return false;
        }
    },

    /**
     * Clear ALL finova-related keys.
     */
    clearAll() {
        try {
            Object.values(LOCALSTORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
            return true;
        } catch (err) {
            console.warn('[storageService] Failed to clear all:', err);
            return false;
        }
    },

    /**
     * Export all app data as a JSON blob for backup.
     */
    exportBackup() {
        const data = {};
        Object.entries(LOCALSTORAGE_KEYS).forEach(([name, key]) => {
            data[name] = storageService.get(key);
        });
        return {
            ...data,
            version: '2.0.0',
            exportedAt: new Date().toISOString(),
        };
    },

    /**
     * Restore from backup object.
     */
    importBackup(backup) {
        try {
            Object.entries(LOCALSTORAGE_KEYS).forEach(([name, key]) => {
                if (backup[name] !== undefined) {
                    storageService.set(key, backup[name]);
                }
            });
            return true;
        } catch (err) {
            console.error('[storageService] Restore failed:', err);
            return false;
        }
    },
};

export default storageService;

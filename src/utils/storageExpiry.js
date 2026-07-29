export const STORAGE_EXPIRY_MS = 1000 * 60 * 30;
export const STORAGE_LAST_UPDATED_KEY = 'last_updated';

export const EXPIRING_CALCULATOR_STORAGE_KEYS = [
    'time',
    'distance',
    'region',
    'regions',
    'address',
    'duration',
    'weight',
    'options',
    'vehicle',
    'mapDistance',
    'price',
    'orderTotal',
];

export function expireCalculatorStorageIfNeeded(
    storage,
    now = Date.now(),
) {
    const lastUpdated = Number.parseInt(
        storage.getItem(STORAGE_LAST_UPDATED_KEY),
        10,
    );
    if (!Number.isFinite(lastUpdated) || now - lastUpdated <= STORAGE_EXPIRY_MS) {
        return false;
    }

    EXPIRING_CALCULATOR_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
    storage.setItem(STORAGE_LAST_UPDATED_KEY, now.toString());
    return true;
}

export function legacyStorageExpiryGuardScript() {
    const keys = JSON.stringify(EXPIRING_CALCULATOR_STORAGE_KEYS);

    return `(() => {
        const lastUpdatedKey = ${JSON.stringify(STORAGE_LAST_UPDATED_KEY)};
        const expiryMs = ${STORAGE_EXPIRY_MS};
        const lastUpdated = Number.parseInt(localStorage.getItem(lastUpdatedKey), 10);
        if (Number.isFinite(lastUpdated) && Date.now() - lastUpdated > expiryMs) {
            ${keys}.forEach((key) => localStorage.removeItem(key));
            localStorage.setItem(lastUpdatedKey, Date.now().toString());
        }
    })();`;
}

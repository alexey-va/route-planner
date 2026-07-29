import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    EXPIRING_CALCULATOR_STORAGE_KEYS,
    STORAGE_EXPIRY_MS,
    STORAGE_LAST_UPDATED_KEY,
    expireCalculatorStorageIfNeeded,
    legacyStorageExpiryGuardScript,
} from './storageExpiry';

describe('calculator storage expiry', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('expires only calculator form state and preserves long-lived browser data', () => {
        const now = 2_000_000;
        localStorage.setItem(
            STORAGE_LAST_UPDATED_KEY,
            (now - STORAGE_EXPIRY_MS - 1).toString(),
        );
        EXPIRING_CALCULATOR_STORAGE_KEYS.forEach((key) => {
            localStorage.setItem(key, `stale-${key}`);
        });
        localStorage.setItem('route-planner-telemetry-client', 'stable-client');
        localStorage.setItem('calculation_history', 'saved-history');
        localStorage.setItem('route_recent_addresses', 'saved-addresses');

        expect(expireCalculatorStorageIfNeeded(localStorage, now)).toBe(true);

        EXPIRING_CALCULATOR_STORAGE_KEYS.forEach((key) => {
            expect(localStorage.getItem(key)).toBeNull();
        });
        expect(localStorage.getItem(STORAGE_LAST_UPDATED_KEY)).toBe(now.toString());
        expect(localStorage.getItem('route-planner-telemetry-client')).toBe('stable-client');
        expect(localStorage.getItem('calculation_history')).toBe('saved-history');
        expect(localStorage.getItem('route_recent_addresses')).toBe('saved-addresses');
    });

    it('leaves all storage untouched before the expiry threshold', () => {
        const now = 2_000_000;
        localStorage.setItem(
            STORAGE_LAST_UPDATED_KEY,
            (now - STORAGE_EXPIRY_MS).toString(),
        );
        localStorage.setItem('weight', '500');

        expect(expireCalculatorStorageIfNeeded(localStorage, now)).toBe(false);
        expect(localStorage.getItem('weight')).toBe('500');
    });

    it('generates a legacy guard without a global storage clear', () => {
        const script = legacyStorageExpiryGuardScript();

        expect(script).not.toContain('localStorage.clear');
        EXPIRING_CALCULATOR_STORAGE_KEYS.forEach((key) => {
            expect(script).toContain(`"${key}"`);
        });
    });
});

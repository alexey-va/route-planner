import { useCallback, useState } from 'react';

const STORAGE_KEY = 'route_planner_admin_unlocked';

export function useAdminAccess() {
    const [isUnlocked, setIsUnlocked] = useState(() => {
        try {
            return sessionStorage.getItem(STORAGE_KEY) === '1';
        } catch {
            return false;
        }
    });

    const unlock = useCallback(() => {
        setIsUnlocked(true);
        try {
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // ignore
        }
    }, []);

    const lock = useCallback(() => {
        setIsUnlocked(false);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    return { isUnlocked, unlock, lock };
}

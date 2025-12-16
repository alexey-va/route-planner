import { useState, useEffect } from 'react';

const STORAGE_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        // Check if storage has expired
        const lastUpdateDate = localStorage.getItem('last_updated');
        if (lastUpdateDate) {
            const currentDate = Date.now();
            const diff = currentDate - parseInt(lastUpdateDate, 10);
            if (diff > STORAGE_EXPIRY_MS) {
                localStorage.clear();
                return defaultValue;
            }
        }

        // Get stored value
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem('last_updated', Date.now().toString());
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}


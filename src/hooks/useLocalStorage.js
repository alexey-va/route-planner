import { useState, useEffect } from 'react';
import {
    expireCalculatorStorageIfNeeded,
    STORAGE_LAST_UPDATED_KEY,
} from '../utils/storageExpiry';

export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        if (expireCalculatorStorageIfNeeded(localStorage)) {
            return defaultValue;
        }

        // Get stored value
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_LAST_UPDATED_KEY, Date.now().toString());
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

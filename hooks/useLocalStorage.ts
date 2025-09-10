import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
    try {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error(`Error reading '${key}' from localStorage:`, error);
    }
    return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, defaultValue);
    });

    const setStoredValue = useCallback((newValue: T) => {
        try {
            const valueToStore = JSON.stringify(newValue);
            localStorage.setItem(key, valueToStore);
            // Manually dispatch a storage event so other components on the same page can react
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: valueToStore }));
            setValue(newValue);
        } catch (error) {
             console.error(`Error saving '${key}' to localStorage:`, error);
        }
    }, [key]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                     setValue(JSON.parse(e.newValue));
                } catch(error){
                    console.error(`Error parsing new value for '${key}' from storage event:`, error);
                }
            } else if (e.key === key && e.newValue === null) {
                 setValue(defaultValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, defaultValue]);

    return [value, setStoredValue];
}
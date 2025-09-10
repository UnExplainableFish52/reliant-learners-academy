// A generic function to get items from localStorage
export const getItems = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            // If a value exists in storage (even an empty array "[]"), parse and return it.
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error reading '${key}' from localStorage:`, error);
    }
    // Return the default value only if nothing is in storage or if there's a parsing error
    return defaultValue;
};

// A generic function to save items to localStorage
export const saveItems = <T>(key: string, items: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error(`Error saving '${key}' to localStorage:`, error);
    }
};

// Specific function for a single string value, like the email template
export const getItem = (key: string, defaultValue: string): string => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue || defaultValue;
    } catch (error) {
        console.error(`Error reading item '${key}' from localStorage:`, error);
        return defaultValue;
    }
};

export const setItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error setting item '${key}' in localStorage:`, error);
    }
};
import { useEffect, useState } from "react";

// Debounces a value: returns the latest input only after it has stopped changing
// for `delayMs`. Used to key the summary query so typing an address does not fire
// a request per keystroke.
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
};

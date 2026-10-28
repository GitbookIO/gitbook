'use client';

import React from 'react';

/**
 * Hook that returns the current time and updates it at the specified interval.
 * @param refreshInterval - The interval in milliseconds to refresh the time (default: 30 minutes)
 * @returns The current timestamp in milliseconds
 */
export function useNow(refreshInterval: number = 30 * 60 * 1000): number {
    const [now, setNow] = React.useState<number>(Date.now());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, refreshInterval);

        return () => {
            clearInterval(interval);
        };
    }, [refreshInterval]);

    return now;
}

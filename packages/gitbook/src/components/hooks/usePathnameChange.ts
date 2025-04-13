'use client';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useEventCallback } from 'usehooks-ts';
import { usePrevious } from './usePrevious';

/**
 * Returns the value of the previous render.
 */
export function usePathnameChange(callback: () => void): void {
    const pathname = usePathname();
    const previousPathname = usePrevious(pathname);
    const eventCallback = useEventCallback(callback);
    React.useEffect(() => {
        if (previousPathname !== undefined && pathname !== previousPathname) {
            eventCallback();
        }
    }, [pathname, previousPathname, eventCallback]);
}

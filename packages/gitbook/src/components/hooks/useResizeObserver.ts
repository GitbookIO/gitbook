'use client';

import * as React from 'react';

/**
 * Call `onResize` once the element is mounted and again whenever its size changes. Browsers
 * without `ResizeObserver` get the first call only.
 */
export function useResizeObserver(ref: React.RefObject<HTMLElement | null>, onResize: () => void) {
    const callback = React.useRef(onResize);
    React.useLayoutEffect(() => {
        callback.current = onResize;
    });

    React.useLayoutEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const run = () => callback.current();
        run();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(run);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);
}

'use client';

import * as React from 'react';

export function useIsMobile(breakpoint = 1024): boolean {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        // Use matchMedia for a single, efficient listener.
        // 0.02px fudge keeps it safely below the breakpoint (mirrors Tailwind’s 639.98px).
        const query = `(max-width: ${breakpoint - 0.02}px)`;
        const media = window.matchMedia(query);

        // Sync initial state if it differs (e.g., on hydration).
        setIsMobile(media.matches);

        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(event.matches);
        };

        media.addEventListener('change', handleChange);

        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, [breakpoint]);

    return isMobile;
}

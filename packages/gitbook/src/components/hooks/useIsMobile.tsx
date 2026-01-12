'use client';

import * as React from 'react';

export function useIsMobile(breakpoint = 1024, container?: string): boolean {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        if (container) {
            const containerElement = document.querySelector(container);
            if (containerElement) {
                const observer = new ResizeObserver((entries) => {
                    entries.forEach((entry) => {
                        console.log('checked', entry.contentRect.width < breakpoint);
                        setIsMobile(entry.contentRect.width < breakpoint);
                    });
                });
                observer.observe(containerElement);
                return () => observer.disconnect();
            }

            // Warn if no container was found.
            console.warn(
                `Container element not found: "${container}". Falling back to window resize listener.`
            );
        }

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
    }, [breakpoint, container]);

    return isMobile;
}

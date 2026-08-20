'use client';

import React from 'react';

const injected = new Set<string>();

/**
 * Injects tracking scripts after `load` + idle so they never compete with the critical path.
 */
export function DeferredTrackingScripts(props: { scripts: string[] }) {
    const { scripts } = props;

    React.useEffect(() => {
        let cancelled = false;

        const inject = () => {
            if (cancelled) {
                return;
            }
            for (const src of scripts) {
                if (injected.has(src)) {
                    continue;
                }
                injected.add(src);
                const element = document.createElement('script');
                element.async = true;
                element.src = src;
                document.head.appendChild(element);
            }
        };

        const onIdle = () => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(inject, { timeout: 4000 });
            } else {
                setTimeout(inject, 200);
            }
        };

        if (document.readyState === 'complete') {
            onIdle();
        } else {
            window.addEventListener('load', onIdle, { once: true });
        }

        return () => {
            cancelled = true;
            window.removeEventListener('load', onIdle);
        };
    }, [scripts]);

    return null;
}

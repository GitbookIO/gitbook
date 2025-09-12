'use client';

import { tcls } from '@/lib/tailwind';
import { useIsNavigating } from '../hooks';

export function NavigationLoader() {
    const isNavigating = useIsNavigating();
    if (!isNavigating) {
        return null;
    }
    return (
        <div
            className={tcls(
                'w-full',
                'h-1',
                'relative',
                'inline-block',
                'overflow-hidden',
                'bg-info'
            )}
        >
            <span
                className={tcls(
                    'w-24',
                    'h-1',
                    'absolute',
                    'bg-primary-original',
                    'top-0',
                    'left-0',
                    'box-border',
                    'rounded-md',
                    'animate-progress-loader'
                )}
            />
        </div>
    );
}

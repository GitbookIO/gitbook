'use client';
import { tcls } from '@/lib/tailwind';
import { useIsNavigating } from '../hooks';

export const NavigationLoader = () => {
    const isNavigating = useIsNavigating();

    return (
        <div
            className={tcls(
                'pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden',
                isNavigating ? 'block' : 'hidden animate-fade-out-slow'
            )}
        >
            <div
                className={tcls(
                    'h-full w-full origin-left animate-crawl bg-primary-solid theme-bold:bg-header-link'
                )}
            />
        </div>
    );
};

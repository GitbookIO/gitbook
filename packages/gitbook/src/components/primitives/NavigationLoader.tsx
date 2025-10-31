'use client';
import { tcls } from '@/lib/tailwind';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';
import { useIsNavigating } from '../hooks';

export const NavigationLoader = () => {
    const isNavigating = useIsNavigating();
    const pathname = usePathname();

    // Mark client hydration so initial paint doesn't animate.
    useEffect(() => {
        document.documentElement.classList.add('hydrated');
    }, []);

    // On route changes, add a transient class for the first paint of the new page.
    useLayoutEffect(() => {
        void pathname;
        const root = document.documentElement;
        root.classList.add('route-change');
        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => {
                root.classList.remove('route-change');
            });
            return () => cancelAnimationFrame(raf2);
        });
        return () => cancelAnimationFrame(raf1);
    }, [pathname]);

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

'use client';

import { Loading } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import { useIsLoadingPage } from '../state';

/**
 * When navigating between pages, display an overlay on top of the page.
 */
export function PageLoading(props: {}) {
    const loading = useIsLoadingPage();

    return (
        <div className={tcls('absolute', 'grid', 'inset-0', 'pointer-events-none')}>
            <div
                className={tcls(
                    'grid-area-1-1',
                    'bg-light',
                    'grid',
                    loading ? 'opacity-8' : ['opacity-0'],
                    'transition-opacity',
                    'dark:bg-dark',
                )}
            ></div>
            <div
                className={tcls(
                    'grid-area-1-1',
                    'flex',
                    'sticky',
                    'top-0',
                    'h-[100vh]',
                    'items-center',
                    'justify-center',
                    'transition-opacity',
                    loading ? 'opacity-[1]' : ['opacity-0'],
                )}
            >
                <Loading className={tcls('w-6', 'text-primary')} />
            </div>
        </div>
    );
}

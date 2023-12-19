'use client';

import { tcls } from '@/lib/tailwind';

import { useIsLoadingPage } from '../state';
import { Loading } from '../utils/Loading';

/**
 * When navigating between pages, display an overlay on top of the page.
 */
export function PageLoading(props: {}) {
    const loading = useIsLoadingPage();

    return (
        <div
            className={tcls(
                'absolute',
                'flex',
                'items-start',
                'justify-center',
                'inset-0',
                'bg-white',
                loading ? 'opacity-6' : ['opacity-0', 'pointer-events-none'],
                'transition-opacity',
            )}
        >
            <div
                className={tcls(
                    'mt-11',
                    'w-12',
                    'h-12',
                    'rounded-full',
                    'bg-white',
                    'flex',
                    'items-center',
                    'justify-center',
                )}
            >
                <Loading className={tcls('w-8', 'text-primary')} />
            </div>
        </div>
    );
}

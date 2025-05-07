'use client';

import { tcls } from '@/lib/tailwind';
import { AIPageSummary } from './AIPageSummary';
import { useAdaptiveContext } from './AdaptiveContext';
import { AdaptivePaneHeader } from './AdaptivePaneHeader';
export function AdaptivePane() {
    const { toggle } = useAdaptiveContext();

    return (
        <div
            className={tcls(
                'flex shrink-0 flex-col gap-4 overflow-x-hidden rounded-md straight-corners:rounded-none bg-tint-subtle ring-1 ring-tint-subtle ring-inset transition-all duration-300',
                toggle.open ? 'max-h px-4 py-4 xl:w-72' : 'px-4 py-3 xl:w-56'
            )}
        >
            <AdaptivePaneHeader />
            <AIPageSummary />
        </div>
    );
}

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
                'flex flex-col gap-4 rounded-md straight-corners:rounded-none bg-tint-subtle ring-1 ring-tint-subtle ring-inset transition-all duration-300',
                toggle.open ? 'w-72 px-4 py-4' : 'w-56 px-4 py-3'
            )}
        >
            <AdaptivePaneHeader />
            <AIPageSummary />
            {/* <AIPageJourneySuggestions />
            <AINextPageSuggestions /> */}
        </div>
    );
}

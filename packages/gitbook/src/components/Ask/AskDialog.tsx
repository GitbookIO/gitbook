'use client';

import { tcls } from '@/lib/tailwind';
import { useAskState } from './state';

export function AskDialog() {
    const state = useAskState();

    if (!state.opened) {
        return null;
    }

    return (
        <div
            role="dialog"
            className={`ask-dialog ${tcls(
                'z-40',
                'fixed',
                'top-3',
                'right-3',
                'bottom-3',
                'w-[480px]',
                'flex',
                'flex-col',
                'bg-tint-base',
                'rounded-lg',
                'straight-corners:rounded-sm',
                'circular-corners:rounded-2xl',
                'ring-1',
                'ring-tint',
                'shadow-2xl',
                'depth-flat:shadow-none',
                'overflow-hidden',
                'dark:ring-inset',
                'dark:ring-tint'
            )})`}
        >
            {/* <div>
            <h1>{state.session.title}</h1>
        </div> */}
        </div>
    );
}

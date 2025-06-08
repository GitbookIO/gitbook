'use client';

import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';
import { AskInput } from './AskInput';
import { useAskController, useAskState } from './state';

export function AskDialog() {
    const state = useAskState();
    const controller = useAskController();

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
            <div className="flex flex-row">
                <div className="flex-1"></div>
                <div className="p-2">
                    <Button
                        variant="blank"
                        icon="close"
                        iconOnly
                        onClick={() => {
                            controller.close();
                        }}
                    />
                </div>
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-row">
                <AskInput />
            </div>
            {/* <div>
            <h1>{state.session.title}</h1>
        </div> */}
        </div>
    );
}

import { tcls } from '@/lib/tailwind';
import { Space } from '@gitbook/api';
import { ThemeToggler } from '../ThemeToggler';
import React from 'react';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '../layout';

export function Footer(props: { space: Space; asFullWidth: boolean }) {
    const { space, asFullWidth } = props;

    return (
        <div
            className={tcls(
                'border-t',
                'border-slate-200',
                'dark:border-slate-800',
                'bg-slate-50',
                'dark:bg-slate-900',
                'px-4',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],

                    'py-6',
                )}
            >
                <div className={tcls('flex-1')} />
                <div>
                    <React.Suspense fallback={null}>
                        <ThemeToggler space={space} />
                    </React.Suspense>
                </div>
            </div>
        </div>
    );
}

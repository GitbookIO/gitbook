import { tcls } from '@/lib/tailwind';
import type { ComponentPropsWithRef } from 'react';

export function AIToolContainer(props: ComponentPropsWithRef<'div'>) {
    return (
        <div
            {...props}
            className={tcls(
                'min-h-0 animate-present-slow circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-subtle p-2',
                props.className
            )}
            style={{ animationDelay: '0.5s', ...props.style }}
        />
    );
}

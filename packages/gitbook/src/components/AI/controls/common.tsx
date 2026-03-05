import { tcls } from '@/lib/tailwind';
import type { ComponentPropsWithRef } from 'react';

export function AIToolContainer(props: ComponentPropsWithRef<'div'>) {
    return (
        <div
            {...props}
            className={tcls('animate-present-slow', props.className)}
            style={{ animationDelay: '0.5s', ...props.style }}
        />
    );
}

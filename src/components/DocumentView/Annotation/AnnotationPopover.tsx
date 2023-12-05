'use client';

import * as Popover from '@radix-ui/react-popover';
import React from 'react';

import { tcls } from '@/lib/tailwind';

export function AnnotationPopover(props: { children: React.ReactNode; body: React.ReactNode }) {
    const { children, body } = props;

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={tcls('underline', 'decoration-dotted', 'decoration-2')}>
                    {children}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={tcls(
                        'max-w-80',
                        'bg-white',
                        'rounded',
                        'shadow',
                        'p-3',
                        'border',
                        'border-dark',
                    )}
                    sideOffset={5}
                >
                    {body}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

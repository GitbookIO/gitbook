'use client';

import { Icon } from '@gitbook/icons';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React from 'react';

import { tcls } from '@/lib/tailwind';

export const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={tcls(
            'peer',
            'h-4',
            'w-4',
            'shrink-0',
            'rounded-sm',
            'ring-1',
            'bg-primary-300/1',
            'ring-dark/3',
            'ring-inset',
            'grid',
            'place-items-center',
            'data-[state=checked]:bg-primary-300/6',
            '[&>*:has(svg)]:absolute',
            'dark:bg-primary-100/[0.02]',
            'dark:ring-light/3',
            'dark:data-[state=checked]:bg-primary-300/4',
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={tcls(
                'flex',
                'items-center',
                'justify-center',
                'text-opacity-[1]',
                'text-primary-800',
                'grid-area-1-1',
                'z-[1]',
                'relative',
                'dark:text-primary-200',
            )}
        >
            {props.checked ? <Icon icon="check" className={'size-3'} /> : null}
        </CheckboxPrimitive.Indicator>
        <div
            className={tcls(
                'flex',
                'items-center',
                'justify-center',
                'text-dark/4',
                'grid-area-1-1',
                'z-[0]',
                'relative',
                'dark:text-light/2',
            )}
        >
            {props.checked ? <Icon icon="check" className={'size-3'} /> : null}
        </div>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

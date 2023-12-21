'use client';

import Check from '@geist-ui/icons/check';
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
            'bg-dark/1',
            'ring-dark/3',
            'ring-inset',
            'grid',
            'place-items-center',
            '[&>*:has(svg)]:absolute',
            'dark:bg-light/2',
            'dark:ring-light/3',
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={tcls('flex', 'items-center', 'justify-center', 'text-current')}
        >
            <Check size={12} />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

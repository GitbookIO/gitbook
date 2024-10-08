'use client';

import { Icon, IconStyle } from '@gitbook/icons';
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
            'h-5',
            'w-5',
            'shrink-0',
            'rounded-sm',
            'straight-corners:rounded-none',
            'ring-1',
            'ring-dark/3',
            'ring-inset',
            'flex',
            'items-center',
            'justify-center',
            'data-[state=checked]:bg-primary-500',
            'data-[state=checked]:text-contrast-primary-500',
            'contrast-more:data-[state=checked]:bg-primary-600',
            'contrast-more:ring-dark',
            'dark:ring-light/3',
            'dark:contrast-more:ring-light/6',
            'dark:data-[state=checked]:bg-primary-500',
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className={tcls('relative', 'text-current')}>
            {props.checked ? (
                <Icon icon="check" iconStyle={IconStyle.Solid} className={'size-3'} />
            ) : null}
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

'use client';

import { Icon, IconStyle } from '@gitbook/icons';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React from 'react';

import { tcls } from '@/lib/tailwind';

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
    /**
     * The size of the checkbox.
     * @default medium
     */
    size?: 'small' | 'medium';
};

export const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
>(({ className, size = 'medium', ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={tcls(
            'peer',
            'shrink-0',
            'rounded-sm',
            'straight-corners:rounded-none',
            'ring-1',
            'ring-gray', // TODO @Zeno: Make transparent
            'ring-inset',
            'flex',
            'items-center',
            'justify-center',
            'data-[state=checked]:bg-primary-solid',
            'data-[state=checked]:text-contrast-primary',
            'contrast-more:data-[state=checked]:bg-primary-solid-hover',
            'contrast-more:ring-gray-12',
            { small: 'size-4', medium: 'size-5' }[size],
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="relative text-current">
            {props.checked ? (
                <Icon icon="check" iconStyle={IconStyle.Solid} className={'size-3'} />
            ) : null}
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

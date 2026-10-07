'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

import { Icon, IconStyle } from '@gitbook/icons';

import { tcls } from '@/lib/tailwind';

export type CheckboxProps = Omit<BaseCheckbox.Root.Props, 'className'> & {
    className?: string;
    /**
     * The size of the checkbox.
     * @default medium
     */
    size?: 'small' | 'medium';
};

export function Checkbox({ className, size = 'medium', ...props }: CheckboxProps) {
    return (
        <BaseCheckbox.Root
            className={tcls(
                'peer',
                'shrink-0',
                'rounded-corners:rounded-sm',
                'circular-corners:rounded-md',
                'straight-corners:rounded-none',
                'ring-1',
                'ring-tint-12/4',
                'ring-inset',
                'flex',
                'items-center',
                'justify-center',
                'data-checked:bg-primary-original',
                'data-checked:text-contrast-primary-original',
                'contrast-more:ring-tint-12',
                { small: 'size-4', medium: 'size-5' }[size],
                className
            )}
            {...props}
        >
            <BaseCheckbox.Indicator className="relative text-current">
                <Icon icon="check" iconStyle={IconStyle.Solid} className="size-3" />
            </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
    );
}

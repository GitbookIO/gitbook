'use client';

import type { HTMLAttributeAnchorTarget, HTMLAttributes } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Icon, type IconName } from '@gitbook/icons';
import { Link, type LinkInsightsProps } from './Link';
import { useClassnames } from './StyleProvider';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary' | 'blank';
    icon?: IconName;
    iconOnly?: boolean;
    size?: 'default' | 'medium' | 'small';
    className?: ClassValue;
    label?: string;
} & LinkInsightsProps &
    HTMLAttributes<HTMLElement>;

export const variantClasses = {
    primary: [
        'bg-primary-solid',
        'text-contrast-primary-solid',
        'hover:bg-primary-solid-hover',
        'hover:text-contrast-primary-solid-hover',
        'ring-0',
        'contrast-more:ring-1',
    ],
    blank: [
        'bg-transparent',
        'text-tint',
        'ring-0',
        'shadow-none',
        'hover:bg-primary-hover',
        'hover:text-primary',
        'hover:scale-1',
        'hover:shadow-none',
        'contrast-more:bg-tint-subtle',
    ],
    secondary: [
        'bg-tint',
        'depth-flat:bg-transparent',
        'text-tint',
        'hover:bg-tint-hover',
        'depth-flat:hover:bg-tint-hover',
        'hover:text-primary',
        'contrast-more:bg-tint-subtle',
    ],
};

export function Button({
    href,
    variant = 'primary',
    size = 'default',
    className,
    insights,
    target,
    label,
    icon,
    iconOnly = false,
    ...rest
}: ButtonProps & { target?: HTMLAttributeAnchorTarget }) {
    const sizes = {
        default: ['text-base', 'font-semibold', 'px-5', 'py-2', 'circular-corners:px-6'],
        medium: ['text-sm', 'px-3.5', 'py-1.5', 'circular-corners:px-4'],
        small: ['text-xs', 'py-2', iconOnly ? 'px-2' : 'px-3'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(variantClasses[variant], sizeClasses, className);
    const buttonOnlyClassNames = useClassnames(['ButtonStyles']);

    if (href) {
        return (
            <Link
                href={href}
                className={domClassName}
                classNames={['ButtonStyles']}
                insights={insights}
                aria-label={label}
                target={target}
                {...rest}
            >
                {icon ? <Icon icon={icon} className={tcls('size-[1em]')} /> : null}
                {iconOnly ? null : label}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={tcls(domClassName, buttonOnlyClassNames)}
            aria-label={label}
            {...rest}
        >
            {icon ? <Icon icon={icon} className={tcls('size-[1em]')} /> : null}
            {iconOnly ? null : label}
        </button>
    );
}

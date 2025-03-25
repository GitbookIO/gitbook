'use client';

import type { HTMLAttributes } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Icon, type IconName } from '@gitbook/icons';
import { Link, type LinkInsightsProps } from './Link';

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

const variantClasses = {
    primary: [
        'bg-primary-solid',
        'text-contrast-primary-solid',
        'hover:bg-primary-solid-hover',
        'hover:text-contrast-primary-solid-hover',
        'ring-0',
        'contrast-more:ring-1',
    ],
    blank: [
        'bg-tint',
        'text-tint',
        'hover:bg-tint-hover',
        'hover:text-primary',
        'contrast-more:bg-tint-subtle',
    ],
    secondary: [
        'bg-tint',
        'text-tint',
        'hover:bg-tint-hover',
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
    label,
    icon,
    iconOnly = false,
    ...rest
}: ButtonProps) {
    const sizes = {
        default: ['text-base', 'px-4', 'py-2'],
        medium: ['text-sm', 'px-3', 'py-1.5'],
        small: ['text-xs', 'px-3 py-2'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(
        'button',
        'inline-flex',
        'rounded-md',
        'straight-corners:rounded-none',
        'place-self-start',

        'ring-1',
        'ring-tint',
        'hover:ring-tint-hover',

        'shadow-sm',
        'shadow-tint',
        'dark:shadow-tint-1',
        'hover:shadow-md',
        'active:shadow-none',

        'contrast-more:ring-tint-12',
        'contrast-more:hover:ring-2',
        'contrast-more:hover:ring-tint-12',

        'hover:scale-105',
        'active:scale-100',
        'transition-all',

        'grow-0',
        'shrink-0',
        'truncate',
        variantClasses[variant],
        sizeClasses,
        className
    );

    if (href) {
        return (
            <Link
                href={href}
                className={domClassName}
                insights={insights}
                aria-label={label}
                {...rest}
            >
                {icon ? <Icon icon={icon} className={tcls('size-4')} /> : null}
                {iconOnly ? null : label}
            </Link>
        );
    }

    return (
        <button type="button" className={domClassName} aria-label={label} {...rest}>
            {icon ? <Icon icon={icon} className={tcls('size-4')} /> : null}
            {iconOnly ? null : label}
        </button>
    );
}

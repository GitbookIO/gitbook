'use client';

import type { HTMLAttributes } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Link, type LinkInsightsProps } from './Link';

type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary';
    size?: 'default' | 'medium' | 'small';
    className?: ClassValue;
} & LinkInsightsProps &
    HTMLAttributes<HTMLElement>;

export function Button({
    href,
    children,
    variant = 'primary',
    size = 'default',
    className,
    insights,
    ...rest
}: ButtonProps) {
    const variantClasses =
        variant === 'primary'
            ? //PRIMARY
              [
                  'bg-primary-solid',
                  'text-contrast-primary-solid',
                  'hover:bg-primary-solid-hover',
                  'hover:text-contrast-primary-solid-hover',
                  'ring-0',
                  'contrast-more:ring-1',
              ]
            : // SECONDARY
              [
                  'bg-tint',
                  'text-tint',
                  'hover:bg-tint-hover',
                  'hover:text-primary',
                  'contrast-more:bg-tint-subtle',
              ];

    const sizes = {
        default: ['text-base', 'px-4', 'py-2'],
        medium: ['text-sm', 'px-3', 'py-1.5'],
        small: ['text-xs', 'px-3 py-2'],
    };

    const sizeClasses = sizes[size] || sizes.default;

    const domClassName = tcls(
        'button',
        'inline-block',
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
        variantClasses,
        sizeClasses,
        className
    );

    if (href) {
        return (
            <Link href={href} className={domClassName} insights={insights} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={domClassName} {...rest}>
            {children}
        </button>
    );
}

'use client';

import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { tcls, ClassValue } from '@/lib/tailwind';

import { Link, LinkInsightsProps } from './Link';

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
              ]
            : // SECONDARY
              [
                  'bg-tint-base',
                  'text-tint',
                  'hover:text-primary',
                  'contrast-more:bg-tint-subtle',
                  'contrast-more:hover:ring-primary',
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
        'ring-tint/5',
        'hover:ring-hover',

        'shadow-sm',
        'shadow-tint-subtle',
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
        className,
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
